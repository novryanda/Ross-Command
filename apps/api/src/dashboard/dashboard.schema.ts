import { z } from 'zod';
import {
  normalizeOrderTypeInput,
  orderTypeInputValues,
} from '../orders/order-type.util';

export const dashboardQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', 'all']).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  status: z
    .enum(['draft', 'aktif', 'selesai', 'expired', 'dibatalkan'])
    .optional(),
  orderType: z
    .enum(orderTypeInputValues)
    .transform(normalizeOrderTypeInput)
    .optional(),
  deadlineFrom: z.coerce.date().optional(),
  deadlineTo: z.coerce.date().optional(),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
