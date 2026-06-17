import { z } from 'zod';

export const unlockUserSchema = z.object({
  userId: z.string().uuid(),
});

export const resetPasswordSchema = z.object({
  userId: z.string().uuid(),
  newPassword: z.string().min(8).max(128),
});

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(3).max(150),
  username: z.string().trim().min(3).max(50),
  nip: z.string().trim().max(50).nullable().optional(),
});
