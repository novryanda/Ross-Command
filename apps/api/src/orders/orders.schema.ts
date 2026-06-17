import { z } from 'zod';

export const engagementActionSchema = z.enum(['like', 'share', 'repost']);

export const socialPlatformSchema = z.enum([
  'instagram',
  'twitter_x',
  'facebook',
  'tiktok',
  'youtube',
  'other',
]);

export const orderSocialTargetSchema = z.object({
  platform: socialPlatformSchema,
  url: z.string().trim().url(),
});

export const targetSchema = z.object({
  targetType: z.enum(['unit', 'individual']),
  unitId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
});

export const baseOrderSchema = z.object({
  title: z.string().trim().min(3).max(255),
  orderType: z.enum(['posting', 'engagement', 'komentar', 'report_akun']),
  description: z.string().trim().min(3),
  targetUrls: z.array(orderSocialTargetSchema).min(1).max(20),
  narration: z.string().trim().optional(),
  sentiment: z.enum(['positive', 'negative']).optional(),
  engagementActions: z.array(engagementActionSchema).min(1).optional(),
  reportReason: z.string().trim().optional(),
  deadline: z.coerce.date(),
  status: z.enum(['draft', 'aktif']).default('draft'),
  targets: z.array(targetSchema).min(1),
});

export const updateOrderSchema = baseOrderSchema.partial().extend({
  targets: z.array(targetSchema).min(1).optional(),
});

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(['draft', 'aktif', 'selesai', 'expired', 'dibatalkan'])
    .optional(),
  orderType: z
    .enum(['posting', 'engagement', 'komentar', 'report_akun'])
    .optional(),
  sentiment: z.enum(['positive', 'negative']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortBy: z.enum(['createdAt', 'deadline', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const listOrderAssignmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  status: z.enum(['belum_dikerjakan', 'selesai', 'terlambat']).optional(),
  unitId: z.string().uuid().optional(),
});

export type BaseOrderInput = z.infer<typeof baseOrderSchema>;
export type EngagementAction = z.infer<typeof engagementActionSchema>;
