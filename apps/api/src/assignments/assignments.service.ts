import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ActivityService } from '../activity/activity.service';
import { PrismaService } from '../common/prisma.service';
import { serializeLatestSubmission } from '../common/utils/submission.util';
import { ApiException } from '../common/utils/api-exception.util';
import { buildPaginationMeta } from '../common/utils/api-response.util';
import { OrdersService } from '../orders/orders.service';
import {
  listAssignmentsQuerySchema,
  submitProofSchema,
} from './assignments.schema';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly activityService: ActivityService,
  ) {}

  async listAssignments(userId: string, query: unknown) {
    const parsed = listAssignmentsQuerySchema.parse(query);
    const submitDayEnd = parsed.submitDate
      ? this.endOfDay(parsed.submitDate)
      : undefined;
    const deadlineDayEnd = parsed.deadlineDate
      ? this.endOfDay(parsed.deadlineDate)
      : undefined;
    const orderBy = this.buildListAssignmentsOrderBy(
      parsed.sortBy,
      parsed.sortOrder,
    );
    const orderConditions: Prisma.OrderWhereInput[] = [];

    if (parsed.orderType) {
      orderConditions.push({ orderType: parsed.orderType });
    }

    if (parsed.deadlineDate) {
      orderConditions.push({
        deadline: {
          gte: parsed.deadlineDate,
          lte: deadlineDayEnd,
        },
      });
    }

    if (parsed.search) {
      orderConditions.push({
        OR: [
          { title: { contains: parsed.search, mode: 'insensitive' } },
          { description: { contains: parsed.search, mode: 'insensitive' } },
          { narration: { contains: parsed.search, mode: 'insensitive' } },
          { reportReason: { contains: parsed.search, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.TaskAssignmentWhereInput = {
      userId,
      ...(parsed.status ? { status: parsed.status } : {}),
      ...(orderConditions.length ? { order: { AND: orderConditions } } : {}),
      ...(parsed.submitDate
        ? {
            assignedAt: {
              gte: parsed.submitDate,
              lte: submitDayEnd,
            },
          }
        : {}),
    };

    const [assignments, total] = await this.prisma.$transaction([
      this.prisma.taskAssignment.findMany({
        where,
        include: {
          order: true,
          submissions: {
            where: { isLatest: true },
            take: 1,
          },
        },
        orderBy,
        skip: (parsed.page - 1) * parsed.limit,
        take: parsed.limit,
      }),
      this.prisma.taskAssignment.count({ where }),
    ]);

    await Promise.all(
      Array.from(
        new Set(assignments.map((assignment) => assignment.orderId)),
      ).map((orderId) => this.ordersService.refreshOrderStatus(orderId)),
    );

    const data = await Promise.all(
      assignments.map((assignment) =>
        this.getAssignmentDetail(userId, assignment.id),
      ),
    );

    return {
      items: data,
      meta: {
        pagination: buildPaginationMeta(parsed.page, parsed.limit, total),
      },
    };
  }

  async getAssignmentDetail(userId: string, assignmentId: string) {
    const assignment = await this.prisma.taskAssignment.findFirst({
      where: {
        id: assignmentId,
        userId,
      },
      include: {
        order: true,
        submissions: {
          where: { isLatest: true },
          take: 1,
        },
      },
    });

    if (!assignment) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'NOT_FOUND',
        'Assignment tidak ditemukan',
      );
    }

    await this.ordersService.refreshOrderStatus(assignment.orderId);

    const socialTargets = await this.prisma.orderSocialTarget.findMany({
      where: { orderId: assignment.orderId },
      orderBy: { sortOrder: 'asc' },
    });

    const postingTargetPlatforms = Array.isArray(
      assignment.order.postingTargetPlatforms,
    )
      ? (assignment.order.postingTargetPlatforms as string[])
      : null;

    return {
      id: assignment.id,
      status: assignment.status,
      assignedAt: assignment.assignedAt,
      completedAt: assignment.completedAt,
      order: {
        id: assignment.order.id,
        title: assignment.order.title,
        orderType: assignment.order.orderType,
        description: assignment.order.description,
        targetUrls: socialTargets.map((target) => ({
          id: target.id,
          platform: target.platform,
          url: target.url,
        })),
        narration: assignment.order.narration,
        sentiment: assignment.order.sentiment,
        engagementActions: assignment.order.engagementActions,
        reportReason: assignment.order.reportReason,
        postingSourceUrl: assignment.order.postingSourceUrl,
        postingTargetPlatforms,
        status: assignment.order.status,
        deadline: assignment.order.deadline,
      },
      latestSubmission: serializeLatestSubmission(
        assignment.submissions[0],
        assignment.order.orderType,
        postingTargetPlatforms,
      ),
    };
  }

  async submitProof(userId: string, assignmentId: string, body: unknown) {
    const parsed = submitProofSchema.parse(body);
    const assignment = await this.prisma.taskAssignment.findFirst({
      where: {
        id: assignmentId,
        userId,
      },
      include: {
        order: true,
      },
    });

    if (!assignment) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'NOT_FOUND',
        'Assignment tidak ditemukan',
      );
    }

    if (assignment.order.status === 'dibatalkan') {
      throw new ApiException(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'BUSINESS_RULE_VIOLATED',
        'Perintah telah dibatalkan dan tidak dapat menerima submission',
      );
    }

    const submittedAt = new Date();
    const nextStatus =
      submittedAt <= assignment.order.deadline ? 'selesai' : 'terlambat';
    const isPosting = assignment.order.orderType === 'posting';
    const postingTargetPlatforms = Array.isArray(
      assignment.order.postingTargetPlatforms,
    )
      ? (assignment.order.postingTargetPlatforms as string[])
      : [];

    if (isPosting) {
      const platformLinks = parsed.platformLinks ?? [];

      if (!platformLinks.length) {
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          'VALIDATION_ERROR',
          'Minimal satu link posting sosmed wajib diisi',
        );
      }

      const invalidPlatform = platformLinks.find(
        (link) => !postingTargetPlatforms.includes(link.platform),
      );
      if (invalidPlatform) {
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          'VALIDATION_ERROR',
          'Platform bukti tidak sesuai target posting',
        );
      }
    } else if (!parsed.driveLink) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        'Link bukti wajib diisi',
      );
    }

    const submission = await this.prisma.$transaction(async (tx) => {
      await tx.submission.updateMany({
        where: {
          assignmentId,
          isLatest: true,
        },
        data: {
          isLatest: false,
        },
      });

      const createdSubmission = await tx.submission.create({
        data: {
          assignmentId,
          userId,
          driveLink: parsed.driveLink ?? null,
          platformLinks: isPosting ? (parsed.platformLinks ?? []) : undefined,
          notes: parsed.notes,
          submittedAt,
        },
      });

      await tx.taskAssignment.update({
        where: { id: assignmentId },
        data: {
          status: nextStatus,
          completedAt: submittedAt,
        },
      });

      return createdSubmission;
    });

    await this.activityService.logSubmissionSent({
      actorUserId: userId,
      orderId: assignment.orderId,
      assignmentId,
      submissionId: submission.id,
      occurredAt: submission.submittedAt,
    });

    await this.ordersService.refreshOrderStatus(assignment.orderId);
    return this.getAssignmentDetail(userId, assignmentId);
  }

  private endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  private buildListAssignmentsOrderBy(
    sortBy: 'assignedAt' | 'deadline',
    sortOrder: 'asc' | 'desc',
  ): Prisma.TaskAssignmentOrderByWithRelationInput[] {
    if (sortBy === 'deadline') {
      return [{ order: { deadline: sortOrder } }, { assignedAt: 'desc' }];
    }

    return [{ assignedAt: sortOrder }];
  }
}
