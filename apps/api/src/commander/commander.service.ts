import { Injectable } from '@nestjs/common';
import { HierarchyService } from '../common/hierarchy.service';
import { PrismaService } from '../common/prisma.service';
import { ApiException } from '../common/utils/api-exception.util';
import { buildPaginationMeta } from '../common/utils/api-response.util';
import { HttpStatus } from '@nestjs/common';
import {
  detailMemberQuerySchema,
  listMembersQuerySchema,
} from './commander.schema';

@Injectable()
export class CommanderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hierarchyService: HierarchyService,
  ) {}

  async listMembers(commanderId: string, query: unknown) {
    await this.hierarchyService.ensureCommander(commanderId);
    const parsed = listMembersQuerySchema.parse(query);
    const subordinateUserIds =
      await this.hierarchyService.getSubordinateUserIds(commanderId);

    const where = {
      id: { in: subordinateUserIds },
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
            ],
          }
        : {}),
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

    const [users, total, socialAccounts] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: {
          unitMemberships: {
            where: { removedAt: null },
            include: { unit: true },
            take: 1,
          },
        },
        orderBy: { fullName: 'asc' },
        skip: (parsed.page - 1) * parsed.limit,
        take: parsed.limit,
      }),
      this.prisma.user.count({ where }),
      this.prisma.socialAccount.findMany({
        where: {
          deletedAt: null,
          userId: { in: subordinateUserIds },
        },
        select: {
          userId: true,
        },
      }),
    ]);

    const socialCounts = new Map<string, number>();
    for (const account of socialAccounts) {
      socialCounts.set(
        account.userId,
        (socialCounts.get(account.userId) ?? 0) + 1,
      );
    }

    return {
      items: users.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        unit: user.unitMemberships[0]
          ? {
              id: user.unitMemberships[0].unit.id,
              name: user.unitMemberships[0].unit.name,
              path: user.unitMemberships[0].unit.path,
            }
          : null,
        socialAccountCount: socialCounts.get(user.id) ?? 0,
      })),
      meta: {
        pagination: buildPaginationMeta(parsed.page, parsed.limit, total),
      },
    };
  }

  async listMembersByUnit(commanderId: string) {
    const units =
      await this.hierarchyService.getSubtreeUnitsForCommander(commanderId);
    const memberships = await this.prisma.unitMember.findMany({
      where: {
        unitId: {
          in: units.map((unit) => unit.id),
        },
        removedAt: null,
        user: {
          deletedAt: null,
        },
      },
      include: {
        user: true,
      },
    });

    const membershipMap = new Map<string, typeof memberships>();
    for (const membership of memberships) {
      const list = membershipMap.get(membership.unitId) ?? [];
      list.push(membership);
      membershipMap.set(membership.unitId, list);
    }

    const nodeMap = new Map<string, Record<string, unknown>>();
    for (const unit of units) {
      nodeMap.set(unit.id, {
        id: unit.id,
        name: unit.name,
        path: unit.path,
        depthLevel: unit.depthLevel,
        directMembers:
          membershipMap.get(unit.id)?.map((membership) => ({
            id: membership.user.id,
            fullName: membership.user.fullName,
            username: membership.user.username,
          })) ?? [],
        children: [],
      });
    }

    const roots: Record<string, unknown>[] = [];
    for (const unit of units) {
      const node = nodeMap.get(unit.id);
      if (!node) continue;
      if (unit.parentId && nodeMap.has(unit.parentId)) {
        const parent = nodeMap.get(unit.parentId);
        if (parent) {
          (parent.children as Record<string, unknown>[]).push(node);
          continue;
        }
      }
      roots.push(node);
    }

    return roots;
  }

  async getMemberDetail(commanderId: string, userId: string, query: unknown) {
    await this.hierarchyService.assertUserInHierarchy(commanderId, userId);
    const parsed = detailMemberQuerySchema.parse(query);

    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        unitMemberships: {
          where: { removedAt: null },
          include: { unit: true },
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

    const assignmentsWhere = {
      userId,
      ...(parsed.status ? { status: parsed.status } : {}),
      ...(parsed.orderType ? { order: { orderType: parsed.orderType } } : {}),
    };

    const [assignments, total, summaryAssignments] =
      await this.prisma.$transaction([
        this.prisma.taskAssignment.findMany({
          where: assignmentsWhere,
          include: {
            order: true,
            submissions: {
              where: { isLatest: true },
              take: 1,
            },
          },
          orderBy: [{ order: { deadline: 'desc' } }],
          skip: (parsed.page - 1) * parsed.limit,
          take: parsed.limit,
        }),
        this.prisma.taskAssignment.count({ where: assignmentsWhere }),
        this.prisma.taskAssignment.findMany({
          where: { userId },
          select: { status: true },
        }),
      ]);

    const assignmentSummary = {
      total: summaryAssignments.length,
      totalDone: summaryAssignments.filter((item) => item.status === 'selesai')
        .length,
      totalLate: summaryAssignments.filter(
        (item) => item.status === 'terlambat',
      ).length,
      totalPending: summaryAssignments.filter(
        (item) => item.status === 'belum_dikerjakan',
      ).length,
    };

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        nip: user.nip,
        unit: user.unitMemberships[0]
          ? {
              id: user.unitMemberships[0].unit.id,
              name: user.unitMemberships[0].unit.name,
              path: user.unitMemberships[0].unit.path,
            }
          : null,
      },
      socialAccounts: user.socialAccounts.map((account) => ({
        id: account.id,
        platform: account.platform,
        username: account.username,
        profileUrl: account.profileUrl,
        notes: account.notes,
      })),
      assignmentSummary,
      assignments: assignments.map((assignment) => ({
        id: assignment.id,
        status: assignment.status,
        completedAt: assignment.completedAt,
        order: {
          id: assignment.order.id,
          title: assignment.order.title,
          orderType: assignment.order.orderType,
          deadline: assignment.order.deadline,
        },
        latestSubmission: assignment.submissions[0]
          ? {
              driveLink: assignment.submissions[0].driveLink,
              notes: assignment.submissions[0].notes,
              submittedAt: assignment.submissions[0].submittedAt,
              isLate: assignment.status === 'terlambat',
            }
          : null,
      })),
      meta: {
        pagination: buildPaginationMeta(parsed.page, parsed.limit, total),
      },
    };
  }
}
