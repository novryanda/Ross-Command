import type { LucideIcon } from "lucide-react";
import { EyeIcon, HeartIcon, MessageCircleIcon, Repeat2Icon, Share2Icon } from "lucide-react";

import type { OrderSocialTarget, Submission, SubmissionMetrics, TargetMetricEntry } from "@/lib/api/types";

export const emptySubmissionMetrics: SubmissionMetrics = {
  views: 0,
  likes: 0,
  comments: 0,
  shares: 0,
  reposts: 0,
};

export type MetricFieldLabel = {
  key: keyof SubmissionMetrics;
  label: string;
  short: string;
  icon: LucideIcon;
};

export const metricFieldLabels: MetricFieldLabel[] = [
  { key: "views", label: "Tayangan", short: "T", icon: EyeIcon },
  { key: "likes", label: "Suka", short: "S", icon: HeartIcon },
  { key: "comments", label: "Komentar", short: "K", icon: MessageCircleIcon },
  { key: "shares", label: "Bagikan", short: "B", icon: Share2Icon },
  { key: "reposts", label: "Repost", short: "R", icon: Repeat2Icon },
];

export function buildInitialTargetMetricValues(
  targets: OrderSocialTarget[],
  submission?: Submission | null,
): Record<string, SubmissionMetrics> {
  const fromSubmission = new Map(
    (submission?.targetMetrics ?? []).map((entry) => [entry.targetId, entry.metrics]),
  );

  return Object.fromEntries(
    targets.map((target) => [
      target.id ?? target.url,
      fromSubmission.get(target.id ?? "") ??
        target.baselineMetrics ?? { ...emptySubmissionMetrics },
    ]),
  );
}

export function buildTargetMetricsPayload(
  targets: OrderSocialTarget[],
  values: Record<string, SubmissionMetrics>,
): TargetMetricEntry[] {
  return targets.map((target) => {
    const key = target.id ?? target.url;
    return {
      targetId: target.id ?? key,
      platform: target.platform,
      url: target.url,
      metrics: values[key] ?? { ...emptySubmissionMetrics },
    };
  });
}

export function hasAnyTargetMetric(
  targets: OrderSocialTarget[],
  values: Record<string, SubmissionMetrics>,
) {
  return buildTargetMetricsPayload(targets, values).some((entry) =>
    Object.values(entry.metrics).some((value) => value > 0),
  );
}

export function sumTargetMetricValues(values: Record<string, SubmissionMetrics>): SubmissionMetrics {
  return Object.values(values).reduce(
    (total, metrics) => ({
      views: total.views + metrics.views,
      likes: total.likes + metrics.likes,
      comments: total.comments + metrics.comments,
      shares: total.shares + metrics.shares,
      reposts: total.reposts + metrics.reposts,
    }),
    { ...emptySubmissionMetrics },
  );
}

export function diffMetrics(
  current: SubmissionMetrics,
  baseline?: SubmissionMetrics,
): SubmissionMetrics {
  const safeBaseline = baseline ?? emptySubmissionMetrics;

  return {
    views: current.views - safeBaseline.views,
    likes: current.likes - safeBaseline.likes,
    comments: current.comments - safeBaseline.comments,
    shares: current.shares - safeBaseline.shares,
    reposts: current.reposts - safeBaseline.reposts,
  };
}
