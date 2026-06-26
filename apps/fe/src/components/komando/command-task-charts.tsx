"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { CommandTaskChartsData } from "@/lib/api/types";
import type { OrdersPageScope } from "@/lib/order-page-scope";
import {
  MONITORING_PROGRESS_THRESHOLDS,
  monitoringProgressLegendClass,
} from "@/lib/monitoring-progress";
import { cn } from "@/lib/utils";

const taskStatusChartConfig = {
  running: { label: "Sedang Berjalan", color: "hsl(221 83% 53%)" },
  completed: { label: "Selesai", color: "hsl(142 71% 45%)" },
} satisfies ChartConfig;

const orderTypeChartConfig = {
  count: { label: "Jumlah", color: "hsl(221 83% 53%)" },
} satisfies ChartConfig;

const progressDistributionConfig = {
  low: { label: "Kurang", color: "hsl(0 84% 60%)" },
  medium: { label: "Sedang", color: "hsl(38 92% 50%)" },
  high: { label: "Baik", color: "hsl(142 71% 45%)" },
} satisfies ChartConfig;

const trendConfig = {
  posting: { label: "Posting", color: "hsl(221 83% 53%)" },
  blasting: { label: "Blasting", color: "hsl(142 71% 45%)" },
  counter: { label: "Counter", color: "hsl(38 92% 50%)" },
  report_akun: { label: "Report", color: "hsl(280 65% 60%)" },
} satisfies ChartConfig;

const trendSeries = [
  { key: "posting", label: "Posting" },
  { key: "blasting", label: "Blasting" },
  { key: "counter", label: "Counter" },
  { key: "report_akun", label: "Report" },
] as const;

const orderTypeLabels: Record<keyof CommandTaskChartsData["orderType"], string> = {
  posting: "Posting",
  blasting: "Blasting",
  counter: "Counter",
  report_akun: "Report",
};

const progressRangeLabels: Record<"low" | "medium" | "high", string> = {
  low: "0–49%",
  medium: "50–79%",
  high: "80–100%",
};

function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}

function readChartKey<T extends string>(entry: unknown): T | null {
  if (entry && typeof entry === "object") {
    const candidate = entry as { key?: unknown; payload?: { key?: unknown } };
    const value = candidate.key ?? candidate.payload?.key;
    if (typeof value === "string") {
      return value as T;
    }
  }
  return null;
}

function formatPercent(value: number, total: number) {
  if (total <= 0) {
    return "0%";
  }
  return `${Math.round((value / total) * 1000) / 10}%`;
}

export function CommandTaskCharts({
  charts,
  scope = "all",
}: {
  charts: CommandTaskChartsData;
  scope?: OrdersPageScope;
}) {
  const isScopedPage = scope !== "all";
  const [taskSel, setTaskSel] = useState<"running" | "completed" | null>(null);
  const [typeSel, setTypeSel] = useState<keyof CommandTaskChartsData["orderType"] | null>(null);
  const [progressSel, setProgressSel] = useState<"low" | "medium" | "high" | null>(null);
  const [weekSel, setWeekSel] = useState<string | null>(null);

  const taskStatusChartData = useMemo(
    () =>
      [
        {
          key: "running" as const,
          label: "Sedang Berjalan",
          value: charts.taskStatus.running,
          fill: "var(--color-running)",
        },
        {
          key: "completed" as const,
          label: "Selesai",
          value: charts.taskStatus.completed,
          fill: "var(--color-completed)",
        },
      ].filter((item) => item.value > 0),
    [charts.taskStatus],
  );

  const orderTypeChartData = useMemo(
    () =>
      (Object.keys(charts.orderType) as Array<keyof CommandTaskChartsData["orderType"]>).map(
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

  const taskStatusTotal = charts.taskStatus.running + charts.taskStatus.completed;
  const orderTypeTotal = orderTypeChartData.reduce((acc, item) => acc + item.count, 0);
  const progressTotal =
    charts.progressDistribution.low +
    charts.progressDistribution.medium +
    charts.progressDistribution.high;

  const taskDetail = useMemo(() => {
    if (!taskSel) return null;
    const value = charts.taskStatus[taskSel];
    return {
      title: taskSel === "running" ? "Sedang Berjalan" : "Selesai",
      hint:
        taskSel === "running"
          ? "Tugas aktif & deadline belum lewat."
          : "Terlaksana penuh & waktunya sudah lewat.",
      rows: [
        { label: "Jumlah tugas", value: formatNumber(value) },
        { label: "Porsi dari total", value: formatPercent(value, taskStatusTotal) },
      ],
    };
  }, [taskSel, charts.taskStatus, taskStatusTotal]);

  const typeDetail = useMemo(() => {
    if (!typeSel) return null;
    const value = charts.orderType[typeSel];
    const rank =
      [...orderTypeChartData].sort((a, b) => b.count - a.count).findIndex((i) => i.key === typeSel) +
      1;
    return {
      title: orderTypeLabels[typeSel],
      hint: "Jumlah tugas sesuai filter aktif.",
      rows: [
        { label: "Jumlah tugas", value: formatNumber(value) },
        { label: "Porsi dari total", value: formatPercent(value, orderTypeTotal) },
        { label: "Peringkat", value: `#${rank} dari ${orderTypeChartData.length}` },
      ],
    };
  }, [typeSel, charts.orderType, orderTypeChartData, orderTypeTotal]);

  const progressDetail = useMemo(() => {
    if (!progressSel) return null;
    const value = charts.progressDistribution[progressSel];
    return {
      title: progressDistributionConfig[progressSel].label,
      hint: `Tugas berjalan dengan capaian terlaksana ${progressRangeLabels[progressSel]}.`,
      rows: [
        { label: "Rentang capaian", value: progressRangeLabels[progressSel] },
        { label: "Jumlah tugas", value: formatNumber(value) },
        { label: "Porsi dari tugas berjalan", value: formatPercent(value, progressTotal) },
      ],
    };
  }, [progressSel, charts.progressDistribution, progressTotal]);

  const weekDetail = useMemo(() => {
    if (!weekSel) return null;
    const bucket = charts.weeklyOrders.find((item) => item.label === weekSel);
    if (!bucket) return null;
    return {
      title: `Minggu ${weekSel}`,
      hint: "Tugas dibuat atau dikirim per jenis.",
      rows: [
        ...trendSeries.map((series) => ({
          label: series.label,
          value: formatNumber(bucket[series.key]),
          color: trendConfig[series.key].color,
        })),
        { label: "Total", value: formatNumber(bucket.total) },
      ],
    };
  }, [weekSel, charts.weeklyOrders]);

  return (
    <section className="space-y-4">
      <div
        className={cn(
          "grid gap-4",
          isScopedPage ? "lg:grid-cols-2" : "lg:grid-cols-2 xl:grid-cols-3",
        )}
      >
        <ChartPanel title="Status Tugas" description="Tugas sedang berjalan & sudah selesai">
          {taskStatusChartData.length ? (
            <ChartContainer config={taskStatusChartConfig} className="mx-auto aspect-square max-h-[220px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="label" />} />
                <Pie
                  data={taskStatusChartData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                  onClick={(entry) => setTaskSel(readChartKey<"running" | "completed">(entry))}
                  className="cursor-pointer"
                >
                  {taskStatusChartData.map((item) => (
                    <Cell key={item.key} fill={item.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : (
            <EmptyChartState message="Belum ada tugas berjalan atau selesai." />
          )}
          <LegendGrid
            columns={2}
            items={[
              { label: "Sedang Berjalan", value: charts.taskStatus.running, className: "bg-blue-500" },
              { label: "Selesai", value: charts.taskStatus.completed, className: "bg-emerald-500" },
            ]}
          />
          <ChartDetail detail={taskDetail} />
        </ChartPanel>

        {!isScopedPage ? (
          <ChartPanel title="Jenis Tugas" description="Distribusi berdasarkan tipe operasi">
            {orderTypeChartData.some((item) => item.count > 0) ? (
              <ChartContainer config={orderTypeChartConfig} className="aspect-[4/3] w-full max-h-[220px]">
                <BarChart data={orderTypeChartData} margin={{ top: 16, right: 8, left: 4, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis hide allowDecimals={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={(value) => [formatNumber(Number(value)), "Tugas"]} />
                    }
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={[6, 6, 0, 0]}
                    onClick={(entry) =>
                      setTypeSel(readChartKey<keyof CommandTaskChartsData["orderType"]>(entry))
                    }
                    className="cursor-pointer"
                  >
                    <LabelList
                      dataKey="count"
                      position="top"
                      offset={6}
                      className="fill-foreground tabular-nums"
                      fontSize={11}
                      formatter={(value) => formatNumber(Number(value))}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <EmptyChartState message="Belum ada tugas." />
            )}
            <ChartDetail detail={typeDetail} />
          </ChartPanel>
        ) : null}

        <ChartPanel title="Distribusi Progress" description="Tugas sedang berjalan berdasarkan capaian terlaksana">
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
                  onClick={(entry) => setProgressSel(readChartKey<"low" | "medium" | "high">(entry))}
                  className="cursor-pointer"
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
          <ChartDetail detail={progressDetail} />
        </ChartPanel>
      </div>

      {!isScopedPage ? (
        <ChartPanel title="Tren Tugas" description="Tugas per jenis dibuat atau dikirim per minggu (8 minggu terakhir)">
          {charts.weeklyOrders.some((item) => item.total > 0) ? (
            <ChartContainer config={trendConfig} className="aspect-[5/2] w-full max-h-[260px]">
              <AreaChart
                data={charts.weeklyOrders}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                onClick={(state) => {
                  const label = (state as { activeLabel?: string })?.activeLabel;
                  if (label) setWeekSel(label);
                }}
                className="cursor-pointer"
              >
                <defs>
                  {trendSeries.map((series) => (
                    <linearGradient
                      key={series.key}
                      id={`trendFill-${series.key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={`var(--color-${series.key})`} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={`var(--color-${series.key})`} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} width={28} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {trendSeries.map((series) => (
                  <Area
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    name={series.label}
                    stroke={`var(--color-${series.key})`}
                    fill={`url(#trendFill-${series.key})`}
                    strokeWidth={2}
                    stackId={undefined}
                  />
                ))}
              </AreaChart>
            </ChartContainer>
          ) : (
            <EmptyChartState message="Belum ada tren tugas dalam 8 minggu terakhir." />
          )}
          <ChartDetail detail={weekDetail} />
        </ChartPanel>
      ) : null}
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
  columns = 3,
}: {
  items: Array<{ label: string; value: number; className: string }>;
  columns?: 2 | 3;
}) {
  return (
    <div className={cn("mt-3 grid gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-3")}>
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

type ChartDetailData = {
  title: string;
  hint?: string;
  rows: Array<{ label: string; value: string | number; color?: string }>;
};

function ChartDetail({ detail }: { detail: ChartDetailData | null }) {
  if (!detail) {
    return (
      <p className="text-muted-foreground mt-3 text-[11px] italic">
        Klik bagian chart untuk melihat detail.
      </p>
    );
  }

  return (
    <div className="mt-3 rounded-md border bg-muted/30 p-3">
      <p className="text-xs font-semibold">{detail.title}</p>
      {detail.hint ? <p className="text-muted-foreground mt-0.5 text-[11px]">{detail.hint}</p> : null}
      <dl className="mt-2 space-y-1">
        {detail.rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-2 text-xs">
            <dt className="text-muted-foreground inline-flex items-center gap-1.5">
              {row.color ? (
                <span className="size-2 rounded-full" style={{ backgroundColor: row.color }} />
              ) : null}
              {row.label}
            </dt>
            <dd className="font-medium tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
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
