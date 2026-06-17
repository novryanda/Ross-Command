import { z } from 'zod';

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  role: z.string().trim().optional(),
  unitId: z.string().uuid().optional(),
  sortBy: z
    .enum(['createdAt', 'fullName', 'username', 'lastLoginAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createUserSchema = z.object({
  fullName: z.string().trim().min(3).max(150),
  username: z.string().trim().min(3).max(50),
  password: z.string().min(8).max(128),
  nip: z.string().trim().max(50).optional(),
  role: z.enum(['super_admin', 'member']).default('member'),
  unitId: z.string().uuid().optional(),
});

export const updateUserSchema = z.object({
  fullName: z.string().trim().min(3).max(150).optional(),
  username: z.string().trim().min(3).max(50).optional(),
  nip: z.string().trim().max(50).nullable().optional(),
  role: z.enum(['super_admin', 'member']).optional(),
  unitId: z.string().uuid().nullable().optional(),
});
