import { z } from 'zod';

export const socialAccountSchema = z.object({
  platform: z.enum([
    'instagram',
    'twitter_x',
    'facebook',
    'tiktok',
    'youtube',
    'other',
  ]),
  username: z.string().trim().min(1).max(150),
  profileUrl: z.string().trim().url().optional(),
  notes: z.string().trim().max(5000).optional(),
});

export const listSocialAccountsQuerySchema = z.object({
  platform: z
    .enum(['instagram', 'twitter_x', 'facebook', 'tiktok', 'youtube', 'other'])
    .optional(),
});
