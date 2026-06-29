"use client";

import { useMemo } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

import { TargetMetricTotalsSection } from "@/components/features/orders/target-metric-section";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { OrderType, ProgressSummary } from "@/lib/api/types";
import { isBlastingOrderType } from "@/lib/order-utils";
import { metricFieldLabels } from "@/lib/blasting-metrics";
import {
  getMonitoringProgressLabel,
  getMonitoringProgressTone,
  MONITORING_PROGRESS_THRESHOLDS,
  monitoringProgressIndicatorClass,
  monitoringProgressLegendClass,
} from "@/lib/monitoring-progress";
import { cn } from "@/lib/utils";

const statusChartConfig = {
  submitted: { label: "Sudah Melaksanakan", color: "hsl(142 71% 45%)" },
  pending: { label: "Belum Melaksanakan", color: "hsl(215 16% 65%)" },
  late: { label: "Terlambat", color: "hsl(38 92% 50%)" },
} satisfies ChartConfig;

const metricsChartConfig = {
  baseline: { label: "Data Awal", color: "hsl(215 16% 65%)" },
  accumulated: { label: "Akumulasi", color: "hsl(221 83% 53%)" },
} satisfies ChartConfig;

export function OrderMonitoringSummaryCharts({
  summary,
  className,
  orderType,
}: {
  summary: ProgressSummary;
  className?: string;
  orderType?: OrderType;
}) {
  const showMetrics = isBlastingOrderType(orderType);
  const tone = getMonitoringProgressTone(summary.percentageComplete);
  const statusLabel = getMonitoringProgressLabel(summary.percentageComplete);

  const statusChartData = useMemo(
    () =>
      [
        {
          key: "submitted",
          label: "Sudah Melaksanakan",
          value: summary.totalSubmitted,
          fill: "var(--color-submitted)",
        },
        {
          key: "pending",
          label: "Belum Melaksanakan",
          value: summary.totalPending,
          fill: "var(--color-pending)",
        },
        {
          key: "late",
          label: "Terlambat",
          value: summary.totalLate,
          fill: "var(--color-late)",
        },
      ].filter((item) => item.value > 0),
    [summary.totalLate, summary.totalPending, summary.totalSubmitted],
  );

  const metricsChartData = useMemo(
    () =>
      metricFieldLabels.map((field) => ({
        key: field.key,
        label: field.label,
        baseline: summary.baselineMetricTotals?.[field.key] ?? 0,
        accumulated:
          summary.accumulatedMetricTotals?.[field.key] ??
          (summary.baselineMetricTotals?.[field.key] ?? 0) + summary.metricTotals[field.key],
      })),
    [summary.accumulatedMetricTotals, summary.baselineMetricTotals, summary.metricTotals],
  );

  const hasMetrics = metricsChartData.some(
    (item) => item.accumulated > 0 || item.baseline > 0,
  );
  const hasBaseline = metricsChartData.some((item) => item.baseline > 0);

  return (
    <section className={cn("space-y-4", className)}>
      <MonitoringProgressBar
        submitted={summary.totalSubmitted}
        assigned={summary.totalAssigned}
        percentage={summary.percentageComplete}
        tone={tone}
        statusLabel={statusLabel}
      />

      <div className={cn("grid gap-4", showMetrics ? "lg:grid-cols-2" : "max-w-xl")}>
        <ChartPanel title="Status Penugasan" description={`Total ditugaskan: ${summary.totalAssigned}`}>
          {statusChartData.length ? (
            <ChartContainer config={statusChartConfig} className="mx-auto aspect-square max-h-[240px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="label" />} />
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={2}
                >
                  {statusChartData.map((item) => (
                    <Cell key={item.key} fill={item.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : (
            <EmptyChartState message="Belum ada data status penugasan." />
          )}
          <MonitoringStatusLegend summary={summary} />
        </ChartPanel>

        {showMetrics ? (
        <ChartPanel
          title="Metrik Blasting"
          description={
            hasMetrics
              ? hasBaseline
                ? "Perbandingan data awal dengan akumulasi input personel"
                : "Total akumulasi input personel"
              : "Belum ada metrik tercatat"
          }
        >
          {hasMetrics ? (
            <ChartContainer config={metricsChartConfig} className="aspect-[4/3] w-full max-h-[260px]">
              <BarChart data={metricsChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} width={36} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        Number(value).toLocaleString("id-ID"),
                        name === "baseline" ? "Data Awal" : "Akumulasi",
                      ]}
                    />
                  }
                />
                <Bar dataKey="baseline" fill="var(--color-baseline)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="accumulated" fill="var(--color-accumulated)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <EmptyChartState message="Metrik akan muncul setelah ada submission blasting." />
          )}
          {hasMetrics ? (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
              {metricsChartData.map((item) => (
                <div key={item.key} className="rounded-md bg-muted/40 px-2 py-1.5">
                  <p className="text-muted-foreground">{item.label}</p>
                  <p className="font-medium tabular-nums">
                    {item.baseline.toLocaleString("id-ID")} → {item.accumulated.toLocaleString("id-ID")}
                  </p>
                  <p className="text-muted-foreground">
                    Kontribusi personel{" "}
                    {Math.max(0, item.accumulated - item.baseline).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </ChartPanel>
        ) : null}
      </div>

      {showMetrics && summary.targetMetricTotals?.length ? (
        <TargetMetricTotalsSection targets={summary.targetMetricTotals} />
      ) : null}
    </section>
  );
}

export function MonitoringProgressBar({
  submitted,
  assigned,
  percentage,
  tone,
  statusLabel,
  compact = false,
}: {
  submitted: number;
  assigned: number;
  percentage: number;
  tone: ReturnType<typeof getMonitoringProgressTone>;
  statusLabel: string;
  compact?: boolean;
}) {
  return (
    <div className="space-y-3 rounded-lg border bg-background/70 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">
          {submitted}/{assigned} terkirim
        </span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-sm px-1.5 py-0.5 text-[11px] font-medium",
              tone === "high" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
              tone === "medium" && "bg-amber-500/10 text-amber-700 dark:text-amber-300",
              tone === "low" && "bg-red-500/10 text-red-700 dark:text-red-300",
            )}
          >
            {statusLabel}
          </span>
          <span className="font-semibold tabular-nums">{percentage}%</span>
        </div>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", monitoringProgressIndicatorClass[tone])}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
      {!compact ? (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {MONITORING_PROGRESS_THRESHOLDS.map((item) => (
            <span key={item.tone} className="inline-flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", monitoringProgressLegendClass[item.tone])} />
              {item.label} ({item.min}–{item.max}%)
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ChartPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-background/70 p-3">
      <div className="mb-3">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function MonitoringStatusLegend({ summary }: { summary: ProgressSummary }) {
  const items = [
    { label: "Sudah Melaksanakan", value: summary.totalSubmitted, className: "bg-emerald-500" },
    { label: "Belum Melaksanakan", value: summary.totalPending, className: "bg-muted-foreground/50" },
    { label: "Terlambat", value: summary.totalLate, className: "bg-amber-500" },
  ];

  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-md bg-muted/40 px-2 py-1.5 text-center">
          <div className="mb-1 flex items-center justify-center gap-1">
            <span className={cn("size-2 rounded-full", item.className)} />
            <span className="text-muted-foreground text-[10px]">{item.label}</span>
          </div>
          <p className="text-sm font-semibold tabular-nums">{item.value.toLocaleString("id-ID")}</p>
        </div>
      ))}
    </div>
  );
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-md border border-dashed bg-muted/20 px-4 text-center">
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
