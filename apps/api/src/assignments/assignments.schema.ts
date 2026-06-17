import { z } from 'zod';

export const listAssignmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['belum_dikerjakan', 'selesai', 'terlambat']).optional(),
  orderType: z
    .enum(['posting', 'engagement', 'komentar', 'report_akun'])
    .optional(),
});

export const submitProofSchema = z.object({
  driveLink: z.string().trim().url(),
  notes: z.string().trim().max(5000).optional(),
});
