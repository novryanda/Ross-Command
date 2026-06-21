import { z } from 'zod';

import { socialPlatformSchema } from '../orders/orders.schema';

export const listAssignmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['belum_dikerjakan', 'selesai', 'terlambat']).optional(),
  orderType: z
    .enum(['posting', 'engagement', 'blasting', 'komentar', 'report_akun'])
    .transform((value) => (value === 'blasting' ? 'engagement' : value))
    .optional(),
  submitDate: z.coerce.date().optional(),
  deadlineDate: z.coerce.date().optional(),
  search: z.string().trim().min(1).optional(),
  sortBy: z.enum(['assignedAt', 'deadline']).default('deadline'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

const platformProofLinkSchema = z.object({
  platform: socialPlatformSchema,
  url: z.string().trim().url(),
});

const submissionMetricsSchema = z.object({
  views: z.coerce.number().int().min(0).default(0),
  likes: z.coerce.number().int().min(0).default(0),
  comments: z.coerce.number().int().min(0).default(0),
  shares: z.coerce.number().int().min(0).default(0),
  reposts: z.coerce.number().int().min(0).default(0),
});

const targetMetricEntrySchema = z.object({
  targetId: z.string().uuid(),
  platform: socialPlatformSchema,
  url: z.string().trim().url(),
  metrics: submissionMetricsSchema,
});

export const submitProofSchema = z.object({
  driveLink: z.string().trim().url().optional(),
  platformLinks: z.array(platformProofLinkSchema).optional(),
  targetMetrics: z.array(targetMetricEntrySchema).optional(),
  metrics: submissionMetricsSchema.optional(),
  notes: z.string().trim().max(5000).optional(),
});

export const bulkSubmissionItemSchema = z.object({
  assignmentId: z.string().uuid(),
  userId: z.string().uuid(),
  rawLinks: z.string().trim().min(1),
  notes: z.string().trim().max(5000).optional(),
});

export const bulkSubmissionRequestSchema = z.object({
  submissions: z.array(bulkSubmissionItemSchema).min(1),
});

export const bulkSubmissionQuerySchema = z.object({
  unitId: z.string().uuid().optional(),
});
