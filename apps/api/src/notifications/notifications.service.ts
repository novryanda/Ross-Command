import { Injectable } from '@nestjs/common';
import { HierarchyService } from '../common/hierarchy.service';
import { PrismaService } from '../common/prisma.service';

type NotificationCategory =
  | 'assignment'
  | 'deadline'
  | 'submission'
  | 'order'
  | 'organization'
  | 'account'
  | 'system';

type NotificationSeverity = 'info' | 'success' | 'warning' | 'danger';

type NotificationItem = {
  id: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  description: string;
  href: string | null;
  createdAt: Date;
  readAt: Date | null;
};

type ProgressSummary = {
  totalAssigned: number;
  totalSubmitted: number;
  totalOnTime: number;
  totalLate: number;
  totalPending: number;
  percentageComplete: number;
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hierarchyService: HierarchyService,
  ) {}

  async listNotifications(userId: string, limit: number) {
    const cappedLimit = Math.max(1, Math.min(limit, 50));
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const [isCommander, adminItems, assignmentItems, commanderItems] =
      await Promise.all([
        this.hierarchyService.isCommander(userId),
        user.role === 'super_admin'
          ? this.getAdminNotifications(cappedLimit)
          : Promise.resolve([]),
        user.role !== 'super_admin'
          ? this.getAssignmentNotifications(userId)
          : Promise.resolve([]),
        this.hierarchyService
          .isCommander(userId)
          .then((value) =>
            value
              ? this.getCommanderNotifications(userId)
              : Promise.resolve([]),
          ),
      ]);

    const items = [
      ...adminItems,
      ...assignmentItems,
      ...(isCommander ? commanderItems : []),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, cappedLimit);

    return {
      items,
      unreadCount: items.filter((item) => !item.readAt).length,
      generatedAt: new Date().toISOString(),
    };
  }

  private async getAdminNotifications(
    limit: number,
  ): Promise<NotificationItem[]> {
    const now = new Date();
    const [lockedUsers, usersWithoutUnit, unitsWithoutCommander] =
      await Promise.all([
        this.prisma.user.findMany({
          where: {
            deletedAt: null,
            lockedUntil: { gt: now },
          },
          orderBy: { lockedUntil: 'desc' },
          take: Math.min(limit, 6),
        }),
        this.prisma.user.findMany({
          where: {
            deletedAt: null,
            role: 'member',
            unitMemberships: {
              none: { removedAt: null },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: Math.min(limit, 6),
        }),
        this.prisma.unit.findMany({
          where: {
            deletedAt: null,
            commanderId: null,
          },
          orderBy: [{ depthLevel: 'asc' }, { name: 'asc' }],
          take: Math.min(limit, 6),
        }),
      ]);

    return [
      ...lockedUsers.map(
        (user): NotificationItem => ({
          id: `account-locked:${user.id}`,
          category: 'account',
          severity: 'warning',
          title: 'Akun terkunci',
          description: `${user.fullName} terkunci sampai ${this.formatDateTime(user.lockedUntil)}.`,
          href: `/admin/users/${user.id}`,
          createdAt: user.lockedUntil ?? now,
          readAt: null,
        }),
      ),
      ...usersWithoutUnit.map(
        (user): NotificationItem => ({
          id: `user-without-unit:${user.id}`,
          category: 'organization',
          severity: 'info',
          title: 'User belum masuk satuan',
          description: `${user.fullName} belum punya satuan aktif.`,
          href: `/admin/users/${user.id}`,
          createdAt: user.createdAt,
          readAt: null,
        }),
      ),
      ...unitsWithoutCommander.map(
        (unit): NotificationItem => ({
          id: `unit-without-commander:${unit.id}`,
          category: 'organization',
          severity: 'info',
          title: 'Satuan tanpa pimpinan',
          description: `${unit.name} belum memiliki pimpinan satuan.`,
          href: '/admin/units',
          createdAt: unit.updatedAt,
          readAt: null,
        }),
      ),
    ];
  }

  private async getAssignmentNotifications(
    userId: string,
  ): Promise<NotificationItem[]> {
    const [pendingAssignments, recentCompleted] = await Promise.all([
      this.prisma.taskAssignment.findMany({
        where: {
          userId,
          status: 'belum_dikerjakan',
          order: {
            deletedAt: null,
            status: { in: ['aktif', 'expired'] },
          },
        },
        include: { order: true },
        orderBy: [{ order: { deadline: 'asc' } }, { assignedAt: 'desc' }],
        take: 10,
      }),
      this.prisma.taskAssignment.findMany({
        where: {
          userId,
          status: { in: ['selesai', 'terlambat'] },
          order: { deletedAt: null },
        },
        include: { order: true },
        orderBy: { completedAt: 'desc' },
        take: 4,
      }),
    ]);

    return [
      ...pendingAssignments.map((assignment): NotificationItem => {
        const hours = this.hoursUntil(assignment.order.deadline);
        const isExpired = assignment.order.deadline < new Date();
        const isNearDeadline = !isExpired && hours !== null && hours < 24;

        return {
          id: `${isExpired || isNearDeadline ? 'deadline' : 'assignment'}:${assignment.id}`,
          category: isExpired || isNearDeadline ? 'deadline' : 'assignment',
          severity: isExpired ? 'danger' : isNearDeadline ? 'warning' : 'info',
          title: isExpired
            ? 'Deadline perintah terlewat'
            : isNearDeadline
              ? 'Perintah mendekati deadline'
              : 'Ada perintah baru',
          description: `${assignment.order.title} ${
            isExpired
              ? 'sudah melewati deadline.'
              : isNearDeadline
                ? `tersisa ${hours} jam.`
                : 'harus dikerjakan.'
          }`,
          href: `/assignments/${assignment.id}`,
          createdAt: assignment.assignedAt,
          readAt: null,
        };
      }),
      ...recentCompleted.map(
        (assignment): NotificationItem => ({
          id: `assignment-completed:${assignment.id}`,
          category: 'submission',
          severity: assignment.status === 'terlambat' ? 'warning' : 'success',
          title:
            assignment.status === 'terlambat'
              ? 'Bukti terkirim terlambat'
              : 'Bukti berhasil terkirim',
          description: `${assignment.order.title} sudah tercatat di progress perintah.`,
          href: `/assignments/${assignment.id}`,
          createdAt: assignment.completedAt ?? assignment.updatedAt,
          readAt: null,
        }),
      ),
    ];
  }

  private async getCommanderNotifications(
    userId: string,
  ): Promise<NotificationItem[]> {
    const [activeOrders, recentSubmissions] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          createdById: userId,
          deletedAt: null,
          status: { in: ['aktif', 'expired'] },
        },
        orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
        take: 10,
      }),
      this.prisma.submission.findMany({
        where: {
          isLatest: true,
          assignment: {
            order: {
              createdById: userId,
              deletedAt: null,
            },
          },
        },
        include: {
          user: true,
          assignment: {
            include: {
              order: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        take: 8,
      }),
    ]);

    const progressMap = await this.getProgressMap(
      activeOrders.map((order) => order.id),
    );

    const progressItems = activeOrders
      .map((order): NotificationItem | null => {
        const progress = progressMap.get(order.id);
        if (!progress || progress.totalPending === 0) return null;

        const hours = this.hoursUntil(order.deadline);
        const isExpired =
          order.deadline < new Date() || order.status === 'expired';
        const isNearDeadline = !isExpired && hours !== null && hours < 24;

        if (!isExpired && !isNearDeadline) return null;

        return {
          id: `order-progress:${order.id}`,
          category: isExpired ? 'deadline' : 'order',
          severity: isExpired ? 'danger' : 'warning',
          title: isExpired
            ? 'Perintah aktif melewati deadline'
            : 'Perintah aktif mendekati deadline',
          description: `${order.title}: ${progress.totalPending} dari ${progress.totalAssigned} anggota belum submit.`,
          href: `/orders/${order.id}`,
          createdAt: order.deadline,
          readAt: null,
        };
      })
      .filter((item): item is NotificationItem => Boolean(item));

    const submissionItems = recentSubmissions.map(
      (submission): NotificationItem => ({
        id: `submission:${submission.id}`,
        category: 'submission',
        severity:
          submission.assignment.status === 'terlambat' ? 'warning' : 'success',
        title:
          submission.assignment.status === 'terlambat'
            ? 'Bukti terlambat diterima'
            : 'Bukti baru diterima',
        description: `${submission.user.fullName} mengirim bukti untuk ${submission.assignment.order.title}.`,
        href: `/orders/${submission.assignment.orderId}`,
        createdAt: submission.submittedAt,
        readAt: null,
      }),
    );

    return [...progressItems, ...submissionItems];
  }

  private async getProgressMap(orderIds: string[]) {
    if (!orderIds.length) {
      return new Map<string, ProgressSummary>();
    }

    const grouped = await this.prisma.taskAssignment.groupBy({
      by: ['orderId', 'status'],
      where: {
        orderId: { in: orderIds },
      },
      _count: { _all: true },
    });

    const map = new Map<string, ProgressSummary>();
    for (const orderId of orderIds) {
      const items = grouped.filter((item) => item.orderId === orderId);
      const totalAssigned = items.reduce(
        (acc, item) => acc + item._count._all,
        0,
      );
      const totalOnTime =
        items.find((item) => item.status === 'selesai')?._count._all ?? 0;
      const totalLate =
        items.find((item) => item.status === 'terlambat')?._count._all ?? 0;
      const totalPending =
        items.find((item) => item.status === 'belum_dikerjakan')?._count._all ??
        0;
      const totalSubmitted = totalOnTime + totalLate;

      map.set(orderId, {
        totalAssigned,
        totalSubmitted,
        totalOnTime,
        totalLate,
        totalPending,
        percentageComplete:
          totalAssigned === 0
            ? 0
            : Math.round((totalSubmitted / totalAssigned) * 10000) / 100,
      });
    }

    return map;
  }

  private hoursUntil(deadline: Date) {
    if (deadline.getTime() < Date.now()) {
      return null;
    }

    return Math.max(
      0,
      Math.floor((deadline.getTime() - Date.now()) / 3_600_000),
    );
  }

  private formatDateTime(value: Date | null) {
    if (!value) return 'waktu yang belum diketahui';
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Jakarta',
    }).format(value);
  }
}
