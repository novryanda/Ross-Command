import { z } from 'zod';
import {
  normalizeOrderTypeInput,
  orderTypeInputValues,
} from './order-type.util';

export const engagementActionSchema = z.enum(['like', 'share', 'repost']);

export const orderTypeInputSchema = z
  .enum(orderTypeInputValues)
  .transform(normalizeOrderTypeInput);

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

export const targetAudienceSchema = z.enum([
  'all_members',
  'unit_leaders',
]);

export const targetSchema = z.object({
  targetType: z.enum(['unit', 'individual']),
  targetAudience: targetAudienceSchema.optional(),
  unitId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
});

export const orderFieldsSchema = z.object({
  title: z.string().trim().min(3).max(255),
  orderType: orderTypeInputSchema,
  description: z.string().trim().min(3),
  targetUrls: z.array(orderSocialTargetSchema).max(20).default([]),
  postingSourceUrl: z.string().trim().url().optional(),
  postingTargetPlatforms: z.array(socialPlatformSchema).optional(),
  narration: z.string().trim().optional(),
  engagementActions: z.array(engagementActionSchema).min(1).optional(),
  reportReason: z.string().trim().optional(),
  deadline: z.coerce.date(),
  status: z.enum(['draft', 'aktif']).default('draft'),
  targets: z.array(targetSchema).min(1),
});

function refineOrderByType(
  data: z.infer<typeof orderFieldsSchema>,
  ctx: z.RefinementCtx,
) {
    if (data.orderType === 'posting') {
      if (!data.postingTargetPlatforms?.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Pilih minimal satu target sosmed posting',
        path: ['postingTargetPlatforms'],
      });
    }

    return;
  }

  if (!data.targetUrls.length) {
    ctx.addIssue({
      code: 'custom',
      message: 'URL target wajib diisi',
      path: ['targetUrls'],
    });
  }
}

export const baseOrderSchema = orderFieldsSchema.superRefine(refineOrderByType);

export const updateOrderSchema = orderFieldsSchema.partial().extend({
  targets: z.array(targetSchema).min(1).optional(),
});

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(['draft', 'aktif', 'selesai', 'expired', 'dibatalkan'])
    .optional(),
  orderType: orderTypeInputSchema.optional(),
  submitDate: z.coerce.date().optional(),
  deadlineDate: z.coerce.date().optional(),
  search: z.string().trim().min(1).optional(),
  sortBy: z.enum(['createdAt', 'deadline', 'title', 'sentAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const listOrdersSummaryQuerySchema = z.object({
  status: z
    .enum(['draft', 'aktif', 'selesai', 'expired', 'dibatalkan'])
    .optional(),
  orderType: orderTypeInputSchema.optional(),
  submitDate: z.coerce.date().optional(),
  deadlineDate: z.coerce.date().optional(),
  search: z.string().trim().min(1).optional(),
});

export const listOrderAssignmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  status: z.enum(['belum_dikerjakan', 'selesai', 'terlambat']).optional(),
  unitId: z.string().uuid().optional(),
});

export type BaseOrderInput = z.infer<typeof orderFieldsSchema>;
export type EngagementAction = z.infer<typeof engagementActionSchema>;
