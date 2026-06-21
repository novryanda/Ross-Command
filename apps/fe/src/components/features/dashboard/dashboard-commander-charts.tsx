"use client";

import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

import { MonitoringProgressBar } from "@/components/features/orders/order-monitoring-summary-charts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { DashboardCommanderCharts } from "@/lib/api/types";
import {
  getMonitoringProgressLabel,
  getMonitoringProgressTone,
  MONITORING_PROGRESS_THRESHOLDS,
  monitoringProgressLegendClass,
} from "@/lib/monitoring-progress";
import { cn } from "@/lib/utils";

const assignmentChartConfig = {
  submitted: { label: "Tepat Waktu", color: "hsl(142 71% 45%)" },
  pending: { label: "Menunggu", color: "hsl(215 16% 65%)" },
  late: { label: "Terlambat", color: "hsl(38 92% 50%)" },
} satisfies ChartConfig;

const orderStatusChartConfig = {
  aktif: { label: "Aktif", color: "hsl(221 83% 53%)" },
  draft: { label: "Draft", color: "hsl(215 16% 65%)" },
  selesai: { label: "Selesai", color: "hsl(142 71% 45%)" },
  expired: { label: "Expired", color: "hsl(0 84% 60%)" },
  dibatalkan: { label: "Dibatalkan", color: "hsl(25 95% 53%)" },
} satisfies ChartConfig;

const orderTypeChartConfig = {
  count: { label: "Jumlah", color: "hsl(221 83% 53%)" },
} satisfies ChartConfig;

const progressDistributionConfig = {
  low: { label: "Kurang", color: "hsl(0 84% 60%)" },
  medium: { label: "Sedang", color: "hsl(38 92% 50%)" },
  high: { label: "Baik", color: "hsl(142 71% 45%)" },
} satisfies ChartConfig;

const weeklyOrdersConfig = {
  count: { label: "Perintah", color: "hsl(221 83% 53%)" },
} satisfies ChartConfig;

const orderTypeLabels: Record<keyof DashboardCommanderCharts["orderType"], string> = {
  posting: "Posting",
  blasting: "Blasting",
  komentar: "Komentar",
  report_akun: "Report Akun",
};

const orderStatusLabels: Record<keyof DashboardCommanderCharts["orderStatus"], string> = {
  draft: "Draft",
  aktif: "Aktif",
  selesai: "Selesai",
  expired: "Expired",
  dibatalkan: "Dibatalkan",
};

export function DashboardCommanderCharts({ charts }: { charts: DashboardCommanderCharts }) {
  const overallTone = getMonitoringProgressTone(charts.overallProgress.percentageComplete);
  const overallLabel = getMonitoringProgressLabel(charts.overallProgress.percentageComplete);

  const assignmentChartData = useMemo(
    () =>
      [
        {
          key: "submitted",
          label: "Tepat Waktu",
          value: charts.assignmentStatus.submitted,
          fill: "var(--color-submitted)",
        },
        {
          key: "pending",
          label: "Menunggu",
          value: charts.assignmentStatus.pending,
          fill: "var(--color-pending)",
        },
        {
          key: "late",
          label: "Terlambat",
          value: charts.assignmentStatus.late,
          fill: "var(--color-late)",
        },
      ].filter((item) => item.value > 0),
    [charts.assignmentStatus],
  );

  const orderStatusChartData = useMemo(
    () =>
      (Object.keys(charts.orderStatus) as Array<keyof DashboardCommanderCharts["orderStatus"]>)
        .map((key) => ({
          key,
          label: orderStatusLabels[key],
          value: charts.orderStatus[key],
          fill: `var(--color-${key})`,
        }))
        .filter((item) => item.value > 0),
    [charts.orderStatus],
  );

  const orderTypeChartData = useMemo(
    () =>
      (Object.keys(charts.orderType) as Array<keyof DashboardCommanderCharts["orderType"]>).map(
        (key) => ({
          key,
          label: orderTypeLabels[key],
          count: charts.orderType[key],
        }),
      ),
    [charts.orderType],
  );

  const progressDistributionData = useMemo(
    () =>
      (
        [
          { key: "low", label: "Kurang", value: charts.progressDistribution.low },
          { key: "medium", label: "Sedang", value: charts.progressDistribution.medium },
          { key: "high", label: "Baik", value: charts.progressDistribution.high },
        ] as const
      )
        .map((item) => ({
          ...item,
          fill: `var(--color-${item.key})`,
        }))
        .filter((item) => item.value > 0),
    [charts.progressDistribution],
  );

  const totalAssignments =
    charts.assignmentStatus.submitted +
    charts.assignmentStatus.pending +
    charts.assignmentStatus.late;

  return (
    <section className="space-y-4">
      <MonitoringProgressBar
        submitted={charts.overallProgress.totalSubmitted}
        assigned={charts.overallProgress.totalAssigned}
        percentage={charts.overallProgress.percentageComplete}
        tone={overallTone}
        statusLabel={overallLabel}
        compact
      />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <ChartPanel
          title="Status Penugasan"
          description={`Total penugasan: ${totalAssignments.toLocaleString("id-ID")}`}
        >
          {assignmentChartData.length ? (
            <ChartContainer config={assignmentChartConfig} className="mx-auto aspect-square max-h-[220px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="label" />} />
                <Pie
                  data={assignmentChartData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {assignmentChartData.map((item) => (
                    <Cell key={item.key} fill={item.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : (
            <EmptyChartState message="Belum ada penugasan." />
          )}
          <LegendGrid
            items={[
              { label: "Tepat Waktu", value: charts.assignmentStatus.submitted, className: "bg-emerald-500" },
              { label: "Menunggu", value: charts.assignmentStatus.pending, className: "bg-muted-foreground/50" },
              { label: "Terlambat", value: charts.assignmentStatus.late, className: "bg-amber-500" },
            ]}
          />
        </ChartPanel>

        <ChartPanel title="Status Perintah" description="Semua perintah yang pernah dibuat">
          {orderStatusChartData.length ? (
            <ChartContainer config={orderStatusChartConfig} className="mx-auto aspect-square max-h-[220px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="label" />} />
                <Pie
                  data={orderStatusChartData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {orderStatusChartData.map((item) => (
                    <Cell key={item.key} fill={item.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : (
            <EmptyChartState message="Belum ada perintah." />
          )}
          <LegendGrid
            items={orderStatusChartData.map((item) => ({
              label: item.label,
              value: item.value,
              className:
                item.key === "aktif"
                  ? "bg-blue-500"
                  : item.key === "selesai"
                    ? "bg-emerald-500"
                    : item.key === "expired"
                      ? "bg-red-500"
                      : item.key === "dibatalkan"
                        ? "bg-orange-500"
                        : "bg-muted-foreground/50",
            }))}
          />
        </ChartPanel>

        <ChartPanel title="Jenis Perintah" description="Distribusi berdasarkan tipe operasi">
          {orderTypeChartData.some((item) => item.count > 0) ? (
            <ChartContainer config={orderTypeChartConfig} className="aspect-[4/3] w-full max-h-[220px]">
              <BarChart data={orderTypeChartData} layout="vertical" margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  width={72}
                  fontSize={11}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [Number(value).toLocaleString("id-ID"), "Perintah"]}
                    />
                  }
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <EmptyChartState message="Belum ada perintah." />
          )}
        </ChartPanel>

        <ChartPanel title="Distribusi Progress" description="Perintah berdasarkan capaian submit">
          {progressDistributionData.length ? (
            <ChartContainer
              config={progressDistributionConfig}
              className="mx-auto aspect-square max-h-[220px] w-full"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="label" />} />
                <Pie
                  data={progressDistributionData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {progressDistributionData.map((item) => (
                    <Cell key={item.key} fill={item.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : (
            <EmptyChartState message="Belum ada data progress." />
          )}
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {MONITORING_PROGRESS_THRESHOLDS.map((item) => (
              <span key={item.tone} className="inline-flex items-center gap-1.5">
                <span className={cn("size-2 rounded-full", monitoringProgressLegendClass[item.tone])} />
                {item.label} ({item.min}–{item.max}%)
              </span>
            ))}
          </div>
        </ChartPanel>
      </div>

      <ChartPanel title="Tren Perintah" description="Perintah dibuat atau dikirim per minggu (8 minggu terakhir)">
        {charts.weeklyOrders.some((item) => item.count > 0) ? (
          <ChartContainer config={weeklyOrdersConfig} className="aspect-[5/2] w-full max-h-[220px]">
            <AreaChart data={charts.weeklyOrders} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="dashboardWeeklyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-count)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-count)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={28} allowDecimals={false} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [Number(value).toLocaleString("id-ID"), "Perintah"]}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-count)"
                fill="url(#dashboardWeeklyFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <EmptyChartState message="Belum ada tren perintah dalam 8 minggu terakhir." />
        )}
      </ChartPanel>
    </section>
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
    <div className="rounded-lg border bg-background/70 p-4 shadow-sm">
      <div className="mb-3">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      {children}
    </div>
  );
}

function LegendGrid({
  items,
}: {
  items: Array<{ label: string; value: number; className: string }>;
}) {
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
    <div className="flex min-h-[160px] items-center justify-center rounded-md border border-dashed bg-muted/20 px-4 text-center">
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
