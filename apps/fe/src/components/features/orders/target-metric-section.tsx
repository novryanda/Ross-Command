"use client";

import Link from "next/link";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import { PlatformBadge, platformLabel } from "@/components/komando/badges";
import { Input } from "@/components/ui/input";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { metricFieldLabels } from "@/lib/blasting-metrics";
import type { OrderSocialTarget, SubmissionMetrics, TargetMetricTotal } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const comparisonChartConfig = {
  baseline: { label: "Data Awal", color: "hsl(215 16% 65%)" },
  accumulated: { label: "Akumulasi", color: "hsl(221 83% 53%)" },
  final: { label: "Data Riil Akhir", color: "hsl(142 71% 45%)" },
} satisfies ChartConfig;

export function TargetMetricTotalsSection({
  targets,
  title = "Total per Link Target",
  className,
}: {
  targets: TargetMetricTotal[];
  title?: string;
  className?: string;
}) {
  if (!targets.length) {
    return null;
  }

  return (
    <section className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="space-y-3">
        {targets.map((target) => (
          <TargetMetricCard key={target.targetId} target={target} />
        ))}
      </div>
    </section>
  );
}

export function TargetMetricInputSection({
  targets,
  values,
  onChange,
  disabled = false,
}: {
  targets: OrderSocialTarget[];
  values: Record<string, SubmissionMetrics>;
  onChange: (targetKey: string, metrics: SubmissionMetrics) => void;
  disabled?: boolean;
}) {
  if (!targets.length) {
    return (
      <p className="text-muted-foreground text-sm">
        Tugas ini belum memiliki link target blasting.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {targets.map((target, index) => {
        const targetKey = target.id ?? target.url;
        const metrics = values[targetKey] ?? {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          reposts: 0,
        };

        return (
          <div key={targetKey} className="rounded-lg border p-3">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium">
                  Link {index + 1} — {platformLabel[target.platform]}
                </p>
                <Link
                  href={target.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary block truncate text-xs hover:underline"
                >
                  {target.url}
                </Link>
              </div>
              <PlatformBadge platform={target.platform} />
            </div>
            <MetricStrip
              title="Data Awal"
              metrics={target.baselineMetrics}
              emptyLabel="Belum ada data awal"
            />
            <p className="text-muted-foreground mt-3 mb-2 text-[11px]">
              Isi jumlah aksi yang Anda lakukan (contoh: 1 suka = ketik 1).
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {metricFieldLabels.map((field) => (
                <label key={field.key} className="grid gap-1 text-xs">
                  <span className="text-muted-foreground">{field.label}</span>
                  <Input
                    type="number"
                    min={0}
                    value={metrics[field.key]}
                    disabled={disabled}
                    placeholder="0"
                    onChange={(event) =>
                      onChange(targetKey, {
                        ...metrics,
                        [field.key]: Math.max(0, Number(event.target.value) || 0),
                      })
                    }
                    className="h-8"
                  />
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TargetMetricCard({ target }: { target: TargetMetricTotal }) {
  const hasBaseline = Boolean(target.baselineMetrics);
  const accumulatedMetrics =
    target.accumulatedMetrics ??
    ({
      views: (target.baselineMetrics?.views ?? 0) + target.metrics.views,
      likes: (target.baselineMetrics?.likes ?? 0) + target.metrics.likes,
      comments: (target.baselineMetrics?.comments ?? 0) + target.metrics.comments,
      shares: (target.baselineMetrics?.shares ?? 0) + target.metrics.shares,
      reposts: (target.baselineMetrics?.reposts ?? 0) + target.metrics.reposts,
    } satisfies SubmissionMetrics);

  const chartData = metricFieldLabels.map((field) => ({
    label: field.short,
    baseline: target.baselineMetrics?.[field.key] ?? 0,
    accumulated: accumulatedMetrics[field.key],
  }));

  return (
    <div className="rounded-lg border bg-background/80 p-3">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <PlatformBadge platform={target.platform} />
          <Link
            href={target.url}
            target="_blank"
            rel="noreferrer"
            className="text-primary block truncate text-xs hover:underline"
          >
            {target.url}
          </Link>
        </div>
      </div>
      {hasBaseline ? (
        <div className="mb-3">
          <ChartContainer config={comparisonChartConfig} className="aspect-[16/7] w-full">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={30} />
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
              <Bar dataKey="baseline" fill="var(--color-baseline)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="accumulated" fill="var(--color-accumulated)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      ) : null}
      <div className="space-y-2">
        {hasBaseline ? <MetricStrip title="Data Awal" metrics={target.baselineMetrics} /> : null}
        <MetricStrip title="Akumulasi" metrics={accumulatedMetrics} />
      </div>
    </div>
  );
}

function MetricStrip({
  title,
  metrics,
  signed = false,
  emptyLabel = "-",
  className,
}: {
  title: string;
  metrics?: SubmissionMetrics;
  signed?: boolean;
  emptyLabel?: string;
  className?: string;
}) {
  if (!metrics) {
    return <p className={cn("text-muted-foreground text-xs", className)}>{emptyLabel}</p>;
  }

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">{title}</p>
      <div className="grid grid-cols-5 gap-1">
        {metricFieldLabels.map((field) => (
          <div
            key={field.key}
            title={field.label}
            className="flex flex-col items-center gap-0.5 rounded-md bg-muted/60 px-1.5 py-1.5 text-center"
          >
            <field.icon className="text-muted-foreground size-3.5" aria-label={field.label} />
            <p className="truncate text-xs font-medium tabular-nums">
              {signed ? formatSigned(metrics[field.key]) : metrics[field.key].toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatSigned(value: number) {
  if (value > 0) {
    return `+${value.toLocaleString("id-ID")}`;
  }

  return value.toLocaleString("id-ID");
}
