import { HttpStatus, Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { ActivityService } from '../activity/activity.service';
import { HierarchyService } from '../common/hierarchy.service';
import { PrismaService } from '../common/prisma.service';
import { ApiException } from '../common/utils/api-exception.util';
import { buildPaginationMeta } from '../common/utils/api-response.util';
import {
  emptySubmissionMetrics,
  serializeLatestSubmission,
  type SubmissionMetrics,
} from '../common/utils/submission.util';
import {
  OrderStatus,
  OrderTargetAudience,
  OrderType,
  Prisma,
  SocialPlatform,
} from '@prisma/client';
import {
  baseOrderSchema,
  type BaseOrderInput,
  type EngagementAction,
  listOrderAssignmentsQuerySchema,
  listOrdersQuerySchema,
  updateOrderSchema,
} from './orders.schema';

type AssignmentProgress = {
  totalAssigned: number;
  totalSubmitted: number;
  totalOnTime: number;
  totalLate: number;
  totalPending: number;
  percentageComplete: number;
  metricTotals: SubmissionMetrics;
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hierarchyService: HierarchyService,
    private readonly activityService: ActivityService,
  ) {}

  async listOrders(commanderId: string, query: unknown) {
    await this.hierarchyService.ensureCommander(commanderId);
    const parsed = listOrdersQuerySchema.parse(query);
    const submitDayEnd = parsed.submitDate
      ? this.endOfDay(parsed.submitDate)
      : undefined;
    const deadlineDayEnd = parsed.deadlineDate
      ? this.endOfDay(parsed.deadlineDate)
      : undefined;
    const orderBy = this.buildListOrdersOrderBy(
      parsed.sortBy,
      parsed.sortOrder,
    );
    const filterConditions: Prisma.OrderWhereInput[] = [];

    if (parsed.search) {
      filterConditions.push({
        OR: [
          { title: { contains: parsed.search, mode: 'insensitive' } },
          { description: { contains: parsed.search, mode: 'insensitive' } },
          { narration: { contains: parsed.search, mode: 'insensitive' } },
          { reportReason: { contains: parsed.search, mode: 'insensitive' } },
        ],
      });
    }

    if (parsed.submitDate) {
      filterConditions.push({
        OR: [
          {
            sentAt: {
              gte: parsed.submitDate,
              lte: submitDayEnd,
            },
          },
          {
            sentAt: null,
            createdAt: {
              gte: parsed.submitDate,
              lte: submitDayEnd,
            },
          },
        ],
      });
    }

    const where: Prisma.OrderWhereInput = {
      createdById: commanderId,
      deletedAt: null,
      ...(parsed.status ? { status: parsed.status } : {}),
      ...(parsed.orderType ? { orderType: parsed.orderType } : {}),
      ...(parsed.sentiment ? { sentiment: parsed.sentiment } : {}),
      ...(filterConditions.length ? { AND: filterConditions } : {}),
      ...(parsed.deadlineDate
        ? {
            deadline: {
              gte: parsed.deadlineDate,
              lte: deadlineDayEnd,
            },
          }
        : {}),
    };

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
          sentiment: parsed.sentiment,
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
        sentiment: parsed.sentiment ?? order.sentiment ?? undefined,
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
          ...(parsed.sentiment !== undefined
            ? { sentiment: parsed.sentiment }
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
        sentiment: order.sentiment ?? undefined,
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
      items: assignments.map((assignment) => ({
        id: assignment.id,
        status: assignment.status,
        assignedAt: assignment.assignedAt,
        completedAt: assignment.completedAt,
        user: {
          id: assignment.user.id,
          fullName: assignment.user.fullName,
          username: assignment.user.username,
        },
        unit: assignment.user.unitMemberships[0]
          ? {
              id: assignment.user.unitMemberships[0].unit.id,
              name: assignment.user.unitMemberships[0].unit.name,
              path: assignment.user.unitMemberships[0].unit.path,
            }
          : null,
        canSubmitForMember:
          assignment.user.unitMemberships[0]?.unit.commanderId === commanderId,
        latestSubmission: serializeLatestSubmission(
          assignment.submissions[0],
          order.orderType,
          postingTargetPlatforms,
        ),
      })),
      meta: {
        pagination: buildPaginationMeta(parsed.page, parsed.limit, total),
      },
    };
  }

  async listOrderAssignmentsByUnit(commanderId: string, orderId: string) {
    await this.ensureCommanderOrder(commanderId, orderId);
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
      },
    });

    const units =
      await this.hierarchyService.getSubtreeUnitsForCommander(commanderId);
    const nodeMap = new Map<string, Record<string, unknown>>();

    for (const unit of units) {
      nodeMap.set(unit.id, {
        id: unit.id,
        name: unit.name,
        path: unit.path,
        depthLevel: unit.depthLevel,
        progress: {
          totalAssigned: 0,
          totalSubmitted: 0,
          totalOnTime: 0,
          totalLate: 0,
          totalPending: 0,
          percentageComplete: 0,
          metricTotals: { ...emptySubmissionMetrics },
        },
        children: [],
      });
    }

    for (const assignment of assignments) {
      const unit = assignment.user.unitMemberships[0]?.unit;
      if (!unit) continue;
      const node = nodeMap.get(unit.id);
      if (!node) continue;

      const progress = node.progress as AssignmentProgress;
      progress.totalAssigned += 1;
      if (assignment.status !== 'belum_dikerjakan') {
        progress.totalSubmitted += 1;
      }
      if (assignment.status === 'selesai') {
        progress.totalOnTime += 1;
      }
      if (assignment.status === 'terlambat') {
        progress.totalLate += 1;
      }
      if (assignment.status === 'belum_dikerjakan') {
        progress.totalPending += 1;
      }
      progress.percentageComplete =
        progress.totalAssigned === 0
          ? 0
          : Math.round(
              (progress.totalSubmitted / progress.totalAssigned) * 10000,
            ) / 100;
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
      const resolvedMembers = await this.resolveTargetMemberIds(
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
      sentiment: string | null;
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
      orderType: order.orderType,
      description: order.description,
      targetUrls: socialTargets.map((target) => ({
        id: target.id,
        platform: target.platform,
        url: target.url,
      })),
      narration: order.narration,
      sentiment: order.sentiment,
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
        progress ??
        ({
          totalAssigned: 0,
          totalSubmitted: 0,
          totalOnTime: 0,
          totalLate: 0,
          totalPending: 0,
          percentageComplete: 0,
          metricTotals: { ...emptySubmissionMetrics },
        } satisfies AssignmentProgress),
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
      current.views += submission.views;
      current.likes += submission.likes;
      current.comments += submission.comments;
      current.shares += submission.shares;
      current.reposts += submission.reposts;
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
    targetUrls: Array<{ platform: SocialPlatform; url: string }>,
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

    if (payload.orderType === 'komentar' && !payload.narration) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        'Perintah komentar wajib memiliki narasi',
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
}
