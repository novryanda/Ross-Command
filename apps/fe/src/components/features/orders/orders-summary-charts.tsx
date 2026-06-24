"use client";

import { useMemo } from "react";
import { ActivityIcon, CalendarClockIcon, ClipboardListIcon, Clock3Icon, FileTextIcon } from "lucide-react";
import { Area, AreaChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

import { StatsCard } from "@/components/komando/stats-card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { OrdersSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const orderStatusChartConfig = {
  aktif: { label: "Aktif", color: "hsl(221 83% 53%)" },
  draft: { label: "Draft", color: "hsl(215 16% 65%)" },
  selesai: { label: "Selesai", color: "hsl(142 71% 45%)" },
  expired: { label: "Expired", color: "hsl(0 84% 60%)" },
} satisfies ChartConfig;

const progressDistributionConfig = {
  low: { label: "Kurang", color: "hsl(0 84% 60%)" },
  medium: { label: "Sedang", color: "hsl(38 92% 50%)" },
  high: { label: "Baik", color: "hsl(142 71% 45%)" },
} satisfies ChartConfig;

const weeklyOrdersConfig = {
  count: { label: "Perintah", color: "hsl(221 83% 53%)" },
} satisfies ChartConfig;

export function OrdersSummaryCharts({ summary }: { summary: OrdersSummary }) {
  const orderStatusData = useMemo(
    () =>
      [
        { key: "aktif", label: "Aktif", value: summary.charts.orderStatus.aktif, fill: "var(--color-aktif)" },
        { key: "draft", label: "Draft", value: summary.charts.orderStatus.draft, fill: "var(--color-draft)" },
        { key: "selesai", label: "Selesai", value: summary.charts.orderStatus.selesai, fill: "var(--color-selesai)" },
        { key: "expired", label: "Expired", value: summary.charts.orderStatus.expired, fill: "var(--color-expired)" },
      ].filter((item) => item.value > 0),
    [summary.charts.orderStatus],
  );

  const progressDistributionData = useMemo(
    () =>
      [
        { key: "low", label: "Kurang", value: summary.charts.progressDistribution.low, fill: "var(--color-low)" },
        { key: "medium", label: "Sedang", value: summary.charts.progressDistribution.medium, fill: "var(--color-medium)" },
        { key: "high", label: "Baik", value: summary.charts.progressDistribution.high, fill: "var(--color-high)" },
      ].filter((item) => item.value > 0),
    [summary.charts.progressDistribution],
  );

  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard title="Total" value={summary.stats.total} description="Semua perintah terfilter" icon={ClipboardListIcon} />
        <StatsCard title="Aktif" value={summary.stats.aktif} description="Sedang berjalan" icon={ActivityIcon} />
        <StatsCard title="Draft" value={summary.stats.draft} description="Belum dikirim" icon={FileTextIcon} />
        <StatsCard title="Selesai" value={summary.stats.selesai} description="Progress tuntas" icon={CalendarClockIcon} />
        <StatsCard title="Expired" value={summary.stats.expired} description="Lewat deadline" icon={Clock3Icon} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ChartPanel title="Status Perintah" description="Distribusi status seluruh perintah">
          {orderStatusData.length ? (
            <ChartContainer config={orderStatusChartConfig} className="mx-auto aspect-square max-h-[240px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="label" />} />
                <Pie data={orderStatusData} dataKey="value" nameKey="label" innerRadius={54} outerRadius={82} paddingAngle={2}>
                  {orderStatusData.map((item) => (
                    <Cell key={item.key} fill={item.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : (
            <EmptyChartState message="Belum ada data status perintah." />
          )}
          <LegendGrid
            items={orderStatusData.map((item) => ({
              label: item.label,
              value: item.value,
              className:
                item.key === "aktif"
                  ? "bg-blue-500"
                  : item.key === "selesai"
                    ? "bg-emerald-500"
                    : item.key === "expired"
                      ? "bg-red-500"
                      : "bg-muted-foreground/50",
            }))}
          />
        </ChartPanel>

        <ChartPanel title="Distribusi Progress" description="Sebaran progres submit perintah">
          {progressDistributionData.length ? (
            <ChartContainer config={progressDistributionConfig} className="mx-auto aspect-square max-h-[240px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="label" />} />
                <Pie data={progressDistributionData} dataKey="value" nameKey="label" innerRadius={54} outerRadius={82} paddingAngle={2}>
                  {progressDistributionData.map((item) => (
                    <Cell key={item.key} fill={item.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : (
            <EmptyChartState message="Belum ada data progress." />
          )}
          <LegendGrid
            items={[
              { label: "Kurang", value: summary.charts.progressDistribution.low, className: "bg-red-500" },
              { label: "Sedang", value: summary.charts.progressDistribution.medium, className: "bg-amber-500" },
              { label: "Baik", value: summary.charts.progressDistribution.high, className: "bg-emerald-500" },
            ]}
          />
        </ChartPanel>

      </div>

      <ChartPanel title="Tren Perintah" description="Perintah dibuat atau dikirim per minggu">
        {summary.charts.weeklyOrders.some((item) => item.count > 0) ? (
          <ChartContainer config={weeklyOrdersConfig} className="aspect-[5/2] w-full max-h-[220px]">
              <AreaChart data={summary.charts.weeklyOrders} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ordersWeeklyFill" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#ordersWeeklyFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <EmptyChartState message="Belum ada tren perintah pada periode ini." />
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
    <div className="flex min-h-[180px] items-center justify-center rounded-md border border-dashed bg-muted/20 px-4 text-center">
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
