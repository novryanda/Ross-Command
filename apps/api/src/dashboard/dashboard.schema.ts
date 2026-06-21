import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', 'all']).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  status: z
    .enum(['draft', 'aktif', 'selesai', 'expired', 'dibatalkan'])
    .optional(),
  orderType: z
    .enum(['posting', 'engagement', 'blasting', 'komentar', 'report_akun'])
    .transform((value) => (value === 'blasting' ? 'engagement' : value))
    .optional(),
  deadlineFrom: z.coerce.date().optional(),
  deadlineTo: z.coerce.date().optional(),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
