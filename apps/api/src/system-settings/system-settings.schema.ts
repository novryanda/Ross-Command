import { z } from 'zod';

const socialPlatformSchema = z.enum([
  'instagram',
  'twitter_x',
  'facebook',
  'tiktok',
  'youtube',
  'other',
]);

export const apifyActorsSchema = z.object({
  instagram: z.string().trim().optional(),
  twitter_x: z.string().trim().optional(),
  facebook: z.string().trim().optional(),
  tiktok: z.string().trim().optional(),
  youtube: z.string().trim().optional(),
  other: z.string().trim().optional(),
});

export const updateSystemSettingsSchema = z.object({
  apifyApiToken: z.string().trim().optional(),
  apifyWebhookSecret: z.string().trim().optional(),
  apifyActors: apifyActorsSchema.optional(),
});

export const testApifyConnectionSchema = z.object({
  apifyApiToken: z.string().trim().optional(),
});

export type ApifyActorsConfig = z.infer<typeof apifyActorsSchema>;
export type UpdateSystemSettingsInput = z.infer<
  typeof updateSystemSettingsSchema
>;

export const SOCIAL_PLATFORMS = socialPlatformSchema.options;
