import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ActivityService } from '../activity/activity.service';
import { PrismaService } from '../common/prisma.service';
import {
  emptySubmissionMetrics,
  hasAnyMetric,
  normalizeMetrics,
  serializeLatestSubmission,
  sumTargetMetricEntries,
} from '../common/utils/submission.util';
import { parseLinks, type ParsedLink } from '../common/utils/url-parser';
import { ApiException } from '../common/utils/api-exception.util';
import { buildPaginationMeta } from '../common/utils/api-response.util';
import { HierarchyService } from '../common/hierarchy.service';
import { OrdersService } from '../orders/orders.service';
import {
  bulkSubmissionQuerySchema,
  bulkSubmissionRequestSchema,
  listAssignmentsQuerySchema,
  submitProofSchema,
} from './assignments.schema';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly activityService: ActivityService,
    private readonly hierarchyService: HierarchyService,
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
    const canSubmitForMember = await this.canSubmitForAnyMember(
      userId,
      assignment.orderId,
    );

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
      canSubmitForMember,
    };
  }

  async submitProof(userId: string, assignmentId: string, body: unknown) {
    return this.submitAssignmentProof({
      actorUserId: userId,
      targetUserId: userId,
      assignmentId,
      body,
      submissionSource: 'self',
    });
  }

  async submitRepresentedProof(
    actorUserId: string,
    orderId: string,
    assignmentId: string,
    body: unknown,
  ) {
    const assignment = await this.prisma.taskAssignment.findFirst({
      where: {
        id: assignmentId,
        orderId,
      },
      select: {
        userId: true,
      },
    });

    if (!assignment) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'NOT_FOUND',
        'Assignment tidak ditemukan',
      );
    }

    await this.ensureDirectUnitLeader(actorUserId, assignment.userId);

    return this.submitAssignmentProof({
      actorUserId,
      targetUserId: assignment.userId,
      assignmentId,
      orderId,
      body,
      submissionSource: 'pimpinan',
    });
  }

  async listBulkSubmissionAssignments(
    actorUserId: string,
    orderId: string,
    query: unknown,
  ) {
    const parsed = bulkSubmissionQuerySchema.parse(query);
    const order = await this.ensureBulkSubmissionOrder(actorUserId, orderId);
    await this.ensureRepresentedMemberAssignments(actorUserId, orderId);
    const actor = await this.getActor(actorUserId);
    const postingTargetPlatforms = Array.isArray(order.postingTargetPlatforms)
      ? (order.postingTargetPlatforms as string[])
      : null;
    const isSuperAdmin = actor.role === 'super_admin';
    const commandingUnitIds = isSuperAdmin
      ? null
      : (await this.hierarchyService.getCommandingUnits(actorUserId)).map(
          (unit) => unit.id,
        );

    const assignments = await this.prisma.taskAssignment.findMany({
      where: {
        orderId,
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
        ...(commandingUnitIds
          ? {
              user: {
                unitMemberships: {
                  some: {
                    removedAt: null,
                    unit: {
                      id: { in: commandingUnitIds },
                      deletedAt: null,
                    },
                  },
                },
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
            unitMemberships: {
              where: { removedAt: null },
              include: {
                unit: {
                  select: {
                    id: true,
                    commanderId: true,
                  },
                },
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
      orderBy: [{ status: 'asc' }, { assignedAt: 'asc' }],
    });

    const now = new Date();
    const isLocked =
      order.status !== 'aktif' || now.getTime() > order.deadline.getTime();

    return {
      order: {
        id: order.id,
        title: order.title,
        status: order.status,
        deadline: order.deadline,
        postingTargetPlatforms,
      },
      isLocked,
      assignments: assignments.map((assignment) => ({
        id: assignment.id,
        userId: assignment.userId,
        status: assignment.status,
        user: {
          id: assignment.user.id,
          fullName: assignment.user.fullName,
          username: assignment.user.username,
        },
        canSubmitForMember:
          isSuperAdmin ||
          assignment.user.unitMemberships[0]?.unit.commanderId === actorUserId,
        latestSubmission: serializeLatestSubmission(
          assignment.submissions[0],
          order.orderType,
          postingTargetPlatforms,
        ),
      })),
    };
  }

  async bulkSubmitProof(actorUserId: string, orderId: string, body: unknown) {
    const parsed = bulkSubmissionRequestSchema.parse(body);
    const order = await this.ensureBulkSubmissionOrder(actorUserId, orderId);
    await this.ensureRepresentedMemberAssignments(actorUserId, orderId);
    const actor = await this.getActor(actorUserId);
    const isSuperAdmin = actor.role === 'super_admin';
    const postingTargetPlatforms = Array.isArray(order.postingTargetPlatforms)
      ? (order.postingTargetPlatforms as string[])
      : [];

    const now = new Date();
    if (order.status !== 'aktif') {
      throw new ApiException(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'BUSINESS_RULE_VIOLATED',
        'Perintah tidak aktif dan tidak dapat menerima submission',
      );
    }

    if (now.getTime() > order.deadline.getTime()) {
      throw new ApiException(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'BUSINESS_RULE_VIOLATED',
        'Deadline perintah sudah lewat',
      );
    }

    const results: Array<{
      assignmentId: string;
      userId: string;
      status: 'submitted' | 'skipped' | 'error';
      reason?: string;
      parsedLinks?: ParsedLink[];
    }> = [];

    let totalSubmitted = 0;
    let totalSkipped = 0;

    for (const item of parsed.submissions) {
      const platformLinks = parseLinks(item.rawLinks);

      if (!platformLinks.length) {
        results.push({
          assignmentId: item.assignmentId,
          userId: item.userId,
          status: 'skipped',
          reason: 'Tidak ada URL valid yang terdeteksi',
        });
        totalSkipped += 1;
        continue;
      }

      try {
        const assignment = await this.prisma.taskAssignment.findFirst({
          where: {
            id: item.assignmentId,
            orderId,
            userId: item.userId,
          },
          include: {
            order: true,
            user: {
              include: {
                unitMemberships: {
                  where: { removedAt: null },
                  include: { unit: true },
                  take: 1,
                },
              },
            },
          },
        });

        if (!assignment) {
          results.push({
            assignmentId: item.assignmentId,
            userId: item.userId,
            status: 'error',
            reason: 'Assignment tidak ditemukan untuk order ini',
          });
          continue;
        }

        if (!isSuperAdmin) {
          await this.ensureDirectUnitLeader(actorUserId, assignment.userId);
        }

        const submittedAt = new Date();
        const nextStatus =
          submittedAt <= assignment.order.deadline ? 'selesai' : 'terlambat';

        const submission = await this.prisma.$transaction(async (tx) => {
          await tx.submission.updateMany({
            where: {
              assignmentId: item.assignmentId,
              isLatest: true,
            },
            data: {
              isLatest: false,
            },
          });

          const createdSubmission = await tx.submission.create({
            data: {
              assignmentId: item.assignmentId,
              userId: item.userId,
              submittedByUserId: actorUserId,
              submissionSource: 'pimpinan',
              platformLinks,
              notes: item.notes ?? null,
              submittedAt,
            },
          });

          await tx.taskAssignment.update({
            where: { id: item.assignmentId },
            data: {
              status: nextStatus,
              completedAt: submittedAt,
            },
          });

          return createdSubmission;
        });

        await this.activityService.logSubmissionSent({
          actorUserId,
          orderId,
          assignmentId: item.assignmentId,
          submissionId: submission.id,
          occurredAt: submission.submittedAt,
        });

        const hasNonTargetPlatform =
          postingTargetPlatforms.length > 0 &&
          platformLinks.some(
            (link) => !postingTargetPlatforms.includes(link.platform),
          );

        results.push({
          assignmentId: item.assignmentId,
          userId: item.userId,
          status: 'submitted',
          parsedLinks: platformLinks,
          ...(hasNonTargetPlatform
            ? {
                reason:
                  'Beberapa platform tidak sesuai target perintah, submission tetap dicatat',
              }
            : {}),
        });
        totalSubmitted += 1;
      } catch (error) {
        results.push({
          assignmentId: item.assignmentId,
          userId: item.userId,
          status: 'error',
          reason:
            error instanceof ApiException
              ? error.message
              : 'Gagal memproses submission',
        });
      }
    }

    if (totalSubmitted > 0) {
      await this.markRepresentingLeaderAssignmentSubmitted({
        actorUserId,
        orderId,
        deadline: order.deadline,
        postingTargetPlatforms,
        results,
        totalSubmitted,
      });
    }

    await this.ordersService.refreshOrderStatus(orderId);

    return {
      success: totalSubmitted > 0,
      totalSubmitted,
      totalSkipped,
      results,
    };
  }

  private async ensureBulkSubmissionOrder(actorUserId: string, orderId: string) {
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

    if (order.orderType !== 'posting') {
      throw new ApiException(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'BUSINESS_RULE_VIOLATED',
        'Bulk submission hanya tersedia untuk perintah posting',
      );
    }

    const actor = await this.getActor(actorUserId);
    if (actor.role === 'super_admin' || order.createdById === actorUserId) {
      return order;
    }

    const commandingUnits = await this.hierarchyService.getCommandingUnits(actorUserId);
    if (!commandingUnits.length) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'FORBIDDEN',
        'Akses bulk submission hanya untuk pimpinan satuan',
      );
    }

    const hasAssignableMember = await this.prisma.taskAssignment.findFirst({
      where: {
        orderId,
        user: {
          unitMemberships: {
            some: {
              removedAt: null,
              unit: {
                commanderId: actorUserId,
                deletedAt: null,
              },
            },
          },
        },
      },
      select: { id: true },
    });

    const hasRepresentedLeaderAssignment =
      await this.hasRepresentedLeaderAssignment(actorUserId, orderId);

    if (!hasAssignableMember && !hasRepresentedLeaderAssignment) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'FORBIDDEN',
        'Tidak ada anggota satuan Anda yang ditugaskan pada perintah ini',
      );
    }

    return order;
  }

  private async canSubmitForAnyMember(actorUserId: string, orderId: string) {
    const actor = await this.getActor(actorUserId);
    if (actor.role === 'super_admin') {
      return true;
    }

    const assignedDirectMember = await this.prisma.taskAssignment.findFirst({
      where: {
        orderId,
        userId: { not: actorUserId },
        user: {
          deletedAt: null,
          unitMemberships: {
            some: {
              removedAt: null,
              unit: {
                commanderId: actorUserId,
                deletedAt: null,
              },
            },
          },
        },
      },
      select: { id: true },
    });

    if (assignedDirectMember) {
      return true;
    }

    return this.hasRepresentedLeaderAssignment(actorUserId, orderId);
  }

  private async hasRepresentedLeaderAssignment(
    actorUserId: string,
    orderId: string,
  ) {
    const representedUnitIds = await this.getRepresentedUnitIdsForLeader(
      actorUserId,
      orderId,
    );

    if (!representedUnitIds.length) {
      return false;
    }

    const representedMember = await this.prisma.unitMember.findFirst({
      where: {
        userId: { not: actorUserId },
        unitId: { in: representedUnitIds },
        removedAt: null,
        user: { deletedAt: null },
      },
      select: { id: true },
    });

    return Boolean(representedMember);
  }

  private async ensureRepresentedMemberAssignments(
    actorUserId: string,
    orderId: string,
  ) {
    const representedUnitIds = await this.getRepresentedUnitIdsForLeader(
      actorUserId,
      orderId,
    );

    if (!representedUnitIds.length) {
      return;
    }

    const memberships = await this.prisma.unitMember.findMany({
      where: {
        userId: { not: actorUserId },
        unitId: { in: representedUnitIds },
        removedAt: null,
        user: { deletedAt: null },
      },
      select: { userId: true },
    });

    const memberIds = Array.from(
      new Set(memberships.map((membership) => membership.userId)),
    );

    if (!memberIds.length) {
      return;
    }

    const existingAssignments = await this.prisma.taskAssignment.findMany({
      where: {
        orderId,
        userId: { in: memberIds },
      },
      select: { userId: true },
    });
    const existingUserIds = new Set(
      existingAssignments.map((assignment) => assignment.userId),
    );
    const data = memberIds
      .filter((memberId) => !existingUserIds.has(memberId))
      .map((memberId) => ({
        orderId,
        userId: memberId,
      }));

    if (data.length) {
      await this.prisma.taskAssignment.createMany({ data });
    }
  }

  private async getRepresentedUnitIdsForLeader(
    actorUserId: string,
    orderId: string,
  ) {
    const leaderAssignment = await this.prisma.taskAssignment.findFirst({
      where: {
        orderId,
        userId: actorUserId,
      },
      select: { id: true },
    });

    if (!leaderAssignment) {
      return [];
    }

    const [targetUnits, commandedUnits] = await this.prisma.$transaction([
      this.prisma.orderTarget.findMany({
        where: {
          orderId,
          targetAudience: 'unit_leaders',
          unit: { deletedAt: null },
        },
        select: {
          unit: {
            select: {
              path: true,
            },
          },
        },
      }),
      this.prisma.unit.findMany({
        where: {
          commanderId: actorUserId,
          deletedAt: null,
        },
        select: {
          id: true,
          path: true,
        },
      }),
    ]);

    const targetPaths = targetUnits
      .map((target) => target.unit?.path)
      .filter((path): path is string => Boolean(path));

    return commandedUnits
      .filter((unit) =>
        targetPaths.some((targetPath) => unit.path.startsWith(targetPath)),
      )
      .map((unit) => unit.id);
  }

  private async markRepresentingLeaderAssignmentSubmitted({
    actorUserId,
    orderId,
    deadline,
    postingTargetPlatforms,
    results,
    totalSubmitted,
  }: {
    actorUserId: string;
    orderId: string;
    deadline: Date;
    postingTargetPlatforms: string[];
    results: Array<{
      assignmentId: string;
      status: 'submitted' | 'skipped' | 'error';
      parsedLinks?: ParsedLink[];
    }>;
    totalSubmitted: number;
  }) {
    const shouldRepresent = await this.hasRepresentedLeaderAssignment(
      actorUserId,
      orderId,
    );

    if (!shouldRepresent) {
      return;
    }

    const leaderAssignment = await this.prisma.taskAssignment.findFirst({
      where: {
        orderId,
        userId: actorUserId,
      },
      select: { id: true },
    });

    if (!leaderAssignment) {
      return;
    }

    const linkByPlatform = new Map<string, string>();
    for (const result of results) {
      if (result.status !== 'submitted') {
        continue;
      }

      for (const link of result.parsedLinks ?? []) {
        if (
          postingTargetPlatforms.length &&
          !postingTargetPlatforms.includes(link.platform)
        ) {
          continue;
        }

        if (!linkByPlatform.has(link.platform)) {
          linkByPlatform.set(link.platform, link.url);
        }
      }
    }

    const submittedAt = new Date();
    const nextStatus = submittedAt <= deadline ? 'selesai' : 'terlambat';
    const platformLinks = Array.from(linkByPlatform.entries()).map(
      ([platform, url]) => ({
        platform,
        url,
      }),
    );

    const submission = await this.prisma.$transaction(async (tx) => {
      await tx.submission.updateMany({
        where: {
          assignmentId: leaderAssignment.id,
          isLatest: true,
        },
        data: {
          isLatest: false,
        },
      });

      const createdSubmission = await tx.submission.create({
        data: {
          assignmentId: leaderAssignment.id,
          userId: actorUserId,
          submittedByUserId: actorUserId,
          submissionSource: 'pimpinan',
          platformLinks: platformLinks.length ? platformLinks : undefined,
          notes: `Mewakili ${totalSubmitted} anggota satuan.`,
          submittedAt,
        },
      });

      await tx.taskAssignment.update({
        where: { id: leaderAssignment.id },
        data: {
          status: nextStatus,
          completedAt: submittedAt,
        },
      });

      return createdSubmission;
    });

    await this.activityService.logSubmissionSent({
      actorUserId,
      orderId,
      assignmentId: leaderAssignment.id,
      submissionId: submission.id,
      occurredAt: submission.submittedAt,
    });
  }

  private async getActor(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'UNAUTHORIZED',
        'User tidak valid',
      );
    }

    return user;
  }

  private async submitAssignmentProof({
    actorUserId,
    targetUserId,
    assignmentId,
    orderId,
    body,
    submissionSource,
  }: {
    actorUserId: string;
    targetUserId: string;
    assignmentId: string;
    orderId?: string;
    body: unknown;
    submissionSource: 'self' | 'pimpinan';
  }) {
    const parsed = submitProofSchema.parse(body);
    const assignment = await this.prisma.taskAssignment.findFirst({
      where: {
        id: assignmentId,
        userId: targetUserId,
        ...(orderId ? { orderId } : {}),
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
    const isBlasting = assignment.order.orderType === 'engagement';
    const postingTargetPlatforms = Array.isArray(
      assignment.order.postingTargetPlatforms,
    )
      ? (assignment.order.postingTargetPlatforms as string[])
      : [];
    const socialTargets = isBlasting
      ? await this.prisma.orderSocialTarget.findMany({
          where: { orderId: assignment.orderId },
          orderBy: { sortOrder: 'asc' },
        })
      : [];

    let targetMetricsPayload:
      | Array<{
          targetId: string;
          platform: string;
          url: string;
          metrics: typeof emptySubmissionMetrics;
        }>
      | undefined;
    let metrics = parsed.metrics ?? emptySubmissionMetrics;

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
    } else if (isBlasting && socialTargets.length) {
      const submittedTargetMetrics = parsed.targetMetrics ?? [];

      if (submittedTargetMetrics.length !== socialTargets.length) {
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          'VALIDATION_ERROR',
          'Metrik blasting wajib diisi untuk setiap link target perintah',
        );
      }

      const targetMap = new Map(
        socialTargets.map((target) => [target.id, target]),
      );

      for (const entry of submittedTargetMetrics) {
        const target = targetMap.get(entry.targetId);
        if (!target) {
          throw new ApiException(
            HttpStatus.BAD_REQUEST,
            'VALIDATION_ERROR',
            'Target metrik blasting tidak valid untuk perintah ini',
          );
        }

        if (entry.url !== target.url || entry.platform !== target.platform) {
          throw new ApiException(
            HttpStatus.BAD_REQUEST,
            'VALIDATION_ERROR',
            'Data target metrik blasting tidak sesuai link perintah',
          );
        }
      }

      targetMetricsPayload = submittedTargetMetrics.map((entry) => ({
        targetId: entry.targetId,
        platform: entry.platform,
        url: entry.url,
        metrics: normalizeMetrics(entry.metrics),
      }));

      metrics = sumTargetMetricEntries(targetMetricsPayload);

      if (!parsed.driveLink && !hasAnyMetric(metrics)) {
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          'VALIDATION_ERROR',
          'Isi minimal satu metrik blasting pada salah satu link target',
        );
      }
    } else if (!parsed.driveLink && !(isBlasting && hasAnyMetric(metrics))) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        isBlasting
          ? 'Isi link bukti atau minimal satu metrik blasting'
          : 'Link bukti wajib diisi',
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
          userId: targetUserId,
          submittedByUserId: actorUserId,
          submissionSource,
          driveLink: parsed.driveLink ?? null,
          platformLinks: isPosting ? (parsed.platformLinks ?? []) : undefined,
          targetMetrics:
            isBlasting && targetMetricsPayload?.length
              ? targetMetricsPayload
              : undefined,
          views: metrics.views,
          likes: metrics.likes,
          comments: metrics.comments,
          shares: metrics.shares,
          reposts: metrics.reposts,
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
      actorUserId,
      orderId: assignment.orderId,
      assignmentId,
      submissionId: submission.id,
      occurredAt: submission.submittedAt,
    });

    await this.ordersService.refreshOrderStatus(assignment.orderId);
    return this.getAssignmentDetail(targetUserId, assignmentId);
  }

  private async ensureDirectUnitLeader(actorUserId: string, targetUserId: string) {
    const targetMembership = await this.prisma.unitMember.findFirst({
      where: {
        userId: targetUserId,
        removedAt: null,
        unit: {
          deletedAt: null,
        },
        user: {
          deletedAt: null,
        },
      },
      include: {
        unit: true,
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    if (!targetMembership || targetMembership.unit.commanderId !== actorUserId) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'FORBIDDEN',
        'Hanya pimpinan satuan langsung yang dapat menginput bukti anggota ini',
      );
    }
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
