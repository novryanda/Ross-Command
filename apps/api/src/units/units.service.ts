import { randomUUID } from 'crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ApiException } from '../common/utils/api-exception.util';
import {
  assignMemberSchema,
  createUnitSchema,
  transferMemberSchema,
  updateUnitSchema,
} from './units.schema';

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTree() {
    const [units, memberships] = await this.prisma.$transaction([
      this.prisma.unit.findMany({
        where: { deletedAt: null },
        include: {
          commander: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
        },
        orderBy: { path: 'asc' },
      }),
      this.prisma.unitMember.findMany({
        where: {
          removedAt: null,
          unit: { deletedAt: null },
          user: { deletedAt: null },
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
        },
      }),
    ]);

    const membershipMap = new Map<string, typeof memberships>();
    for (const membership of memberships) {
      const list = membershipMap.get(membership.unitId) ?? [];
      list.push(membership);
      membershipMap.set(membership.unitId, list);
    }

    const nodes = new Map<string, Record<string, unknown>>();

    for (const unit of units) {
      nodes.set(unit.id, {
        id: unit.id,
        name: unit.name,
        description: unit.description,
        path: unit.path,
        depthLevel: unit.depthLevel,
        leaderOnlyAssignments: unit.leaderOnlyAssignments,
        commander: unit.commander,
        directMembers:
          membershipMap.get(unit.id)?.map((membership) => ({
            id: membership.user.id,
            fullName: membership.user.fullName,
            username: membership.user.username,
            joinedAt: membership.joinedAt,
          })) ?? [],
        children: [],
      });
    }

    const roots: Record<string, unknown>[] = [];
    for (const unit of units) {
      const node = nodes.get(unit.id);
      if (!node) continue;

      if (unit.parentId) {
        const parent = nodes.get(unit.parentId);
        if (parent) {
          const children = parent.children as Record<string, unknown>[];
          children.push(node);
          continue;
        }
      }
      roots.push(node);
    }

    return roots;
  }

  async getUnit(unitId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id: unitId, deletedAt: null },
      include: {
        commander: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        memberships: {
          where: { removedAt: null },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!unit) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'NOT_FOUND',
        'Satuan tidak ditemukan',
      );
    }

    return {
      id: unit.id,
      name: unit.name,
      description: unit.description,
      path: unit.path,
      depthLevel: unit.depthLevel,
      leaderOnlyAssignments: unit.leaderOnlyAssignments,
      commander: unit.commander,
      parent: unit.parent,
      members: unit.memberships.map((membership) => ({
        id: membership.user.id,
        fullName: membership.user.fullName,
        username: membership.user.username,
        role: membership.user.role,
        joinedAt: membership.joinedAt,
      })),
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    };
  }

  async createUnit(body: unknown) {
    const parsed = createUnitSchema.parse(body);
    const id = randomUUID();

    const parent = parsed.parentId
      ? await this.getActiveUnit(parsed.parentId)
      : null;
    if (parsed.commanderId) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        'Pimpinan satuan hanya dapat dipilih setelah anggota ditambahkan ke satuan',
      );
    }
    if (parsed.leaderOnlyAssignments) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        'Pimpinan mewakili anggota hanya dapat diaktifkan setelah pimpinan satuan ditetapkan',
      );
    }

    await this.ensureSiblingNameAvailable(parsed.parentId ?? null, parsed.name);

    const path = parent ? `${parent.path}${id}/` : `/${id}/`;
    const depthLevel = parent ? parent.depthLevel + 1 : 0;

    const unit = await this.prisma.unit.create({
      data: {
        id,
        parentId: parsed.parentId ?? null,
        name: parsed.name,
        description: parsed.description,
        commanderId: null,
        leaderOnlyAssignments: false,
        path,
        depthLevel,
      },
    });

    return this.getUnit(unit.id);
  }

  async updateUnit(unitId: string, body: unknown) {
    const parsed = updateUnitSchema.parse(body);
    const current = await this.getActiveUnit(unitId);
    const parent =
      parsed.parentId === undefined
        ? current.parentId
          ? await this.getActiveUnit(current.parentId)
          : null
        : parsed.parentId
          ? await this.getActiveUnit(parsed.parentId)
          : null;

    if (parent && parent.id === unitId) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        'Satuan tidak boleh menjadi parent dirinya sendiri',
      );
    }

    if (parsed.commanderId) {
      await this.ensureDirectUnitMember(unitId, parsed.commanderId);
    }

    const nextCommanderId =
      parsed.commanderId === undefined
        ? current.commanderId
        : parsed.commanderId;
    const nextLeaderOnlyAssignments =
      parsed.leaderOnlyAssignments ??
      (nextCommanderId ? current.leaderOnlyAssignments : false);

    if (nextLeaderOnlyAssignments && !nextCommanderId) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        'Pimpinan mewakili anggota hanya dapat diaktifkan jika satuan memiliki pimpinan',
      );
    }

    if (parsed.name && parsed.name !== current.name) {
      await this.ensureSiblingNameAvailable(
        parent?.id ?? null,
        parsed.name,
        unitId,
      );
    }

    const nextPath = parent ? `${parent.path}${unitId}/` : `/${unitId}/`;
    const nextDepth = parent ? parent.depthLevel + 1 : 0;

    await this.prisma.unit.update({
      where: { id: unitId },
      data: {
        ...(parsed.name ? { name: parsed.name } : {}),
        ...(parsed.description !== undefined
          ? { description: parsed.description }
          : {}),
        ...(parsed.commanderId !== undefined
          ? { commanderId: parsed.commanderId }
          : {}),
        ...(parsed.leaderOnlyAssignments !== undefined ||
        (parsed.commanderId === null && current.leaderOnlyAssignments)
          ? { leaderOnlyAssignments: nextLeaderOnlyAssignments }
          : {}),
        ...(parsed.parentId !== undefined
          ? {
              parentId: parsed.parentId,
              path: nextPath,
              depthLevel: nextDepth,
            }
          : {}),
      },
    });

    if (parsed.parentId !== undefined && current.path !== nextPath) {
      const descendants = await this.prisma.unit.findMany({
        where: {
          deletedAt: null,
          path: {
            startsWith: current.path,
          },
          NOT: {
            id: unitId,
          },
        },
      });

      for (const descendant of descendants) {
        const replacementPath = descendant.path.replace(current.path, nextPath);
        const relativeDepth = descendant.depthLevel - current.depthLevel;
        await this.prisma.unit.update({
          where: { id: descendant.id },
          data: {
            path: replacementPath,
            depthLevel: nextDepth + relativeDepth,
          },
        });
      }
    }

    return this.getUnit(unitId);
  }

  async deleteUnit(unitId: string) {
    const unit = await this.getActiveUnit(unitId);
    const memberIds = await this.prisma.unitMember.findMany({
      where: {
        removedAt: null,
        unit: {
          path: {
            startsWith: unit.path,
          },
          deletedAt: null,
        },
      },
      distinct: ['userId'],
      select: { userId: true },
    });

    const pendingCount = memberIds.length
      ? await this.prisma.taskAssignment.count({
          where: {
            userId: {
              in: memberIds.map((membership) => membership.userId),
            },
            status: 'belum_dikerjakan',
            order: {
              status: {
                in: ['aktif', 'expired'],
              },
              deletedAt: null,
            },
          },
        })
      : 0;

    if (pendingCount > 0) {
      throw new ApiException(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'BUSINESS_RULE_VIOLATED',
        `Satuan tidak dapat dihapus karena masih ada ${pendingCount} assignment aktif`,
      );
    }

    await this.prisma.unit.updateMany({
      where: {
        path: {
          startsWith: unit.path,
        },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async assignMember(unitId: string, body: unknown) {
    const parsed = assignMemberSchema.parse(body);
    await this.getActiveUnit(unitId);
    await this.ensureActiveUser(parsed.userId);

    const currentMembership = await this.prisma.unitMember.findFirst({
      where: {
        userId: parsed.userId,
        removedAt: null,
      },
      orderBy: { joinedAt: 'desc' },
    });

    if (currentMembership?.unitId === unitId) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'CONFLICT',
        'User sudah berada di satuan tersebut',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      if (currentMembership) {
        await tx.unitMember.update({
          where: { id: currentMembership.id },
          data: { removedAt: new Date() },
        });
        await tx.unit.updateMany({
          where: {
            id: currentMembership.unitId,
            commanderId: parsed.userId,
          },
          data: {
            commanderId: null,
            leaderOnlyAssignments: false,
          },
        });
      }

      await tx.unitMember.create({
        data: {
          unitId,
          userId: parsed.userId,
        },
      });
    });

    return this.getUnit(unitId);
  }

  async transferMember(unitId: string, userId: string, body: unknown) {
    const parsed = transferMemberSchema.parse(body);
    await this.getActiveUnit(unitId);
    await this.getActiveUnit(parsed.targetUnitId);
    await this.ensureActiveUser(userId);

    const activeMembership = await this.prisma.unitMember.findFirst({
      where: {
        unitId,
        userId,
        removedAt: null,
      },
    });

    if (!activeMembership) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'NOT_FOUND',
        'Keanggotaan aktif tidak ditemukan',
      );
    }

    await this.prisma.$transaction([
      this.prisma.unitMember.update({
        where: { id: activeMembership.id },
        data: { removedAt: new Date() },
      }),
      this.prisma.unit.updateMany({
        where: {
          id: unitId,
          commanderId: userId,
        },
        data: {
          commanderId: null,
          leaderOnlyAssignments: false,
        },
      }),
      this.prisma.unitMember.create({
        data: {
          unitId: parsed.targetUnitId,
          userId,
        },
      }),
    ]);

    return this.getUnit(parsed.targetUnitId);
  }

  private async getActiveUnit(unitId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id: unitId, deletedAt: null },
    });

    if (!unit) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'NOT_FOUND',
        'Satuan tidak ditemukan',
      );
    }

    return unit;
  }

  private async ensureActiveUser(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'NOT_FOUND',
        'User tidak ditemukan',
      );
    }
  }

  private async ensureDirectUnitMember(unitId: string, userId: string) {
    await this.ensureActiveUser(userId);

    const membership = await this.prisma.unitMember.findFirst({
      where: {
        unitId,
        userId,
        removedAt: null,
        unit: {
          deletedAt: null,
        },
        user: {
          deletedAt: null,
        },
      },
    });

    if (!membership) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        'Pimpinan satuan harus merupakan anggota aktif langsung di satuan tersebut',
      );
    }
  }

  private async ensureSiblingNameAvailable(
    parentId: string | null,
    name: string,
    excludeId?: string,
  ) {
    const duplicate = await this.prisma.unit.findFirst({
      where: {
        parentId,
        name,
        deletedAt: null,
        ...(excludeId
          ? {
              NOT: {
                id: excludeId,
              },
            }
          : {}),
      },
    });

    if (duplicate) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'CONFLICT',
        'Nama satuan sudah digunakan pada level yang sama',
      );
    }
  }
}
