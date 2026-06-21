"use client";

import Link from "next/link";

import { PlatformBadge, platformLabel } from "@/components/komando/badges";
import { Input } from "@/components/ui/input";
import { metricFieldLabels } from "@/lib/blasting-metrics";
import type { OrderSocialTarget, SubmissionMetrics, TargetMetricTotal } from "@/lib/api/types";
import { cn } from "@/lib/utils";

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
        Perintah ini belum memiliki link target blasting.
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
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {metricFieldLabels.map((field) => (
                <label key={field.key} className="grid gap-1 text-xs">
                  <span className="text-muted-foreground">{field.label}</span>
                  <Input
                    type="number"
                    min={0}
                    value={metrics[field.key]}
                    disabled={disabled}
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
      <div className="grid grid-cols-5 gap-1">
        {metricFieldLabels.map((field) => (
          <div key={field.key} className="rounded-md bg-muted/60 px-1.5 py-1 text-center">
            <p className="text-muted-foreground text-[10px] leading-none">{field.short}</p>
            <p className="truncate text-xs font-medium tabular-nums">
              {target.metrics[field.key].toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
