import { Injectable } from '@nestjs/common';

import { HierarchyService } from '../common/hierarchy.service';
import { PrismaService } from '../common/prisma.service';
import { serializeOrderType } from '../orders/order-type.util';
import { OrdersService } from '../orders/orders.service';
import {
  buildDashboardOrderWhere,
  resolveDashboardDateRange,
  serializeDashboardFilters,
} from './dashboard.filters';
import { dashboardQuerySchema, type DashboardQuery } from './dashboard.schema';

function getWeekStart(date: Date) {
  const value = new Date(date);
  const day = value.getDay();
  const diff = value.getDate() - day + (day === 0 ? -6 : 1);
  value.setDate(diff);
  value.setHours(0, 0, 0, 0);
  return value;
}

function formatWeekLabel(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function buildWeeklyOrderTrend(
  orders: Array<{ sentAt: Date | null; createdAt: Date }>,
  range?: { dateFrom?: Date; dateTo?: Date },
) {
  const endReference = range?.dateTo ?? new Date();
  const defaultStart = new Date(endReference);
  defaultStart.setDate(defaultStart.getDate() - 7 * 7);
  const startReference = range?.dateFrom ?? defaultStart;

  const weekEnd = getWeekStart(endReference);
  const weekStart = getWeekStart(startReference);
  const buckets = new Map<string, { label: string; count: number }>();
  const cursor = new Date(weekStart);
  let bucketCount = 0;

  while (cursor <= weekEnd && bucketCount < 12) {
    const key = cursor.toISOString();
    buckets.set(key, {
      label: formatWeekLabel(cursor),
      count: 0,
    });
    cursor.setDate(cursor.getDate() + 7);
    bucketCount += 1;
  }

  if (!buckets.size) {
    const key = weekEnd.toISOString();
    buckets.set(key, {
      label: formatWeekLabel(weekEnd),
      count: 0,
    });
  }

  for (const order of orders) {
    const referenceDate = order.sentAt ?? order.createdAt;
    const weekKey = getWeekStart(referenceDate).toISOString();
    const bucket = buckets.get(weekKey);
    if (bucket) {
      bucket.count += 1;
    }
  }

  return Array.from(buckets.values());
}

function getProgressBucket(percentage: number) {
  if (percentage >= 80) {
    return 'high' as const;
  }

  if (percentage >= 50) {
    return 'medium' as const;
  }

  return 'low';
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hierarchyService: HierarchyService,
    private readonly ordersService: OrdersService,
  ) {}

  async getCommanderDashboard(userId: string, query: Record<string, unknown>) {
    const parsed = this.parseDashboardQuery(query);
    const orderWhere = buildDashboardOrderWhere(userId, parsed);
    const dateRange = resolveDashboardDateRange(parsed);

    const subordinateUserIds =
      await this.hierarchyService.getSubordinateUserIds(userId);
    const [
      totalActiveOrders,
      assignmentStats,
      filteredOrders,
      orderStatusStats,
      orderTypeStats,
    ] = await Promise.all([
      this.prisma.order.count({
        where: {
          ...orderWhere,
          status: 'aktif',
        },
      }),
      this.prisma.taskAssignment.groupBy({
        by: ['status'],
        where: {
          order: orderWhere,
        },
        _count: {
          _all: true,
        },
      }),
      this.prisma.order.findMany({
        where: orderWhere,
        select: {
          id: true,
          title: true,
          orderType: true,
          deadline: true,
          status: true,
          sentAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        where: orderWhere,
        _count: {
          _all: true,
        },
      }),
      this.prisma.order.groupBy({
        by: ['orderType'],
        where: orderWhere,
        _count: {
          _all: true,
        },
      }),
    ]);

    const orderIds = filteredOrders.map((order) => order.id);
    const progressMap = await this.ordersService.getProgressMap(orderIds);

    const orderStatus = {
      draft: 0,
      aktif: 0,
      selesai: 0,
      expired: 0,
      dibatalkan: 0,
    };

    for (const item of orderStatusStats) {
      orderStatus[item.status] = item._count._all;
    }

    const orderType = {
      posting: 0,
      blasting: 0,
      counter: 0,
      report_akun: 0,
    };

    for (const item of orderTypeStats) {
      const key = serializeOrderType(item.orderType);
      if (key in orderType) {
        orderType[key as keyof typeof orderType] += item._count._all;
      }
    }

    const assignmentStatus = {
      submitted:
        assignmentStats.find((item) => item.status === 'selesai')?._count
          ._all ?? 0,
      pending:
        assignmentStats.find((item) => item.status === 'belum_dikerjakan')
          ?._count._all ?? 0,
      late:
        assignmentStats.find((item) => item.status === 'terlambat')?._count
          ._all ?? 0,
    };

    const progressDistribution = {
      low: 0,
      medium: 0,
      high: 0,
    };

    let totalAssigned = 0;
    let totalSubmitted = 0;
    let totalPending = 0;
    let totalLate = 0;
    let needsAttentionCount = 0;

    for (const order of filteredOrders) {
      const progress = progressMap.get(order.id);
      if (!progress) {
        continue;
      }

      totalAssigned += progress.totalAssigned;
      totalSubmitted += progress.totalSubmitted;
      totalPending += progress.totalPending;
      totalLate += progress.totalLate;

      progressDistribution[getProgressBucket(progress.percentageComplete)] += 1;

      if (order.status === 'aktif' && progress.percentageComplete < 50) {
        needsAttentionCount += 1;
      }
    }

    const percentageComplete =
      totalAssigned === 0
        ? 0
        : Math.round((totalSubmitted / totalAssigned) * 10000) / 100;

    return {
      filters: serializeDashboardFilters(parsed),
      stats: {
        totalActiveOrders,
        totalSubordinateMembers: subordinateUserIds.length,
        totalPendingAssignments: assignmentStatus.pending,
        totalCompletedAssignments:
          assignmentStatus.submitted + assignmentStatus.late,
        needsAttentionCount,
        totalFilteredOrders: filteredOrders.length,
      },
      charts: {
        overallProgress: {
          totalAssigned,
          totalSubmitted,
          totalPending,
          totalLate,
          percentageComplete,
        },
        assignmentStatus,
        orderStatus,
        orderType,
        progressDistribution,
        weeklyOrders: buildWeeklyOrderTrend(filteredOrders, dateRange),
      },
      activeOrders: filteredOrders.slice(0, 5).map((order) => ({
        id: order.id,
        title: order.title,
        orderType: serializeOrderType(order.orderType),
        deadline: order.deadline,
        status: order.status,
        progress: progressMap.get(order.id) ?? {
          totalAssigned: 0,
          totalSubmitted: 0,
          totalOnTime: 0,
          totalLate: 0,
          totalPending: 0,
          percentageComplete: 0,
        },
      })),
    };
  }

  async getMemberDashboard(userId: string) {
    const [pendingAssignments, recentAssignments, socialAccountCount] =
      await Promise.all([
        this.prisma.taskAssignment.count({
          where: {
            userId,
            status: 'belum_dikerjakan',
          },
        }),
        this.prisma.taskAssignment.findMany({
          where: { userId },
          include: {
            order: true,
          },
          orderBy: [{ status: 'asc' }, { order: { deadline: 'asc' } }],
          take: 5,
        }),
        this.prisma.socialAccount.count({
          where: {
            userId,
            deletedAt: null,
          },
        }),
      ]);

    return {
      stats: {
        pendingAssignments,
        socialAccountCount,
      },
      recentAssignments: recentAssignments.map((assignment) => ({
        id: assignment.id,
        status: assignment.status,
        deadline: assignment.order.deadline,
        order: {
          id: assignment.order.id,
          title: assignment.order.title,
          orderType: serializeOrderType(assignment.order.orderType),
        },
      })),
    };
  }

  async getAdminDashboard() {
    const [
      totalUsers,
      totalUnits,
      totalOrders,
      totalSocialAccounts,
      lockedUsers,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.unit.count({ where: { deletedAt: null } }),
      this.prisma.order.count({ where: { deletedAt: null } }),
      this.prisma.socialAccount.count({ where: { deletedAt: null } }),
      this.prisma.user.count({
        where: {
          deletedAt: null,
          lockedUntil: {
            gt: new Date(),
          },
        },
      }),
    ]);

    return {
      stats: {
        totalUsers,
        totalUnits,
        totalOrders,
        totalSocialAccounts,
        lockedUsers,
      },
    };
  }

  private parseDashboardQuery(query: Record<string, unknown>): DashboardQuery {
    return dashboardQuerySchema.parse(query);
  }
}
