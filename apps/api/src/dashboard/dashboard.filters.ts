import type { Prisma } from '@prisma/client';

import { serializeOrderType } from '../orders/order-type.util';
import type { DashboardQuery } from './dashboard.schema';

export type ResolvedDashboardDateRange = {
  dateFrom?: Date;
  dateTo?: Date;
};

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function endOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

export function resolveDashboardDateRange(
  query: DashboardQuery,
): ResolvedDashboardDateRange {
  if (query.dateFrom || query.dateTo) {
    return {
      dateFrom: query.dateFrom ? startOfDay(query.dateFrom) : undefined,
      dateTo: query.dateTo ? endOfDay(query.dateTo) : undefined,
    };
  }

  if (!query.period || query.period === 'all') {
    return {};
  }

  const days = query.period === '7d' ? 7 : query.period === '30d' ? 30 : 90;
  const dateTo = endOfDay(new Date());
  const dateFrom = startOfDay(new Date());
  dateFrom.setDate(dateFrom.getDate() - (days - 1));

  return { dateFrom, dateTo };
}

export function buildDashboardOrderWhere(
  userId: string,
  query: DashboardQuery,
): Prisma.OrderWhereInput {
  const dateRange = resolveDashboardDateRange(query);
  const conditions: Prisma.OrderWhereInput[] = [];

  if (dateRange.dateFrom || dateRange.dateTo) {
    conditions.push({
      OR: [
        {
          sentAt: {
            ...(dateRange.dateFrom ? { gte: dateRange.dateFrom } : {}),
            ...(dateRange.dateTo ? { lte: dateRange.dateTo } : {}),
          },
        },
        {
          sentAt: null,
          createdAt: {
            ...(dateRange.dateFrom ? { gte: dateRange.dateFrom } : {}),
            ...(dateRange.dateTo ? { lte: dateRange.dateTo } : {}),
          },
        },
      ],
    });
  }

  if (query.deadlineFrom || query.deadlineTo) {
    conditions.push({
      deadline: {
        ...(query.deadlineFrom ? { gte: startOfDay(query.deadlineFrom) } : {}),
        ...(query.deadlineTo ? { lte: endOfDay(query.deadlineTo) } : {}),
      },
    });
  }

  return {
    createdById: userId,
    deletedAt: null,
    ...(query.status ? { status: query.status } : {}),
    ...(query.orderType ? { orderType: query.orderType } : {}),
    ...(conditions.length ? { AND: conditions } : {}),
  };
}

export function serializeDashboardFilters(query: DashboardQuery) {
  const dateRange = resolveDashboardDateRange(query);

  return {
    period: query.period ?? null,
    dateFrom: dateRange.dateFrom?.toISOString().slice(0, 10) ?? null,
    dateTo: dateRange.dateTo?.toISOString().slice(0, 10) ?? null,
    status: query.status ?? null,
    orderType: query.orderType ? serializeOrderType(query.orderType) : null,
    deadlineFrom: query.deadlineFrom?.toISOString().slice(0, 10) ?? null,
    deadlineTo: query.deadlineTo?.toISOString().slice(0, 10) ?? null,
  };
}
