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

export const submitProofSchema = z.object({
  driveLink: z.string().trim().url().optional(),
  platformLinks: z.array(platformProofLinkSchema).optional(),
  metrics: z
    .object({
      views: z.coerce.number().int().min(0).default(0),
      likes: z.coerce.number().int().min(0).default(0),
      comments: z.coerce.number().int().min(0).default(0),
      shares: z.coerce.number().int().min(0).default(0),
      reposts: z.coerce.number().int().min(0).default(0),
    })
    .optional(),
  notes: z.string().trim().max(5000).optional(),
});
