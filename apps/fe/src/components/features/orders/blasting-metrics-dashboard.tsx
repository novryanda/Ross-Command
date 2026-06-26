"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { PlatformBadge, platformLabel } from "@/components/komando/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { retryBlastingMetricsScrape } from "@/lib/api/metrics-dashboard";
import { metricFieldLabels } from "@/lib/blasting-metrics";
import type { BlastingMetricsDashboard, MetricScrapeStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function subscribeMounted() {
  return () => {};
}

function getMountedClient() {
  return true;
}

function getMountedServer() {
  return false;
}

function useClientMounted() {
  return useSyncExternalStore(subscribeMounted, getMountedClient, getMountedServer);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("id-ID");
}

const metricsChartConfig = {
  baseline: { label: "Data Awal", color: "hsl(215 16% 65%)" },
  accumulated: { label: "Akumulasi", color: "hsl(221 83% 53%)" },
  final: { label: "Data Riil Akhir", color: "hsl(142 71% 45%)" },
} satisfies ChartConfig;

const statusTone: Record<MetricScrapeStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  running: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  succeeded: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
};

const statusLabel: Record<MetricScrapeStatus, string> = {
  pending: "Menunggu",
  running: "Berjalan",
  succeeded: "Berhasil",
  failed: "Gagal",
};

function ScrapeStatusBadge({ label, status }: { label: string; status: MetricScrapeStatus }) {
  return (
    <div className="rounded-lg border px-3 py-2">
      <p className="text-muted-foreground text-xs">{label}</p>
      <span className={cn("mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium", statusTone[status])}>
        {statusLabel[status]}
      </span>
    </div>
  );
}

function BlastingMetricsTargetCard({
  index,
  target,
  showChart,
}: {
  index: number;
  target: BlastingMetricsDashboard["targets"][number];
  showChart: boolean;
}) {
  const chartData = useMemo(
    () =>
      metricFieldLabels.map((field) => ({
        key: field.key,
        label: field.label,
        baseline: target.baselineMetrics[field.key],
        accumulated: target.accumulatedMetrics[field.key],
        final: target.finalMetrics[field.key],
      })),
    [target],
  );

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base">
              Link {index + 1} — {platformLabel[target.platform]}
            </CardTitle>
            <Link
              href={target.url}
              target="_blank"
              rel="noreferrer"
              className="text-primary block truncate text-sm hover:underline"
            >
              {target.url}
            </Link>
          </div>
          <PlatformBadge platform={target.platform} />
        </div>
        <CardDescription suppressHydrationWarning>
          Awal: {formatDateTime(target.baselineScrapedAt)}
          {" · "}
          Akhir: {formatDateTime(target.finalScrapedAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showChart ? (
          <ChartContainer config={metricsChartConfig} className="aspect-[4/3] w-full max-h-[220px]">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={36} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      Number(value).toLocaleString("id-ID"),
                      name === "baseline"
                        ? "Data Awal"
                        : name === "accumulated"
                          ? "Akumulasi"
                          : "Data Riil Akhir",
                    ]}
                  />
                }
              />
              <Bar dataKey="baseline" fill="var(--color-baseline)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="accumulated" fill="var(--color-accumulated)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="final" fill="var(--color-final)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        ) : (
          <Skeleton className="aspect-[4/3] w-full max-h-[220px] rounded-md" />
        )}
        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
          <MetricSummaryCard title="Data Awal" metrics={target.baselineMetrics} />
          <MetricSummaryCard title="Akumulasi" metrics={target.accumulatedMetrics} />
          <MetricSummaryCard title="Data Riil Akhir" metrics={target.finalMetrics} pending={!target.finalScrapedAt} />
        </div>
      </CardContent>
    </Card>
  );
}

function MetricSummaryCard({
  title,
  metrics,
  pending = false,
}: {
  title: string;
  metrics: BlastingMetricsDashboard["targets"][number]["baselineMetrics"];
  pending?: boolean;
}) {
  return (
    <div className="rounded-md border px-3 py-2">
      <p className="text-muted-foreground mb-2 font-medium">{title}</p>
      <div className="grid grid-cols-5 gap-1">
        {metricFieldLabels.map((field) => (
          <div key={field.key} className="text-center">
            <field.icon className="text-muted-foreground mx-auto size-3.5" aria-hidden />
            <p className="mt-1 font-medium tabular-nums">
              {pending ? "-" : metrics[field.key].toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlastingMetricsDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-16 rounded-lg" />
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

export function BlastingMetricsDashboardView({
  initialData,
  orderId,
}: {
  initialData: BlastingMetricsDashboard;
  orderId: string;
}) {
  const mounted = useClientMounted();
  const [data, setData] = useState(initialData);
  const [retrying, setRetrying] = useState<"baseline" | "deadline" | null>(null);

  async function handleRetry(phase: "baseline" | "deadline") {
    setRetrying(phase);
    try {
      const response = await retryBlastingMetricsScrape(orderId, phase);
      setData(response.data);
      toast.success(`Scrape ${phase === "baseline" ? "awal" : "akhir"} dimulai ulang`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memulai ulang scrape");
    } finally {
      setRetrying(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ScrapeStatusBadge label="Scrape Awal" status={data.scrapeStatus.baseline} />
        <ScrapeStatusBadge label="Scrape Akhir" status={data.scrapeStatus.deadline} />
        <div className="rounded-lg border px-3 py-2 sm:col-span-2">
          <p className="text-muted-foreground text-xs">Deadline</p>
          <p className="mt-1 text-sm font-medium" suppressHydrationWarning>
            {formatDateTime(data.deadline)}
          </p>
        </div>
      </div>

      {(data.scrapeStatus.baseline === "failed" || data.scrapeStatus.deadline === "failed") && (
        <div className="flex flex-wrap gap-2">
          {data.scrapeStatus.baseline === "failed" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={retrying !== null}
              onClick={() => void handleRetry("baseline")}
            >
              {retrying === "baseline" ? <Loader2Icon className="animate-spin" /> : <RefreshCwIcon />}
              Ulangi Scrape Awal
            </Button>
          ) : null}
          {data.scrapeStatus.deadline === "failed" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={retrying !== null}
              onClick={() => void handleRetry("deadline")}
            >
              {retrying === "deadline" ? <Loader2Icon className="animate-spin" /> : <RefreshCwIcon />}
              Ulangi Scrape Akhir
            </Button>
          ) : null}
        </div>
      )}


      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Per Target URL</h2>
        {data.targets.map((target, index) => (
          <BlastingMetricsTargetCard
            key={target.targetId}
            index={index}
            target={target}
            showChart={mounted}
          />
        ))}
      </section>
    </div>
  );
}
