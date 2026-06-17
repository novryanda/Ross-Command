import { Injectable } from '@nestjs/common';
import { HierarchyService } from '../common/hierarchy.service';
import { PrismaService } from '../common/prisma.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hierarchyService: HierarchyService,
    private readonly ordersService: OrdersService,
  ) {}

  async getCommanderDashboard(userId: string) {
    const subordinateUserIds =
      await this.hierarchyService.getSubordinateUserIds(userId);
    const [
      totalActiveOrders,
      totalSubordinateMembers,
      assignmentStats,
      recentOrders,
    ] = await Promise.all([
      this.prisma.order.count({
        where: {
          createdById: userId,
          status: 'aktif',
          deletedAt: null,
        },
      }),
      Promise.resolve(subordinateUserIds.length),
      this.prisma.taskAssignment.groupBy({
        by: ['status'],
        where: {
          order: {
            createdById: userId,
            deletedAt: null,
          },
        },
        _count: {
          _all: true,
        },
      }),
      this.prisma.order.findMany({
        where: {
          createdById: userId,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const orderIds = recentOrders.map((order) => order.id);
    const progressMap = await this.ordersService.getProgressMap(orderIds);

    return {
      stats: {
        totalActiveOrders,
        totalSubordinateMembers,
        totalPendingAssignments:
          assignmentStats.find((item) => item.status === 'belum_dikerjakan')
            ?._count._all ?? 0,
        totalCompletedAssignments:
          (assignmentStats.find((item) => item.status === 'selesai')?._count
            ._all ?? 0) +
          (assignmentStats.find((item) => item.status === 'terlambat')?._count
            ._all ?? 0),
      },
      activeOrders: recentOrders.map((order) => ({
        id: order.id,
        title: order.title,
        orderType: order.orderType,
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
          orderType: assignment.order.orderType,
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
}
