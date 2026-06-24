import { z } from 'zod';

export const createUnitSchema = z.object({
  parentId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(5000).optional(),
  commanderId: z.string().uuid().nullable().optional(),
  leaderOnlyAssignments: z.boolean().optional(),
});

export const updateUnitSchema = z.object({
  parentId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  commanderId: z.string().uuid().nullable().optional(),
  leaderOnlyAssignments: z.boolean().optional(),
});

export const assignMemberSchema = z.object({
  userId: z.string().uuid(),
});

export const transferMemberSchema = z.object({
  targetUnitId: z.string().uuid(),
});
