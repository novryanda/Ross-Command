import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
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
  ) {}

  async listAssignments(userId: string, query: unknown) {
    const parsed = listAssignmentsQuerySchema.parse(query);

    const where = {
      userId,
      ...(parsed.status ? { status: parsed.status } : {}),
      ...(parsed.orderType ? { order: { orderType: parsed.orderType } } : {}),
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
        orderBy: [{ order: { deadline: 'asc' } }, { assignedAt: 'desc' }],
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
        status: assignment.order.status,
        deadline: assignment.order.deadline,
      },
      latestSubmission: assignment.submissions[0]
        ? {
            id: assignment.submissions[0].id,
            driveLink: assignment.submissions[0].driveLink,
            notes: assignment.submissions[0].notes,
            submittedAt: assignment.submissions[0].submittedAt,
          }
        : null,
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

    await this.prisma.$transaction(async (tx) => {
      await tx.submission.updateMany({
        where: {
          assignmentId,
          isLatest: true,
        },
        data: {
          isLatest: false,
        },
      });

      await tx.submission.create({
        data: {
          assignmentId,
          userId,
          driveLink: parsed.driveLink,
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
    });

    await this.ordersService.refreshOrderStatus(assignment.orderId);
    return this.getAssignmentDetail(userId, assignmentId);
  }
}
