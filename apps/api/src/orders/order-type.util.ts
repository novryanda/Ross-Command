import type { OrderType } from '@prisma/client';

export const orderTypeInputValues = [
  'posting',
  'engagement',
  'blasting',
  'counter',
  'komentar',
  'report_akun',
] as const;

export type OrderTypeInputValue = (typeof orderTypeInputValues)[number];
export type PublicOrderType =
  | 'posting'
  | 'engagement'
  | 'blasting'
  | 'counter'
  | 'report_akun';

export function normalizeOrderTypeInput(
  value: OrderTypeInputValue,
): OrderType {
  if (value === 'blasting') {
    return 'engagement';
  }

  if (value === 'komentar') {
    return 'counter';
  }

  return value;
}

export function serializeOrderType(orderType: OrderType): PublicOrderType {
  return orderType === 'engagement' ? 'blasting' : orderType;
}
