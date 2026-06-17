import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { HierarchyService } from '../common/hierarchy.service';
import { PrismaService } from '../common/prisma.service';
import { ApiException } from '../common/utils/api-exception.util';
import { buildPaginationMeta } from '../common/utils/api-response.util';
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
} from './users.schema';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly hierarchyService: HierarchyService,
  ) {}

  async listUsers(query: unknown) {
    const parsed = listUsersQuerySchema.parse(query);
    const where = {
      deletedAt: null,
      ...(parsed.search
        ? {
            OR: [
              {
                fullName: {
                  contains: parsed.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                username: {
                  contains: parsed.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                nip: { contains: parsed.search, mode: 'insensitive' as const },
              },
            ],
          }
        : {}),
      ...(parsed.role ? { role: parsed.role } : {}),
      ...(parsed.unitId
        ? {
            unitMemberships: {
              some: {
                unitId: parsed.unitId,
                removedAt: null,
              },
            },
          }
        : {}),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: {
          unitMemberships: {
            where: { removedAt: null },
            include: {
              unit: true,
            },
            orderBy: { joinedAt: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              socialAccounts: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
        orderBy: {
          [parsed.sortBy]: parsed.sortOrder,
        },
        skip: (parsed.page - 1) * parsed.limit,
        take: parsed.limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const userIds = users.map((user) => user.id);
    const commanded = await this.prisma.unit.findMany({
      where: {
        commanderId: {
          in: userIds,
        },
        deletedAt: null,
      },
      select: {
        commanderId: true,
      },
      distinct: ['commanderId'],
    });

    const commanderIds = new Set(
      commanded
        .map((item) => item.commanderId)
        .filter((item): item is string => Boolean(item)),
    );

    return {
      items: users.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        nip: user.nip,
        role: user.role,
        isCommander: commanderIds.has(user.id),
        isLocked: Boolean(user.lockedUntil && user.lockedUntil > new Date()),
        socialAccountCount: user._count.socialAccounts,
        unit: user.unitMemberships[0]
          ? {
              id: user.unitMemberships[0].unit.id,
              name: user.unitMemberships[0].unit.name,
              path: user.unitMemberships[0].unit.path,
              joinedAt: user.unitMemberships[0].joinedAt,
            }
          : null,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      })),
      meta: {
        pagination: buildPaginationMeta(parsed.page, parsed.limit, total),
      },
    };
  }

  async createUser(
    headers: Record<string, string | string[] | undefined>,
    body: unknown,
  ) {
    const parsed = createUserSchema.parse(body);

    if (parsed.unitId) {
      await this.ensureActiveUnit(parsed.unitId);
    }

    const normalizedUsername = parsed.username.toLowerCase();
    const email = `${normalizedUsername}@komando.local`;

    await this.authService.requireUser(headers, {
      disableCookieCache: true,
    });

    const auth = await this.authService.getAuth();
    await auth.api.createUser({
      headers: this.authService.toHeaders(headers),
      body: {
        email,
        password: parsed.password,
        name: parsed.fullName,
        role: parsed.role,
        data: {
          username: normalizedUsername,
          nip: parsed.nip ?? null,
        },
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (!user) {
      throw new ApiException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'INTERNAL_ERROR',
        'User gagal dibuat',
      );
    }

    if (user.role !== parsed.role) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          role: parsed.role,
        },
      });
    }

    if (parsed.unitId) {
      await this.prisma.unitMember.create({
        data: {
          userId: user.id,
          unitId: parsed.unitId,
        },
      });
    }

    return this.getUserById(user.id);
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        unitMemberships: {
          where: { removedAt: null },
          include: { unit: true },
          orderBy: { joinedAt: 'desc' },
          take: 1,
        },
        socialAccounts: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'NOT_FOUND',
        'User tidak ditemukan',
      );
    }

    const isCommander = await this.hierarchyService.isCommander(user.id);

    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      nip: user.nip,
      role: user.role,
      isCommander,
      isLocked: Boolean(user.lockedUntil && user.lockedUntil > new Date()),
      unit: user.unitMemberships[0]
        ? {
            id: user.unitMemberships[0].unit.id,
            name: user.unitMemberships[0].unit.name,
            path: user.unitMemberships[0].unit.path,
            joinedAt: user.unitMemberships[0].joinedAt,
          }
        : null,
      socialAccounts: user.socialAccounts.map((account) => ({
        id: account.id,
        platform: account.platform,
        username: account.username,
        profileUrl: account.profileUrl,
        notes: account.notes,
        createdAt: account.createdAt,
      })),
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateUser(userId: string, body: unknown) {
    const parsed = updateUserSchema.parse(body);
    await this.ensureUserExists(userId);

    if (parsed.unitId) {
      await this.ensureActiveUnit(parsed.unitId);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(parsed.fullName ? { fullName: parsed.fullName } : {}),
        ...(parsed.username ? { username: parsed.username.toLowerCase() } : {}),
        ...(parsed.nip !== undefined ? { nip: parsed.nip } : {}),
        ...(parsed.role ? { role: parsed.role } : {}),
      },
    });

    if (parsed.unitId !== undefined) {
      const activeMembership = await this.prisma.unitMember.findFirst({
        where: {
          userId,
          removedAt: null,
        },
      });

      if (
        activeMembership &&
        (!parsed.unitId || activeMembership.unitId !== parsed.unitId)
      ) {
        await this.prisma.unitMember.update({
          where: { id: activeMembership.id },
          data: { removedAt: new Date() },
        });
      }

      if (
        parsed.unitId &&
        (!activeMembership || activeMembership.unitId !== parsed.unitId)
      ) {
        await this.prisma.unitMember.create({
          data: {
            userId,
            unitId: parsed.unitId,
          },
        });
      }
    }

    return this.getUserById(userId);
  }

  async deactivateUser(userId: string) {
    await this.ensureUserExists(userId);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          banned: true,
          banReason: 'User dinonaktifkan oleh super admin',
        },
      }),
      this.prisma.session.deleteMany({
        where: { userId },
      }),
      this.prisma.unitMember.updateMany({
        where: {
          userId,
          removedAt: null,
        },
        data: {
          removedAt: new Date(),
        },
      }),
    ]);
  }

  async getUserSocialAccounts(requesterId: string, userId: string) {
    await this.hierarchyService.assertUserInHierarchy(requesterId, userId);

    const socialAccounts = await this.prisma.socialAccount.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return socialAccounts.map((account) => ({
      id: account.id,
      platform: account.platform,
      username: account.username,
      profileUrl: account.profileUrl,
      notes: account.notes,
      createdAt: account.createdAt,
    }));
  }

  private async ensureUserExists(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'NOT_FOUND',
        'User tidak ditemukan',
      );
    }
  }

  private async ensureActiveUnit(unitId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: {
        id: unitId,
        deletedAt: null,
      },
    });

    if (!unit) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'NOT_FOUND',
        'Satuan tidak ditemukan',
      );
    }
  }
}
