import { z } from 'zod';
import {
  normalizeOrderTypeInput,
  orderTypeInputValues,
} from '../orders/order-type.util';

export const listMembersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unitId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
});

export const detailMemberQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['belum_dikerjakan', 'selesai', 'terlambat']).optional(),
  orderType: z
    .enum(orderTypeInputValues)
    .transform(normalizeOrderTypeInput)
    .optional(),
});
