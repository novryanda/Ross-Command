import { HttpStatus, Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { ActivityService } from '../activity/activity.service';
import {
  aggregateScrapedTotals,
  ApifyService,
  computeGrowthPercent,
  summarizeScrapePhaseStatus,
} from '../apify/apify.service';
import { HierarchyService } from '../common/hierarchy.service';
import { PrismaService } from '../common/prisma.service';
import { ApiException } from '../common/utils/api-exception.util';
import { buildPaginationMeta } from '../common/utils/api-response.util';
import {
  aggregateTargetMetricTotals,
  emptySubmissionMetrics,
  normalizeMetrics,
  resolveSubmissionMetrics,
  serializeLatestSubmission,
  subtractMetrics,
  sumMetrics,
  sumTargetBaselineMetrics,
  type SubmissionMetrics,
  type TargetMetricTotal,
} from '../common/utils/submission.util';
import {
  OrderStatus,
  OrderTargetAudience,
  OrderType,
  Prisma,
  SocialPlatform,
  type MetricScrapePhase,
} from '@prisma/client';
import {
  baseOrderSchema,
  type BaseOrderInput,
  type EngagementAction,
  listOrderAssignmentsQuerySchema,
  listOrdersQuerySchema,
  listOrdersSummaryQuerySchema,
  updateOrderSchema,
} from './orders.schema';
import { serializeOrderType } from './order-type.util';

type AssignmentProgress = {
  totalAssigned: number;
  totalSubmitted: number;
  totalOnTime: number;
  totalLate: number;
  totalPending: number;
  percentageComplete: number;
  metricTotals: SubmissionMetrics;
  baselineMetricTotals?: SubmissionMetrics;
  deltaMetricTotals?: SubmissionMetrics;
  accumulatedMetricTotals?: SubmissionMetrics;
  targetMetricTotals?: TargetMetricTotal[];
};

type SerializedAssignmentItem = {
  id: string;
  status: 'belum_dikerjakan' | 'selesai' | 'terlambat';
  assignedAt: Date;
  completedAt: Date | null;
  user: {
    id: string;
    fullName: string;
    username: string;
  };
  unit: {
    id: string;
    name: string;
    path: string;
    leaderOnlyAssignments: boolean;
    commanderId: string | null;
  } | null;
  canSubmitForMember: boolean;
  canSubmitUnitTotal: boolean;
  representedByLeader: boolean;
  latestSubmission: ReturnType<typeof serializeLatestSubmission> | null;
};

type OrdersSummaryStats = {
  total: number;
  aktif: number;
  draft: number;
  selesai: number;
  expired: number;
};

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

type WeeklyTrendBucket = {
  label: string;
  posting: number;
  blasting: number;
  counter: number;
  report_akun: number;
  total: number;
};

function createWeeklyTrendBucket(label: string): WeeklyTrendBucket {
  return { label, posting: 0, blasting: 0, counter: 0, report_akun: 0, total: 0 };
}

function buildWeeklyOrderTrend(
  orders: Array<{ sentAt: Date | null; createdAt: Date; orderType: OrderType }>,
  range?: { dateFrom?: Date; dateTo?: Date },
) {
  const endReference = range?.dateTo ?? new Date();
  const defaultStart = new Date(endReference);
  defaultStart.setDate(defaultStart.getDate() - 7 * 7);
  const startReference = range?.dateFrom ?? defaultStart;

  const weekEnd = getWeekStart(endReference);
  const weekStart = getWeekStart(startReference);
  const buckets = new Map<string, WeeklyTrendBucket>();
  const cursor = new Date(weekStart);
  let bucketCount = 0;

  while (cursor <= weekEnd && bucketCount < 12) {
    const key = cursor.toISOString();
    buckets.set(key, createWeeklyTrendBucket(formatWeekLabel(cursor)));
    cursor.setDate(cursor.getDate() + 7);
    bucketCount += 1;
  }

  if (!buckets.size) {
    const key = weekEnd.toISOString();
    buckets.set(key, createWeeklyTrendBucket(formatWeekLabel(weekEnd)));
  }

  for (const order of orders) {
    const referenceDate = order.sentAt ?? order.createdAt;
    const weekKey = getWeekStart(referenceDate).toISOString();
    const bucket = buckets.get(weekKey);
    if (!bucket) {
      continue;
    }

    const typeKey = serializeOrderType(order.orderType);
    if (
      typeKey === 'posting' ||
      typeKey === 'blasting' ||
      typeKey === 'counter' ||
      typeKey === 'report_akun'
    ) {
      bucket[typeKey] += 1;
    }
    bucket.total += 1;
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

  return 'low' as const;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hierarchyService: HierarchyService,
    private readonly activityService: ActivityService,
    private readonly apifyService: ApifyService,
  ) {}

  async listOrders(commanderId: string, query: unknown) {
    await this.hierarchyService.ensureCommander(commanderId);
    const parsed = listOrdersQuerySchema.parse(query);
    const orderBy = this.buildListOrdersOrderBy(
      parsed.sortBy,
      parsed.sortOrder,
    );
    const where = this.buildOrdersWhere(commanderId, parsed);

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        orderBy,
        skip: (parsed.page - 1) * parsed.limit,
        take: parsed.limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    await Promise.all(orders.map((order) => this.refreshOrderStatus(order.id)));

    const refreshedOrders = await this.prisma.order.findMany({
      where: {
        id: {
          in: orders.map((order) => order.id),
        },
      },
      orderBy,
    });

    const progressMap = await this.getProgressMap(
      refreshedOrders.map((order) => order.id),
    );
    const socialTargetsMap = await this.getSocialTargetsMap(
      refreshedOrders.map((order) => order.id),
    );
    const data = refreshedOrders.map((order) =>
      this.serializeOrder(
        order,
        progressMap.get(order.id),
        socialTargetsMap.get(order.id) ?? [],
      ),
    );

    return {
      items: data,
      meta: {
        pagination: buildPaginationMeta(parsed.page, parsed.limit, total),
      },
    };
  }

  async getOrdersSummary(commanderId: string, query: unknown) {
    await this.hierarchyService.ensureCommander(commanderId);
    const parsed = listOrdersSummaryQuerySchema.parse(query);
    const where = this.buildOrdersWhere(commanderId, parsed);
    const [orders, orderStatusStats, orderTypeStats] =
      await this.prisma.$transaction([
        this.prisma.order.findMany({
          where,
          select: {
            id: true,
            status: true,
            orderType: true,
            deadline: true,
            sentAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.order.groupBy({
          by: ['status'],
          where,
          orderBy: {
            status: 'asc',
          },
          _count: {
            _all: true,
          },
        }),
        this.prisma.order.groupBy({
          by: ['orderType'],
          where,
          orderBy: {
            orderType: 'asc',
          },
          _count: {
            _all: true,
          },
        }),
      ]);

    const progressMap = await this.getProgressMap(orders.map((order) => order.id));
    const orderStatus = {
      total: orders.length,
      aktif: 0,
      draft: 0,
      selesai: 0,
      expired: 0,
    } satisfies OrdersSummaryStats;

    for (const item of orderStatusStats) {
      if (item.status === 'dibatalkan') {
        continue;
      }

      const count =
        typeof item._count === 'object' && item._count
          ? (item._count._all ?? 0)
          : 0;
      orderStatus[item.status] = count;
    }

    const orderType = {
      posting: 0,
      blasting: 0,
      counter: 0,
      report_akun: 0,
    };

    for (const item of orderTypeStats) {
      const key = serializeOrderType(item.orderType);
      const count =
        typeof item._count === 'object' && item._count
          ? (item._count._all ?? 0)
          : 0;
      if (key in orderType) {
        orderType[key as keyof typeof orderType] += count;
      }
    }

    const progressDistribution = {
      low: 0,
      medium: 0,
      high: 0,
    };

    const now = new Date();
    let totalRunningOrders = 0;
    let totalCompletedOrders = 0;

    for (const order of orders) {
      const progress = progressMap.get(order.id);
      const isFullySubmitted =
        (progress?.totalAssigned ?? 0) > 0 && (progress?.totalPending ?? 0) === 0;
      const deadlinePassed = order.deadline
        ? order.deadline.getTime() < now.getTime()
        : false;
      const isRunning = order.status === 'aktif' && !deadlinePassed;

      if (isFullySubmitted && deadlinePassed) {
        totalCompletedOrders += 1;
      }

      if (isRunning) {
        totalRunningOrders += 1;
        // Distribusi progress hanya menghitung tugas yang sedang berjalan.
        progressDistribution[
          getProgressBucket(progress?.percentageComplete ?? 0)
        ] += 1;
      }
    }

    return {
      stats: orderStatus,
      charts: {
        taskStatus: {
          running: totalRunningOrders,
          completed: totalCompletedOrders,
        },
        orderType,
        progressDistribution,
        weeklyOrders: buildWeeklyOrderTrend(orders, {
          dateFrom: parsed.submitDate,
          dateTo: parsed.submitDate ? this.endOfDay(parsed.submitDate) : undefined,
        }),
      },
    };
  }

  async createOrder(commanderId: string, body: unknown) {
    await this.hierarchyService.ensureCommander(commanderId);
    const parsed = baseOrderSchema.parse(body);
    this.validateOrderPayload(parsed, parsed.status);
    const parsedTargets = this.dedupeTargetInputs(parsed.targets);

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          createdById: commanderId,
          title: parsed.title,
          orderType: parsed.orderType,
          description: parsed.description,
          narration: parsed.narration,
          engagementActions: parsed.engagementActions,
          reportReason: parsed.reportReason,
          postingSourceUrl:
            parsed.orderType === 'posting'
              ? (parsed.postingSourceUrl ?? null)
              : null,
          postingTargetPlatforms:
            parsed.orderType === 'posting'
              ? (parsed.postingTargetPlatforms ?? [])
              : undefined,
          deadline: parsed.deadline,
          status: parsed.status,
          sentAt: parsed.status === 'aktif' ? new Date() : null,
        },
      });

      if (parsed.orderType !== 'posting' && parsed.targetUrls.length) {
        await tx.orderSocialTarget.createMany({
          data: this.mapSocialTargetsInput(parsed.targetUrls).map((target) => ({
            orderId: created.id,
            ...target,
          })),
        });
      }

      await tx.orderTarget.createMany({
        data: parsedTargets.map((target) => ({
          orderId: created.id,
          targetType: target.targetType,
          targetAudience:
            target.targetType === 'unit'
              ? (target.targetAudience ?? 'all_members')
              : 'direct_user',
          unitId: target.targetType === 'unit' ? (target.unitId ?? null) : null,
          userId:
            target.targetType === 'individual' ? (target.userId ?? null) : null,
        })),
      });

      return created;
    });

    await this.activityService.logOrderCreated({
      actorUserId: commanderId,
      orderId: order.id,
      occurredAt: order.createdAt,
    });

    if (parsed.status === 'aktif') {
      await this.broadcastOrder(order.id, commanderId);
      await this.activityService.logOrderSent({
        actorUserId: commanderId,
        orderId: order.id,
        occurredAt: order.sentAt ?? new Date(),
      });
      await this.triggerEngagementBaselineScrape(order.id, parsed.orderType);
    }

    return this.getOrderDetail(commanderId, order.id);
  }

  async getOrderDetail(commanderId: string, orderId: string) {
    const order = await this.ensureCommanderOrder(commanderId, orderId);
    await this.refreshOrderStatus(order.id);

    const [freshOrder, targets, socialTargets] = await this.prisma.$transaction(
      [
        this.prisma.order.findUniqueOrThrow({
          where: { id: order.id },
        }),
        this.prisma.orderTarget.findMany({
          where: { orderId: order.id },
          include: {
            unit: true,
            user: true,
          },
        }),
        this.prisma.orderSocialTarget.findMany({
          where: { orderId: order.id },
          orderBy: { sortOrder: 'asc' },
        }),
      ],
    );

    const progress = await this.getProgress(order.id);
    return {
      ...this.serializeOrder(freshOrder, progress, socialTargets),
      targets: targets.map((target) => ({
        id: target.id,
        targetType: target.targetType,
        targetAudience: target.targetAudience,
        resolvedMemberCount: target.resolvedMemberCount ?? 0,
        unit:
          target.unit && target.targetType === 'unit'
            ? {
                id: target.unit.id,
                name: target.unit.name,
                path: target.unit.path,
              }
            : null,
        user:
          target.user && target.targetType === 'individual'
            ? {
                id: target.user.id,
                fullName: target.user.fullName,
                username: target.user.username,
              }
            : null,
      })),
    };
  }

  async updateOrder(commanderId: string, orderId: string, body: unknown) {
    const order = await this.ensureCommanderOrder(commanderId, orderId);
    if (order.status !== 'draft') {
      throw new ApiException(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'BUSINESS_RULE_VIOLATED',
        'Hanya perintah draft yang dapat diperbarui',
      );
    }

    const parsed = updateOrderSchema.parse(body);
    const nextStatus = parsed.status ?? order.status;
    const activatedAt =
      order.status === 'draft' && parsed.status === 'aktif'
        ? new Date()
        : undefined;
    const existingSocialTargets = await this.prisma.orderSocialTarget.findMany({
      where: { orderId },
      orderBy: { sortOrder: 'asc' },
    });
    const nextOrderType = parsed.orderType ?? order.orderType;
    this.validateOrderPayload(
      {
        title: parsed.title ?? order.title,
        orderType: nextOrderType,
        description: parsed.description ?? order.description,
        targetUrls:
          nextOrderType === 'posting'
            ? []
            : (parsed.targetUrls ??
              existingSocialTargets.map((target) => ({
                platform: target.platform,
                url: target.url,
              }))),
        postingSourceUrl:
          parsed.postingSourceUrl ?? order.postingSourceUrl ?? undefined,
        postingTargetPlatforms:
          parsed.postingTargetPlatforms ??
          this.parsePostingTargetPlatforms(order.postingTargetPlatforms) ??
          undefined,
        narration: parsed.narration ?? order.narration ?? undefined,
        engagementActions:
          parsed.engagementActions ??
          (order.engagementActions as EngagementAction[] | null) ??
          undefined,
        reportReason: parsed.reportReason ?? order.reportReason ?? undefined,
        deadline: parsed.deadline ?? order.deadline,
        status: nextStatus,
        targets:
          parsed.targets ??
          (
            await this.prisma.orderTarget.findMany({
              where: { orderId },
            })
          ).map((target) => ({
            targetType: target.targetType,
            targetAudience:
              target.targetType === 'unit'
                ? this.toInputTargetAudience(target.targetAudience)
                : undefined,
            unitId: target.unitId ?? undefined,
            userId: target.userId ?? undefined,
          })),
      },
      nextStatus,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          ...(parsed.title ? { title: parsed.title } : {}),
          ...(parsed.orderType ? { orderType: parsed.orderType } : {}),
          ...(parsed.description ? { description: parsed.description } : {}),
          ...(parsed.narration !== undefined
            ? { narration: parsed.narration }
            : {}),
          ...(parsed.engagementActions !== undefined
            ? {
                engagementActions: parsed.engagementActions,
              }
            : {}),
          ...(parsed.reportReason !== undefined
            ? { reportReason: parsed.reportReason }
            : {}),
          ...(parsed.postingSourceUrl !== undefined
            ? { postingSourceUrl: parsed.postingSourceUrl }
            : {}),
          ...(parsed.postingTargetPlatforms !== undefined
            ? { postingTargetPlatforms: parsed.postingTargetPlatforms }
            : {}),
          ...(parsed.deadline ? { deadline: parsed.deadline } : {}),
          ...(parsed.status
            ? {
                status: parsed.status,
                ...(activatedAt ? { sentAt: activatedAt } : {}),
              }
            : {}),
        },
      });

      if (parsed.targetUrls && nextOrderType !== 'posting') {
        await tx.orderSocialTarget.deleteMany({ where: { orderId } });
        await tx.orderSocialTarget.createMany({
          data: this.mapSocialTargetsInput(parsed.targetUrls).map((target) => ({
            orderId,
            ...target,
          })),
        });
      }

      if (
        nextOrderType === 'posting' &&
        (parsed.postingSourceUrl !== undefined ||
          parsed.postingTargetPlatforms !== undefined)
      ) {
        await tx.orderSocialTarget.deleteMany({ where: { orderId } });
      }

      if (parsed.targets) {
        const parsedTargets = this.dedupeTargetInputs(parsed.targets);
        await tx.orderTarget.deleteMany({
          where: { orderId },
        });
        await tx.orderTarget.createMany({
          data: parsedTargets.map((target) => ({
            orderId,
            targetType: target.targetType,
            targetAudience:
              target.targetType === 'unit'
                ? (target.targetAudience ?? 'all_members')
                : 'direct_user',
            unitId:
              target.targetType === 'unit' ? (target.unitId ?? null) : null,
            userId:
              target.targetType === 'individual'
                ? (target.userId ?? null)
                : null,
          })),
        });
      }
    });

    if (order.status === 'draft' && parsed.status === 'aktif') {
      await this.broadcastOrder(orderId, commanderId);
      await this.activityService.logOrderSent({
        actorUserId: commanderId,
        orderId,
        occurredAt: activatedAt,
      });
      await this.triggerEngagementBaselineScrape(orderId, nextOrderType);
    }

    return this.getOrderDetail(commanderId, orderId);
  }

  async sendOrder(commanderId: string, orderId: string) {
    const order = await this.ensureCommanderOrder(commanderId, orderId);
    if (order.status !== 'draft') {
      throw new ApiException(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'BUSINESS_RULE_VIOLATED',
        'Hanya order draft yang dapat dikirim',
      );
    }

    const [orderTargets, socialTargets] = await Promise.all([
      this.prisma.orderTarget.findMany({ where: { orderId } }),
      this.prisma.orderSocialTarget.findMany({
        where: { orderId },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    this.validateOrderPayload(
      {
        title: order.title,
        orderType: order.orderType,
        description: order.description,
        targetUrls:
          order.orderType === 'posting'
            ? []
            : socialTargets.map((target) => ({
                platform: target.platform,
                url: target.url,
              })),
        postingSourceUrl: order.postingSourceUrl ?? undefined,
        postingTargetPlatforms:
          this.parsePostingTargetPlatforms(order.postingTargetPlatforms) ??
          undefined,
        narration: order.narration ?? undefined,
        engagementActions:
          (order.engagementActions as EngagementAction[] | null) ?? undefined,
        reportReason: order.reportReason ?? undefined,
        deadline: order.deadline,
        status: 'aktif',
        targets: orderTargets.map((target) => ({
          targetType: target.targetType,
          targetAudience:
            target.targetType === 'unit'
              ? this.toInputTargetAudience(target.targetAudience)
              : undefined,
          unitId: target.unitId ?? undefined,
          userId: target.userId ?? undefined,
        })),
      },
      'aktif',
    );

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'aktif',
        sentAt: new Date(),
      },
    });

    await this.broadcastOrder(orderId, commanderId);
    await this.activityService.logOrderSent({
      actorUserId: commanderId,
      orderId,
    });
    await this.triggerEngagementBaselineScrape(orderId, order.orderType);
    return this.getOrderDetail(commanderId, orderId);
  }

  async cancelOrder(commanderId: string, orderId: string) {
    const order = await this.ensureCommanderOrder(commanderId, orderId);
    if (order.status !== 'aktif') {
      throw new ApiException(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'BUSINESS_RULE_VIOLATED',
        'Hanya perintah aktif yang dapat dibatalkan',
      );
    }

    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'dibatalkan',
        },
      }),
      this.prisma.taskAssignment.deleteMany({
        where: {
          orderId,
          status: 'belum_dikerjakan',
        },
      }),
    ]);
  }

  async listOrderAssignments(
    commanderId: string,
    orderId: string,
    query: unknown,
  ) {
    const order = await this.ensureCommanderOrder(commanderId, orderId);
    const parsed = listOrderAssignmentsQuerySchema.parse(query);
    const postingTargetPlatforms = Array.isArray(order.postingTargetPlatforms)
      ? (order.postingTargetPlatforms as string[])
      : null;
    const socialTargets =
      order.orderType === 'engagement'
        ? await this.prisma.orderSocialTarget.findMany({
            where: { orderId },
            orderBy: { sortOrder: 'asc' },
          })
        : [];
    const where: Prisma.TaskAssignmentWhereInput = {
      orderId,
      ...(parsed.status ? { status: parsed.status } : {}),
      ...(parsed.unitId
        ? {
            user: {
              unitMemberships: {
                some: {
                  unitId: parsed.unitId,
                  removedAt: null,
                },
              },
            },
          }
        : {}),
    };

    const [assignments, total] = await this.prisma.$transaction([
      this.prisma.taskAssignment.findMany({
        where,
        include: {
          user: {
            include: {
              unitMemberships: {
                where: { removedAt: null },
                include: { unit: true },
                take: 1,
              },
            },
          },
          submissions: {
            where: { isLatest: true },
            include: {
              submittedBy: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                },
              },
            },
            take: 1,
          },
        },
        orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
        skip: (parsed.page - 1) * parsed.limit,
        take: parsed.limit,
      }),
      this.prisma.taskAssignment.count({ where }),
    ]);

    return {
      items: assignments.map((assignment) =>
        this.serializeAssignmentItem(
          assignment,
          commanderId,
          order.orderType,
          postingTargetPlatforms,
          socialTargets,
        ),
      ),
      meta: {
        pagination: buildPaginationMeta(parsed.page, parsed.limit, total),
      },
    };
  }

  async listOrderAssignmentsByUnit(commanderId: string, orderId: string) {
    const order = await this.ensureCommanderOrder(commanderId, orderId);
    const postingTargetPlatforms = Array.isArray(order.postingTargetPlatforms)
      ? (order.postingTargetPlatforms as string[])
      : null;
    const socialTargets =
      order.orderType === 'engagement'
        ? await this.prisma.orderSocialTarget.findMany({
            where: { orderId },
            orderBy: { sortOrder: 'asc' },
          })
        : [];
    const assignments = await this.prisma.taskAssignment.findMany({
      where: {
        orderId,
      },
      include: {
        user: {
          include: {
            unitMemberships: {
              where: { removedAt: null },
              include: {
                unit: true,
              },
              take: 1,
            },
          },
        },
        submissions: {
          where: { isLatest: true },
          include: {
            submittedBy: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },
          },
          take: 1,
        },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
    });

    const unitIds = Array.from(
      new Set(
        assignments
          .map((assignment) => assignment.user.unitMemberships[0]?.unit.id)
          .filter((unitId): unitId is string => Boolean(unitId)),
      ),
    );
    const unitRows = await this.prisma.unit.findMany({
      where: {
        id: {
          in: unitIds,
        },
      },
      include: {
        commander: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
      },
    });
    const unitDetailMap = new Map(unitRows.map((unit) => [unit.id, unit]));
    const units = new Map<
      string,
      {
        unit: {
          id: string;
          name: string;
          path: string;
          depthLevel: number;
          commander: {
            id: string;
            fullName: string;
            username: string;
          } | null;
        };
        progress: AssignmentProgress;
        members: SerializedAssignmentItem[];
      }
    >();

    for (const assignment of assignments) {
      const memberUnit = assignment.user.unitMemberships[0]?.unit;
      if (!memberUnit) {
        continue;
      }

      const assignmentItem = this.serializeAssignmentItem(
        assignment,
        commanderId,
        order.orderType,
        postingTargetPlatforms,
        socialTargets,
      );

      const current =
        units.get(memberUnit.id) ??
        (() => {
          const unitDetail = unitDetailMap.get(memberUnit.id);
          const next = {
            unit: {
              id: memberUnit.id,
              name: memberUnit.name,
              path: memberUnit.path,
              depthLevel: memberUnit.depthLevel,
              commander: unitDetail?.commander
                ? {
                    id: unitDetail.commander.id,
                    fullName: unitDetail.commander.fullName,
                    username: unitDetail.commander.username,
                  }
                : null,
            },
            progress: this.createEmptyProgress(),
            members: [] as SerializedAssignmentItem[],
          };
          units.set(memberUnit.id, next);
          return next;
        })();

      current.members.push(assignmentItem);
      this.accumulateAssignmentProgress(
        current.progress,
        assignment.status,
        assignmentItem.latestSubmission?.metrics,
      );
    }

    const summary = await this.getProgress(orderId);

    return {
      summary,
      units: Array.from(units.values())
        .map((item) => ({
          ...item,
          progress: this.finalizeProgress(item.progress),
        }))
        .sort((left, right) => left.unit.path.localeCompare(right.unit.path)),
    };
  }

  async exportAssignments(commanderId: string, orderId: string) {
    const detail = await this.getOrderDetail(commanderId, orderId);
    const assignments = await this.listOrderAssignments(commanderId, orderId, {
      page: 1,
      limit: 1000,
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Progress');

    worksheet.columns = [
      { header: 'Nama Anggota', key: 'fullName', width: 28 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Satuan', key: 'unitName', width: 24 },
      { header: 'Status', key: 'status', width: 18 },
      { header: 'Waktu Submit', key: 'submittedAt', width: 24 },
      { header: 'Diinput Oleh', key: 'submittedBy', width: 28 },
      { header: 'Link Drive', key: 'driveLink', width: 48 },
      { header: 'Views', key: 'views', width: 14 },
      { header: 'Likes', key: 'likes', width: 14 },
      { header: 'Comments', key: 'comments', width: 14 },
      { header: 'Shares', key: 'shares', width: 14 },
      { header: 'Reposts', key: 'reposts', width: 14 },
      { header: 'Catatan', key: 'notes', width: 40 },
    ];

    worksheet.addRow([]);
    worksheet.getCell('A1').value = `Order: ${detail.title}`;
    worksheet.getCell('A2').value =
      `Deadline: ${detail.deadline.toISOString()}`;

    for (const item of assignments.items) {
      worksheet.addRow({
        fullName: item.user.fullName,
        username: item.user.username,
        unitName: item.unit?.name ?? '-',
        status: item.status,
        submittedAt: item.latestSubmission?.submittedAt
          ? item.latestSubmission.submittedAt.toISOString()
          : '-',
        submittedBy: item.latestSubmission?.submittedBy?.fullName ?? '-',
        driveLink: item.latestSubmission?.driveLink ?? '-',
        views: item.latestSubmission?.metrics.views ?? 0,
        likes: item.latestSubmission?.metrics.likes ?? 0,
        comments: item.latestSubmission?.metrics.comments ?? 0,
        shares: item.latestSubmission?.metrics.shares ?? 0,
        reposts: item.latestSubmission?.metrics.reposts ?? 0,
        notes: item.latestSubmission?.notes ?? '-',
      });
    }

    return workbook.xlsx.writeBuffer();
  }

  async getProgress(orderId: string): Promise<AssignmentProgress> {
    const assignments = await this.prisma.taskAssignment.groupBy({
      by: ['status'],
      where: { orderId },
      _count: {
        _all: true,
      },
    });

    const totalAssigned = assignments.reduce(
      (acc, item) => acc + item._count._all,
      0,
    );
    const totalOnTime =
      assignments.find((item) => item.status === 'selesai')?._count._all ?? 0;
    const totalLate =
      assignments.find((item) => item.status === 'terlambat')?._count._all ?? 0;
    const totalPending =
      assignments.find((item) => item.status === 'belum_dikerjakan')?._count
        ._all ?? 0;
    const totalSubmitted = totalOnTime + totalLate;
    const metricTotals = await this.getMetricTotals(orderId);
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { orderType: true },
    });
    const targetMetricTotals =
      order?.orderType === 'engagement'
        ? await this.getTargetMetricTotals(orderId)
        : undefined;
    const baselineMetricTotals =
      targetMetricTotals?.length
        ? sumTargetBaselineMetrics(targetMetricTotals)
        : undefined;
    const deltaMetricTotals = baselineMetricTotals
      ? metricTotals
      : undefined;
    const accumulatedMetricTotals =
      baselineMetricTotals && metricTotals
        ? sumMetrics(baselineMetricTotals, metricTotals)
        : undefined;

    return {
      totalAssigned,
      totalSubmitted,
      totalOnTime,
      totalLate,
      totalPending,
      percentageComplete:
        totalAssigned === 0
          ? 0
          : Math.round((totalSubmitted / totalAssigned) * 10000) / 100,
      metricTotals,
      ...(baselineMetricTotals
        ? { baselineMetricTotals, deltaMetricTotals, accumulatedMetricTotals }
        : {}),
      ...(targetMetricTotals?.length ? { targetMetricTotals } : {}),
    };
  }

  async refreshOrderStatus(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || !['aktif', 'expired'].includes(order.status)) {
      return;
    }

    const progress = await this.getProgress(orderId);
    let nextStatus: OrderStatus = order.status;

    if (progress.totalAssigned > 0 && progress.totalPending === 0) {
      nextStatus = 'selesai';
    } else if (order.deadline < new Date() && progress.totalPending > 0) {
      nextStatus = 'expired';
    } else if (order.deadline >= new Date() && order.status === 'expired') {
      nextStatus = 'aktif';
    }

    if (nextStatus !== order.status) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: nextStatus },
      });
    }
  }

  private async broadcastOrder(orderId: string, commanderId: string) {
    const targets = await this.prisma.orderTarget.findMany({
      where: { orderId },
    });

    const memberIds = new Set<string>();

    for (const target of targets) {
      const resolvedMembers = await this.resolveTargetAllMemberIds(
        commanderId,
        target,
      );

      resolvedMembers.forEach((memberId) => memberIds.add(memberId));

      await this.prisma.orderTarget.update({
        where: { id: target.id },
        data: {
          resolvedMemberCount: resolvedMembers.length,
        },
      });
    }

    if (memberIds.size === 0) {
      throw new ApiException(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'BUSINESS_RULE_VIOLATED',
        'Tidak ada anggota aktif yang berhasil di-resolve dari target perintah',
      );
    }

    const existingAssignments = await this.prisma.taskAssignment.findMany({
      where: {
        orderId,
      },
      select: {
        userId: true,
      },
    });

    const existingUserIds = new Set(
      existingAssignments.map((item) => item.userId),
    );
    const data = Array.from(memberIds)
      .filter((memberId) => !existingUserIds.has(memberId))
      .map((memberId) => ({
        orderId,
        userId: memberId,
      }));

    if (data.length) {
      await this.prisma.taskAssignment.createMany({ data });
    }
  }

  async getMetricsDashboard(
    userId: string,
    userRole: string,
    orderId: string,
  ) {
    const order = await this.ensureMetricsDashboardAccess(
      userId,
      userRole,
      orderId,
    );

    if (order.orderType !== 'engagement') {
      throw new ApiException(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'BUSINESS_RULE_VIOLATED',
        'Dashboard metrik hanya tersedia untuk tugas blasting',
      );
    }

    const [socialTargets, scrapeRuns, submissions] = await Promise.all([
      this.prisma.orderSocialTarget.findMany({
        where: { orderId },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.metricScrapeRun.findMany({
        where: { orderId },
        orderBy: { startedAt: 'asc' },
      }),
      this.prisma.submission.findMany({
        where: {
          isLatest: true,
          assignment: { orderId },
        },
        select: { targetMetrics: true },
      }),
    ]);

    const personnelByTarget = new Map(
      aggregateTargetMetricTotals(socialTargets, submissions).map((entry) => [
        entry.targetId,
        entry,
      ]),
    );

    const targets = socialTargets.map((target) => {
      const baselineMetrics = normalizeMetrics(target.baselineMetrics);
      const finalMetrics = normalizeMetrics(target.finalMetrics);
      const personnelEntry = personnelByTarget.get(target.id);
      const personnelMetrics =
        personnelEntry?.metrics ?? { ...emptySubmissionMetrics };
      const accumulatedMetrics =
        personnelEntry?.accumulatedMetrics ??
        sumMetrics(baselineMetrics, personnelMetrics);
      const deltaMetrics = subtractMetrics(finalMetrics, baselineMetrics);

      return {
        targetId: target.id,
        platform: target.platform,
        url: target.url,
        baselineMetrics,
        personnelMetrics,
        accumulatedMetrics,
        finalMetrics,
        baselineScrapedAt: target.baselineScrapedAt?.toISOString() ?? null,
        finalScrapedAt: target.finalScrapedAt?.toISOString() ?? null,
        deltaMetrics,
        growthPercent: computeGrowthPercent(baselineMetrics, finalMetrics),
        scrapeRuns: scrapeRuns
          .filter((run) => run.orderSocialTargetId === target.id)
          .map((run) => ({
            phase: run.phase,
            status: run.status,
            errorMessage: run.errorMessage,
            completedAt: run.completedAt?.toISOString() ?? null,
          })),
      };
    });

    const scrapedTotals = aggregateScrapedTotals(
      socialTargets.map((target) => ({
        baselineMetrics: normalizeMetrics(target.baselineMetrics),
        finalMetrics: normalizeMetrics(target.finalMetrics),
      })),
    );
    const personnelTotals = Array.from(personnelByTarget.values()).reduce(
      (total, entry) => sumMetrics(total, entry.metrics),
      { ...emptySubmissionMetrics },
    );

    return {
      orderId: order.id,
      status: order.status,
      deadline: order.deadline.toISOString(),
      scrapeStatus: {
        baseline: summarizeScrapePhaseStatus(scrapeRuns, 'baseline'),
        deadline: summarizeScrapePhaseStatus(scrapeRuns, 'deadline'),
      },
      targets,
      totals: {
        ...scrapedTotals,
        personnel: personnelTotals,
        accumulated: sumMetrics(scrapedTotals.baseline, personnelTotals),
      },
    };
  }

  async retryMetricsScrape(
    userId: string,
    userRole: string,
    orderId: string,
    phase: MetricScrapePhase,
  ) {
    const order = await this.ensureMetricsDashboardAccess(
      userId,
      userRole,
      orderId,
    );

    if (order.orderType !== 'engagement') {
      throw new ApiException(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'BUSINESS_RULE_VIOLATED',
        'Retry scrape hanya tersedia untuk tugas blasting',
      );
    }

    if (phase === 'baseline') {
      await this.apifyService.retryScrape(orderId, 'baseline');
    } else {
      await this.apifyService.retryScrape(orderId, 'deadline');
    }

    return this.getMetricsDashboard(userId, userRole, orderId);
  }

  private async triggerEngagementBaselineScrape(
    orderId: string,
    orderType: OrderType,
  ) {
    if (orderType !== 'engagement') {
      return;
    }

    await this.apifyService.triggerBaselineScrape(orderId);
  }

  private async ensureMetricsDashboardAccess(
    userId: string,
    userRole: string,
    orderId: string,
  ) {
    if (userRole === 'super_admin') {
      const order = await this.prisma.order.findFirst({
        where: {
          id: orderId,
          deletedAt: null,
        },
      });

      if (!order) {
        throw new ApiException(
          HttpStatus.NOT_FOUND,
          'NOT_FOUND',
          'Order tidak ditemukan',
        );
      }

      return order;
    }

    return this.ensureCommanderOrder(userId, orderId);
  }

  private async ensureCommanderOrder(commanderId: string, orderId: string) {
    await this.hierarchyService.ensureCommander(commanderId);
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        createdById: commanderId,
        deletedAt: null,
      },
    });

    if (!order) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'NOT_FOUND',
        'Order tidak ditemukan',
      );
    }

    return order;
  }

  private endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  private buildOrdersWhere(
    commanderId: string,
    query: {
      status?: OrderStatus;
      orderType?: OrderType;
      submitDate?: Date;
      deadlineDate?: Date;
      search?: string;
    },
  ): Prisma.OrderWhereInput {
    const submitDayEnd = query.submitDate
      ? this.endOfDay(query.submitDate)
      : undefined;
    const deadlineDayEnd = query.deadlineDate
      ? this.endOfDay(query.deadlineDate)
      : undefined;
    const filterConditions: Prisma.OrderWhereInput[] = [];

    if (query.search) {
      filterConditions.push({
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          { narration: { contains: query.search, mode: 'insensitive' } },
          { reportReason: { contains: query.search, mode: 'insensitive' } },
        ],
      });
    }

    if (query.submitDate) {
      filterConditions.push({
        OR: [
          {
            sentAt: {
              gte: query.submitDate,
              lte: submitDayEnd,
            },
          },
          {
            sentAt: null,
            createdAt: {
              gte: query.submitDate,
              lte: submitDayEnd,
            },
          },
        ],
      });
    }

    return {
      createdById: commanderId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.orderType ? { orderType: query.orderType } : {}),
      ...(filterConditions.length ? { AND: filterConditions } : {}),
      ...(query.deadlineDate
        ? {
            deadline: {
              gte: query.deadlineDate,
              lte: deadlineDayEnd,
            },
          }
        : {}),
    };
  }

  private buildListOrdersOrderBy(
    sortBy: 'createdAt' | 'deadline' | 'title' | 'sentAt',
    sortOrder: 'asc' | 'desc',
  ): Prisma.OrderOrderByWithRelationInput[] {
    if (sortBy === 'sentAt') {
      return [{ sentAt: sortOrder }, { createdAt: sortOrder }];
    }

    return [{ [sortBy]: sortOrder }];
  }

  private serializeOrder(
    order: {
      id: string;
      title: string;
      orderType: OrderType;
      description: string;
      narration: string | null;
      engagementActions: Prisma.JsonValue | null;
      reportReason: string | null;
      postingSourceUrl: string | null;
      postingTargetPlatforms: Prisma.JsonValue | null;
      status: OrderStatus;
      deadline: Date;
      sentAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    },
    progress?: AssignmentProgress,
    socialTargets: Array<{
      id: string;
      platform: SocialPlatform;
      url: string;
      baselineMetrics: Prisma.JsonValue | null;
      finalMetrics?: Prisma.JsonValue | null;
      baselineScrapedAt?: Date | null;
      finalScrapedAt?: Date | null;
      sortOrder: number;
    }> = [],
  ) {
    const now = Date.now();
    const deadlineMs = order.deadline.getTime();
    const hoursUntilDeadline =
      deadlineMs > now
        ? Math.floor((deadlineMs - now) / (1000 * 60 * 60))
        : null;

    return {
      id: order.id,
      title: order.title,
      orderType: serializeOrderType(order.orderType),
      description: order.description,
      targetUrls: socialTargets.map((target) => ({
        id: target.id,
        platform: target.platform,
        url: target.url,
        baselineMetrics: normalizeMetrics(target.baselineMetrics),
        finalMetrics: normalizeMetrics(target.finalMetrics),
        baselineScrapedAt: target.baselineScrapedAt?.toISOString() ?? null,
        finalScrapedAt: target.finalScrapedAt?.toISOString() ?? null,
      })),
      narration: order.narration,
      engagementActions: order.engagementActions,
      reportReason: order.reportReason,
      postingSourceUrl: order.postingSourceUrl,
      postingTargetPlatforms: this.parsePostingTargetPlatforms(
        order.postingTargetPlatforms,
      ),
      status: order.status,
      deadline: order.deadline,
      sentAt: order.sentAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      hoursUntilDeadline,
      isNearDeadline: hoursUntilDeadline !== null && hoursUntilDeadline < 24,
      progress:
        progress ?? this.createEmptyProgress(),
    };
  }

  async getProgressMap(orderIds: string[]) {
    if (!orderIds.length) {
      return new Map<string, AssignmentProgress>();
    }

    const [grouped, metricTotalsMap] = await Promise.all([
      this.prisma.taskAssignment.groupBy({
        by: ['orderId', 'status'],
        where: {
          orderId: {
            in: orderIds,
          },
        },
        _count: {
          _all: true,
        },
      }),
      this.getMetricTotalsMap(orderIds),
    ]);

    const map = new Map<string, AssignmentProgress>();
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
        metricTotals:
          metricTotalsMap.get(orderId) ?? { ...emptySubmissionMetrics },
      });
    }

    return map;
  }

  private async getMetricTotals(orderId: string): Promise<SubmissionMetrics> {
    const map = await this.getMetricTotalsMap([orderId]);
    return map.get(orderId) ?? { ...emptySubmissionMetrics };
  }

  private async getTargetMetricTotals(
    orderId: string,
  ): Promise<TargetMetricTotal[]> {
    const socialTargets = await this.prisma.orderSocialTarget.findMany({
      where: { orderId },
      orderBy: { sortOrder: 'asc' },
    });

    if (!socialTargets.length) {
      return [];
    }

    const submissions = await this.prisma.submission.findMany({
      where: {
        isLatest: true,
        assignment: { orderId },
      },
      select: {
        targetMetrics: true,
      },
    });

    return aggregateTargetMetricTotals(socialTargets, submissions);
  }

  private async getMetricTotalsMap(orderIds: string[]) {
    const map = new Map<string, SubmissionMetrics>();
    if (!orderIds.length) {
      return map;
    }

    for (const orderId of orderIds) {
      map.set(orderId, { ...emptySubmissionMetrics });
    }

    const submissions = await this.prisma.submission.findMany({
      where: {
        isLatest: true,
        assignment: {
          orderId: {
            in: orderIds,
          },
        },
      },
      select: {
        views: true,
        likes: true,
        comments: true,
        shares: true,
        reposts: true,
        targetMetrics: true,
        assignment: {
          select: {
            orderId: true,
          },
        },
      },
    });

    for (const submission of submissions) {
      const current =
        map.get(submission.assignment.orderId) ?? { ...emptySubmissionMetrics };
      const resolved = resolveSubmissionMetrics(submission);
      current.views += resolved.views;
      current.likes += resolved.likes;
      current.comments += resolved.comments;
      current.shares += resolved.shares;
      current.reposts += resolved.reposts;
      map.set(submission.assignment.orderId, current);
    }

    return map;
  }

  private parsePostingTargetPlatforms(
    value: Prisma.JsonValue | null | undefined,
  ): SocialPlatform[] | null {
    if (!Array.isArray(value)) {
      return null;
    }

    return value.filter(
      (item): item is SocialPlatform => typeof item === 'string',
    );
  }

  private mapSocialTargetsInput(
    targetUrls: Array<{
      platform: SocialPlatform;
      url: string;
    }>,
  ) {
    return targetUrls.map((target, index) => ({
      platform: target.platform,
      url: target.url,
      sortOrder: index,
    }));
  }

  private async getSocialTargetsMap(orderIds: string[]) {
    if (!orderIds.length) {
      return new Map<
        string,
        Array<{
          id: string;
          platform: SocialPlatform;
          url: string;
          baselineMetrics: Prisma.JsonValue | null;
          sortOrder: number;
        }>
      >();
    }

    const rows = await this.prisma.orderSocialTarget.findMany({
      where: {
        orderId: {
          in: orderIds,
        },
      },
      orderBy: [{ orderId: 'asc' }, { sortOrder: 'asc' }],
    });

    const map = new Map<
      string,
      Array<{
        id: string;
        platform: SocialPlatform;
        url: string;
        baselineMetrics: Prisma.JsonValue | null;
        sortOrder: number;
      }>
    >();

    for (const row of rows) {
      const current = map.get(row.orderId) ?? [];
      current.push(row);
      map.set(row.orderId, current);
    }

    return map;
  }

  private validateOrderPayload(
    payload: BaseOrderInput,
    targetStatus: 'draft' | 'aktif',
  ) {
    if (
      targetStatus === 'aktif' &&
      payload.deadline.getTime() < Date.now() + 3600_000
    ) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        'Deadline minimal 1 jam dari waktu pengiriman',
      );
    }

    if (
      payload.orderType === 'engagement' &&
      !payload.engagementActions?.length
    ) {
      payload.engagementActions = ['like', 'share', 'repost'];
    }

    if (payload.orderType === 'counter' && !payload.narration) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        'Perintah counter wajib memiliki narasi',
      );
    }

    if (payload.orderType === 'report_akun' && !payload.reportReason) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        'Perintah report akun wajib memiliki alasan report',
      );
    }

    if (payload.orderType === 'posting') {
      if (!payload.postingTargetPlatforms?.length) {
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          'VALIDATION_ERROR',
          'Pilih minimal satu target sosmed posting',
        );
      }
    } else if (!payload.targetUrls.length) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        'URL target wajib diisi',
      );
    }

    for (const target of payload.targets) {
      if (target.targetType === 'unit' && !target.unitId) {
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          'VALIDATION_ERROR',
          'Target satuan wajib menyertakan unitId',
        );
      }

      if (
        target.targetType === 'unit' &&
        target.targetAudience &&
        !['all_members', 'unit_leaders'].includes(target.targetAudience)
      ) {
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          'VALIDATION_ERROR',
          'Mode target satuan tidak valid',
        );
      }

      if (target.targetType === 'individual' && !target.userId) {
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          'VALIDATION_ERROR',
          'Target individu wajib menyertakan userId',
        );
      }
    }
  }

  private dedupeTargetInputs(targets: BaseOrderInput['targets']) {
    const map = new Map<string, BaseOrderInput['targets'][number]>();

    for (const target of targets) {
      const audience =
        target.targetType === 'unit'
          ? (target.targetAudience ?? 'all_members')
          : 'direct_user';

      map.set(
        [
          target.targetType,
          audience,
          target.unitId ?? '',
          target.userId ?? '',
        ].join(':'),
        target,
      );
    }

    return Array.from(map.values());
  }

  private async resolveTargetAllMemberIds(
    commanderId: string,
    target: {
      targetType: 'unit' | 'individual';
      targetAudience: OrderTargetAudience;
      unitId: string | null;
      userId: string | null;
    },
  ) {
    if (target.targetType === 'unit' && target.unitId) {
      await this.hierarchyService.assertUnitInHierarchy(
        commanderId,
        target.unitId,
      );

      if (target.targetAudience === 'unit_leaders') {
        return this.hierarchyService.resolveUnitLeaderIds(target.unitId);
      }

      return this.hierarchyService.resolveUnitAllMemberIds(target.unitId);
    }

    if (target.targetType === 'individual' && target.userId) {
      await this.hierarchyService.assertUserInHierarchy(
        commanderId,
        target.userId,
      );
      return [target.userId];
    }

    return [];
  }

  private async resolveTargetMemberIds(
    commanderId: string,
    target: {
      targetType: 'unit' | 'individual';
      targetAudience: OrderTargetAudience;
      unitId: string | null;
      userId: string | null;
    },
  ) {
    if (target.targetType === 'unit' && target.unitId) {
      await this.hierarchyService.assertUnitInHierarchy(
        commanderId,
        target.unitId,
      );

      if (target.targetAudience === 'unit_leaders') {
        return this.hierarchyService.resolveUnitLeaderIds(target.unitId);
      }

      return this.hierarchyService.resolveUnitMemberIds(target.unitId);
    }

    if (target.targetType === 'individual' && target.userId) {
      await this.hierarchyService.assertUserInHierarchy(
        commanderId,
        target.userId,
      );
      return [target.userId];
    }

    return [];
  }

  private toInputTargetAudience(
    targetAudience: OrderTargetAudience | null | undefined,
  ): 'all_members' | 'unit_leaders' | undefined {
    if (targetAudience === 'unit_leaders') {
      return 'unit_leaders';
    }

    if (targetAudience === 'all_members') {
      return 'all_members';
    }

    return undefined;
  }

  private serializeAssignmentItem(
    assignment: {
      id: string;
      status: 'belum_dikerjakan' | 'selesai' | 'terlambat';
      assignedAt: Date;
      completedAt: Date | null;
      user: {
        id: string;
        fullName: string;
        username: string;
        unitMemberships: Array<{
          unit: {
            id: string;
            name: string;
            path: string;
            commanderId: string | null;
            leaderOnlyAssignments: boolean;
          };
        }>;
      };
      submissions: Array<{
        id: string;
        userId: string;
        submittedByUserId: string | null;
        submissionSource: string | null;
        driveLink: string | null;
        platformLinks: Prisma.JsonValue;
        views: number;
        likes: number;
        comments: number;
        shares: number;
        reposts: number;
        notes: string | null;
        submittedAt: Date;
        submittedBy: {
          id: string;
          fullName: string;
          username: string;
        } | null;
      }>;
    },
    commanderId: string,
    orderType: OrderType,
    postingTargetPlatforms: string[] | null,
    blastingTargets: Array<{
      id: string;
      platform: SocialPlatform;
      url: string;
      baselineMetrics: Prisma.JsonValue | null;
    }> = [],
  ): SerializedAssignmentItem {
    const memberUnit = assignment.user.unitMemberships[0]?.unit;
    const isLeaderOnlyUnit = memberUnit?.leaderOnlyAssignments ?? false;
    const isUnitCommander = memberUnit?.commanderId === assignment.user.id;
    const hasOwnSubmission = Boolean(assignment.submissions[0]);
    const isRepresentedMember =
      isLeaderOnlyUnit &&
      !isUnitCommander &&
      assignment.status !== 'belum_dikerjakan' &&
      !hasOwnSubmission;

    return {
      id: assignment.id,
      status: assignment.status,
      assignedAt: assignment.assignedAt,
      completedAt: assignment.completedAt,
      user: {
        id: assignment.user.id,
        fullName: assignment.user.fullName,
        username: assignment.user.username,
      },
      unit: memberUnit
        ? {
            id: memberUnit.id,
            name: memberUnit.name,
            path: memberUnit.path,
            leaderOnlyAssignments: memberUnit.leaderOnlyAssignments,
            commanderId: memberUnit.commanderId,
          }
        : null,
      canSubmitForMember:
        memberUnit?.commanderId === commanderId && orderType === 'posting',
      canSubmitUnitTotal:
        isLeaderOnlyUnit &&
        isUnitCommander &&
        memberUnit?.commanderId === commanderId &&
        orderType !== 'posting',
      representedByLeader: isRepresentedMember,
      latestSubmission: isRepresentedMember
        ? null
        : serializeLatestSubmission(
            assignment.submissions[0],
            orderType,
            postingTargetPlatforms,
            blastingTargets,
          ),
    };
  }

  private createEmptyProgress(): AssignmentProgress {
    return {
      totalAssigned: 0,
      totalSubmitted: 0,
      totalOnTime: 0,
      totalLate: 0,
      totalPending: 0,
      percentageComplete: 0,
      metricTotals: { ...emptySubmissionMetrics },
    };
  }

  private accumulateAssignmentProgress(
    progress: AssignmentProgress,
    status: 'belum_dikerjakan' | 'selesai' | 'terlambat',
    metrics?: SubmissionMetrics,
  ) {
    progress.totalAssigned += 1;
    if (status !== 'belum_dikerjakan') {
      progress.totalSubmitted += 1;
    }
    if (status === 'selesai') {
      progress.totalOnTime += 1;
    }
    if (status === 'terlambat') {
      progress.totalLate += 1;
    }
    if (status === 'belum_dikerjakan') {
      progress.totalPending += 1;
    }

    if (metrics) {
      progress.metricTotals.views += metrics.views;
      progress.metricTotals.likes += metrics.likes;
      progress.metricTotals.comments += metrics.comments;
      progress.metricTotals.shares += metrics.shares;
      progress.metricTotals.reposts += metrics.reposts;
    }
  }

  private finalizeProgress(progress: AssignmentProgress): AssignmentProgress {
    return {
      ...progress,
      percentageComplete:
        progress.totalAssigned === 0
          ? 0
          : Math.round((progress.totalSubmitted / progress.totalAssigned) * 10000) /
            100,
    };
  }
}
