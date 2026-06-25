import {
  orderStatusLabel,
  orderTypeFilterAliases,
  orderTypeFilterOptions,
} from "@/components/komando/badges";
import type { DashboardCommanderFilters } from "@/lib/api/types";

export const dashboardPeriodOptions = [
  { value: "all", label: "Semua periode" },
  { value: "7d", label: "7 hari terakhir" },
  { value: "30d", label: "30 hari terakhir" },
  { value: "90d", label: "90 hari terakhir" },
] as const;

export function formatDashboardFilterSummary(filters: DashboardCommanderFilters) {
  const parts: string[] = [];

  if (filters.dateFrom || filters.dateTo) {
    parts.push(`Periode ${filters.dateFrom ?? "…"} – ${filters.dateTo ?? "…"}`);
  } else if (filters.period && filters.period !== "all") {
    const periodLabel = dashboardPeriodOptions.find((item) => item.value === filters.period)?.label;
    if (periodLabel) {
      parts.push(periodLabel);
    }
  }

  if (filters.status) {
    parts.push(`Status ${orderStatusLabel[filters.status]}`);
  }

  if (filters.orderType) {
    const normalized = orderTypeFilterAliases[filters.orderType as keyof typeof orderTypeFilterAliases] ?? filters.orderType;
    const label = orderTypeFilterOptions.find((item) => item.value === normalized)?.label;
    if (label) {
      parts.push(`Jenis ${label}`);
    }
  }

  if (filters.deadlineFrom || filters.deadlineTo) {
    parts.push(`Deadline ${filters.deadlineFrom ?? "…"} – ${filters.deadlineTo ?? "…"}`);
  }

  return parts.length ? parts.join(" · ") : "Semua data tugas";
}
