import type { OrderSocialTarget, Submission, SubmissionMetrics, TargetMetricEntry } from "@/lib/api/types";

export const emptySubmissionMetrics: SubmissionMetrics = {
  views: 0,
  likes: 0,
  comments: 0,
  shares: 0,
  reposts: 0,
};

export const metricFieldLabels: Array<{ key: keyof SubmissionMetrics; label: string; short: string }> = [
  { key: "views", label: "Views", short: "T" },
  { key: "likes", label: "Like", short: "S" },
  { key: "comments", label: "Comment", short: "K" },
  { key: "shares", label: "Share", short: "B" },
  { key: "reposts", label: "Repost", short: "R" },
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
      fromSubmission.get(target.id ?? "") ?? { ...emptySubmissionMetrics },
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
