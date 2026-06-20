import { HttpStatus, Injectable } from '@nestjs/common';
import { ActivityLogType, type User } from '@prisma/client';
import { HierarchyService } from '../common/hierarchy.service';
import { PrismaService } from '../common/prisma.service';
import { ApiException } from '../common/utils/api-exception.util';
import { buildPaginationMeta } from '../common/utils/api-response.util';
import { listActivityQuerySchema } from './activity.schema';

type ActivityCategory = 'auth' | 'order' | 'submission';
type ActivityType =
  | 'login_success'
  | 'login_failed'
  | 'order_created'
  | 'order_sent'
  | 'submission_sent';

type ActivityItem = {
  id: string;
  category: ActivityCategory;
  type: ActivityType;
  actor: {
    id: string | null;
    name: string;
    username: string | null;
  };
  title: string;
  description: string;
  href: string | null;
  occurredAt: Date;
};

@Injectable()
export class ActivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hierarchyService: HierarchyService,
  ) {}

  async listActivity(currentUser: User, query: unknown) {
    const parsed = listActivityQuerySchema.parse(query);
    const isCommander = await this.hierarchyService.isCommander(currentUser.id);

    if (currentUser.role !== 'super_admin' && !isCommander) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'FORBIDDEN',
        'Akses log aktivitas hanya untuk super admin dan pimpinan',
      );
    }

    const fromDate = parsed.fromDate
      ? this.startOfDay(parsed.fromDate)
      : undefined;
    const toDate = parsed.toDate ? this.endOfDay(parsed.toDate) : undefined;
    const fetchLimit = Math.min(parsed.limit * 5, 500);

    const activityLogWhere: {
      order?: { createdById: string };
      id?: string;
      type?: ActivityLogType | { in: ActivityLogType[] };
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (currentUser.role !== 'super_admin') {
      activityLogWhere.order = {
        createdById: currentUser.id,
      };
    }

    if (parsed.category === 'auth') {
      activityLogWhere.id = '__never_match_activity_logs__';
    } else if (parsed.category === 'order') {
      activityLogWhere.type = {
        in: [ActivityLogType.order_created, ActivityLogType.order_sent],
      };
    } else if (parsed.category === 'submission') {
      activityLogWhere.type = ActivityLogType.submission_sent;
    }

    if (fromDate || toDate) {
      activityLogWhere.createdAt = {
        ...(fromDate ? { gte: fromDate } : {}),
        ...(toDate ? { lte: toDate } : {}),
      };
    }

    const shouldFetchLoginAttempts =
      currentUser.role === 'super_admin' &&
      (!parsed.category || parsed.category === 'auth');

    const [activityLogs, loginAttempts] = await Promise.all([
      this.prisma.activityLog.findMany({
        where: activityLogWhere,
        include: {
          actorUser: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
          order: {
            select: {
              id: true,
              title: true,
              createdById: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: fetchLimit,
      }),
      shouldFetchLoginAttempts
        ? this.prisma.loginAttempt.findMany({
            where: {
              ...(fromDate || toDate
                ? {
                    attemptedAt: {
                      ...(fromDate ? { gte: fromDate } : {}),
                      ...(toDate ? { lte: toDate } : {}),
                    },
                  }
                : {}),
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
            orderBy: { attemptedAt: 'desc' },
            take: fetchLimit,
          })
        : Promise.resolve([]),
    ]);

    const items = [
      ...activityLogs.map((item) =>
        this.serializeActivityLog(item, currentUser),
      ),
      ...loginAttempts.map((item) =>
        this.serializeLoginAttempt(item, currentUser),
      ),
    ].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

    const total = items.length;
    const startIndex = (parsed.page - 1) * parsed.limit;
    const pagedItems = items.slice(startIndex, startIndex + parsed.limit);

    return {
      items: pagedItems.map((item) => ({
        ...item,
        occurredAt: item.occurredAt,
      })),
      meta: {
        pagination: buildPaginationMeta(parsed.page, parsed.limit, total),
      },
      generatedAt: new Date().toISOString(),
    };
  }

  async logOrderCreated(params: {
    actorUserId: string;
    orderId: string;
    occurredAt?: Date;
  }) {
    await this.prisma.activityLog.upsert({
      where: {
        activityKey: `order_created:${params.orderId}`,
      },
      update: {
        actorUserId: params.actorUserId,
        orderId: params.orderId,
        createdAt: params.occurredAt ?? new Date(),
      },
      create: {
        activityKey: `order_created:${params.orderId}`,
        type: ActivityLogType.order_created,
        actorUserId: params.actorUserId,
        orderId: params.orderId,
        createdAt: params.occurredAt ?? new Date(),
      },
    });
  }

  async logOrderSent(params: {
    actorUserId: string;
    orderId: string;
    occurredAt?: Date;
  }) {
    await this.prisma.activityLog.upsert({
      where: {
        activityKey: `order_sent:${params.orderId}`,
      },
      update: {
        actorUserId: params.actorUserId,
        orderId: params.orderId,
        createdAt: params.occurredAt ?? new Date(),
      },
      create: {
        activityKey: `order_sent:${params.orderId}`,
        type: ActivityLogType.order_sent,
        actorUserId: params.actorUserId,
        orderId: params.orderId,
        createdAt: params.occurredAt ?? new Date(),
      },
    });
  }

  async logSubmissionSent(params: {
    actorUserId: string;
    orderId: string;
    assignmentId: string;
    submissionId: string;
    occurredAt?: Date;
  }) {
    await this.prisma.activityLog.upsert({
      where: {
        activityKey: `submission_sent:${params.submissionId}`,
      },
      update: {
        actorUserId: params.actorUserId,
        orderId: params.orderId,
        assignmentId: params.assignmentId,
        submissionId: params.submissionId,
        createdAt: params.occurredAt ?? new Date(),
      },
      create: {
        activityKey: `submission_sent:${params.submissionId}`,
        type: ActivityLogType.submission_sent,
        actorUserId: params.actorUserId,
        orderId: params.orderId,
        assignmentId: params.assignmentId,
        submissionId: params.submissionId,
        createdAt: params.occurredAt ?? new Date(),
      },
    });
  }

  private serializeActivityLog(
    item: {
      id: string;
      type: ActivityLogType;
      actorUser: {
        id: string;
        fullName: string;
        username: string;
      } | null;
      order: {
        id: string;
        title: string;
        createdById: string;
      } | null;
      createdAt: Date;
    },
    currentUser: User,
  ): ActivityItem {
    const actor = item.actorUser
      ? {
          id: item.actorUser.id,
          name: item.actorUser.fullName,
          username: item.actorUser.username,
        }
      : {
          id: null,
          name: 'Sistem',
          username: null,
        };

    if (item.type === ActivityLogType.order_created) {
      return {
        id: item.id,
        category: 'order',
        type: 'order_created',
        actor,
        title: 'Perintah dibuat',
        description: item.order?.title ?? 'Perintah baru dibuat.',
        href: this.buildOrderHref(currentUser, item.order?.id ?? null),
        occurredAt: item.createdAt,
      };
    }

    if (item.type === ActivityLogType.order_sent) {
      return {
        id: item.id,
        category: 'order',
        type: 'order_sent',
        actor,
        title: 'Perintah dikirim',
        description:
          item.order?.title ?? 'Perintah baru dikirim ke target pelaksana.',
        href: this.buildOrderHref(currentUser, item.order?.id ?? null),
        occurredAt: item.createdAt,
      };
    }

    return {
      id: item.id,
      category: 'submission',
      type: 'submission_sent',
      actor,
      title: 'Bukti dikirim',
      description:
        item.order?.title ?? 'Bukti pelaksanaan baru berhasil dikirim.',
      href: this.buildOrderHref(currentUser, item.order?.id ?? null),
      occurredAt: item.createdAt,
    };
  }

  private serializeLoginAttempt(
    item: {
      id: string;
      userId: string | null;
      ipAddress: string;
      isSuccess: boolean;
      attemptedAt: Date;
      user: {
        id: string;
        fullName: string;
        username: string;
      } | null;
    },
    currentUser: User,
  ): ActivityItem {
    return {
      id: `login-attempt:${item.id}`,
      category: 'auth',
      type: item.isSuccess ? 'login_success' : 'login_failed',
      actor: item.user
        ? {
            id: item.user.id,
            name: item.user.fullName,
            username: item.user.username,
          }
        : {
            id: null,
            name: 'Pengguna tidak dikenal',
            username: null,
          },
      title: item.isSuccess ? 'Login berhasil' : 'Login gagal',
      description: `IP ${item.ipAddress}`,
      href:
        currentUser.role === 'super_admin' && item.userId
          ? `/admin/users/${item.userId}`
          : currentUser.role !== 'super_admin' &&
              item.userId &&
              item.userId !== currentUser.id
            ? `/members/${item.userId}`
            : null,
      occurredAt: item.attemptedAt,
    };
  }

  private buildOrderHref(currentUser: User, orderId: string | null) {
    if (!orderId) {
      return null;
    }

    if (currentUser.role === 'super_admin') {
      return null;
    }

    return `/orders/${orderId}`;
  }

  private startOfDay(date: Date) {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
  }

  private endOfDay(date: Date) {
    const value = new Date(date);
    value.setHours(23, 59, 59, 999);
    return value;
  }
}
