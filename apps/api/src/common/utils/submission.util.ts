export type PlatformProofLink = {
  platform: string;
  url: string;
};

export type PostingCompleteness = 'lengkap' | 'sebagian';

export type SubmissionMetrics = {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  reposts: number;
};

export const emptySubmissionMetrics: SubmissionMetrics = {
  views: 0,
  likes: 0,
  comments: 0,
  shares: 0,
  reposts: 0,
};

export type TargetMetricEntry = {
  targetId: string;
  platform: string;
  url: string;
  baselineMetrics?: SubmissionMetrics;
  metrics: SubmissionMetrics;
  deltaMetrics?: SubmissionMetrics;
};

export type TargetMetricTotal = {
  targetId: string;
  platform: string;
  url: string;
  baselineMetrics?: SubmissionMetrics;
  metrics: SubmissionMetrics;
  deltaMetrics?: SubmissionMetrics;
};

export function parseTargetMetrics(value: unknown): TargetMetricEntry[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const entries = value
    .filter(
      (item): item is TargetMetricEntry =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as TargetMetricEntry).targetId === 'string' &&
        typeof (item as TargetMetricEntry).platform === 'string' &&
        typeof (item as TargetMetricEntry).url === 'string' &&
        typeof (item as TargetMetricEntry).metrics === 'object' &&
        (item as TargetMetricEntry).metrics !== null,
    )
    .map((item) => ({
      targetId: item.targetId,
      platform: item.platform,
      url: item.url.trim(),
      baselineMetrics:
        typeof item.baselineMetrics === 'object' && item.baselineMetrics !== null
          ? normalizeMetrics(item.baselineMetrics)
          : undefined,
      metrics: normalizeMetrics(item.metrics),
      deltaMetrics:
        typeof item.deltaMetrics === 'object' && item.deltaMetrics !== null
          ? normalizeDeltaMetrics(item.deltaMetrics)
          : undefined,
    }));

  return entries.length ? entries : null;
}

export function normalizeMetrics(value: unknown): SubmissionMetrics {
  if (typeof value !== 'object' || value === null) {
    return { ...emptySubmissionMetrics };
  }

  const metrics = value as Partial<SubmissionMetrics>;
  return {
    views: Math.max(0, Number(metrics.views) || 0),
    likes: Math.max(0, Number(metrics.likes) || 0),
    comments: Math.max(0, Number(metrics.comments) || 0),
    shares: Math.max(0, Number(metrics.shares) || 0),
    reposts: Math.max(0, Number(metrics.reposts) || 0),
  };
}

export function hasAnyMetric(metrics: SubmissionMetrics) {
  return Object.values(metrics).some((value) => value > 0);
}

export function normalizeDeltaMetrics(value: unknown): SubmissionMetrics {
  if (typeof value !== 'object' || value === null) {
    return { ...emptySubmissionMetrics };
  }

  const metrics = value as Partial<SubmissionMetrics>;
  return {
    views: Number(metrics.views) || 0,
    likes: Number(metrics.likes) || 0,
    comments: Number(metrics.comments) || 0,
    shares: Number(metrics.shares) || 0,
    reposts: Number(metrics.reposts) || 0,
  };
}

export function sumMetrics(
  left: SubmissionMetrics,
  right: SubmissionMetrics,
): SubmissionMetrics {
  return {
    views: left.views + right.views,
    likes: left.likes + right.likes,
    comments: left.comments + right.comments,
    shares: left.shares + right.shares,
    reposts: left.reposts + right.reposts,
  };
}

export function subtractMetrics(
  current: SubmissionMetrics,
  baseline: SubmissionMetrics,
): SubmissionMetrics {
  return {
    views: current.views - baseline.views,
    likes: current.likes - baseline.likes,
    comments: current.comments - baseline.comments,
    shares: current.shares - baseline.shares,
    reposts: current.reposts - baseline.reposts,
  };
}

export function sumTargetMetricEntries(
  entries: TargetMetricEntry[],
): SubmissionMetrics {
  return entries.reduce(
    (total, entry) => sumMetrics(total, entry.metrics),
    { ...emptySubmissionMetrics },
  );
}

export function resolveSubmissionMetrics(submission: {
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  reposts?: number;
  targetMetrics?: unknown;
}): SubmissionMetrics {
  const targetMetrics = parseTargetMetrics(submission.targetMetrics);
  if (targetMetrics?.length) {
    return sumTargetMetricEntries(targetMetrics);
  }

  return {
    views: submission.views ?? 0,
    likes: submission.likes ?? 0,
    comments: submission.comments ?? 0,
    shares: submission.shares ?? 0,
    reposts: submission.reposts ?? 0,
  };
}

export function aggregateTargetMetricTotals(
  socialTargets: Array<{
    id: string;
    platform: string;
    url: string;
    sortOrder: number;
    baselineMetrics?: unknown;
  }>,
  submissions: Array<{ targetMetrics: unknown }>,
): TargetMetricTotal[] {
  const totals = new Map<string, TargetMetricTotal>();

  for (const target of socialTargets) {
    totals.set(target.id, {
      targetId: target.id,
      platform: target.platform,
      url: target.url,
      baselineMetrics: normalizeMetrics(target.baselineMetrics),
      metrics: { ...emptySubmissionMetrics },
    });
  }

  for (const submission of submissions) {
    const entries = parseTargetMetrics(submission.targetMetrics);
    if (!entries?.length) {
      continue;
    }

    for (const entry of entries) {
      const current = totals.get(entry.targetId);
      if (!current) {
        continue;
      }

      current.metrics = sumMetrics(current.metrics, entry.metrics);
    }
  }

  const results: TargetMetricTotal[] = [];

  for (const target of socialTargets) {
    const item = totals.get(target.id);
    if (!item) {
      continue;
    }

    results.push({
      ...item,
      deltaMetrics: subtractMetrics(
        item.metrics,
        item.baselineMetrics ?? emptySubmissionMetrics,
      ),
    });
  }

  return results;
}

export function sumTargetBaselineMetrics(
  socialTargets: Array<{ baselineMetrics?: unknown }>,
): SubmissionMetrics {
  return socialTargets.reduce(
    (total, target) => sumMetrics(total, normalizeMetrics(target.baselineMetrics)),
    { ...emptySubmissionMetrics },
  );
}

export function parsePlatformLinks(value: unknown): PlatformProofLink[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const links = value
    .filter(
      (item): item is PlatformProofLink =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as PlatformProofLink).platform === 'string' &&
        typeof (item as PlatformProofLink).url === 'string' &&
        (item as PlatformProofLink).url.trim().length > 0,
    )
    .map((item) => ({
      platform: item.platform,
      url: item.url.trim(),
    }));

  return links.length ? links : null;
}

export function computePostingCompleteness(
  targetPlatforms: string[] | null | undefined,
  platformLinks: PlatformProofLink[] | null | undefined,
): {
  postingCompleteness: PostingCompleteness | null;
  missingPlatforms: string[];
} {
  if (!targetPlatforms?.length) {
    return { postingCompleteness: null, missingPlatforms: [] };
  }

  const submittedPlatforms = new Set(
    (platformLinks ?? []).map((link) => link.platform),
  );
  const missingPlatforms = targetPlatforms.filter(
    (platform) => !submittedPlatforms.has(platform),
  );

  if (!platformLinks?.length) {
    return { postingCompleteness: null, missingPlatforms: [...targetPlatforms] };
  }

  if (!missingPlatforms.length) {
    return { postingCompleteness: 'lengkap', missingPlatforms: [] };
  }

  return { postingCompleteness: 'sebagian', missingPlatforms };
}

type SubmissionRecord = {
  id: string;
  userId?: string;
  submittedByUserId?: string | null;
  submissionSource?: string | null;
  driveLink: string | null;
  platformLinks: unknown;
  targetMetrics?: unknown;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  reposts?: number;
  notes: string | null;
  submittedAt: Date;
  submittedBy?: {
    id: string;
    fullName: string;
    username: string;
  } | null;
};

export function serializeLatestSubmission(
  submission: SubmissionRecord | undefined,
  orderType: string,
  postingTargetPlatforms: string[] | null | undefined,
  blastingTargets?: Array<{
    id: string;
    platform: string;
    url: string;
    baselineMetrics?: unknown;
  }>,
) {
  if (!submission) {
    return null;
  }

  const platformLinks = parsePlatformLinks(submission.platformLinks);
  const targetBaselineMap = new Map(
    (blastingTargets ?? []).map((target) => [
      target.id,
      normalizeMetrics(target.baselineMetrics),
    ]),
  );
  const targetMetrics =
    parseTargetMetrics(submission.targetMetrics)?.map((entry) => {
      const baselineMetrics =
        entry.baselineMetrics ??
        targetBaselineMap.get(entry.targetId) ??
        ({ ...emptySubmissionMetrics } as SubmissionMetrics);

      return {
        ...entry,
        baselineMetrics,
        deltaMetrics:
          entry.deltaMetrics ?? subtractMetrics(entry.metrics, baselineMetrics),
      };
    }) ?? null;
  const metrics = resolveSubmissionMetrics(submission);
  const postingMeta =
    orderType === 'posting'
      ? computePostingCompleteness(postingTargetPlatforms, platformLinks)
      : { postingCompleteness: null, missingPlatforms: [] as string[] };

  return {
    id: submission.id,
    driveLink: submission.driveLink,
    platformLinks,
    targetMetrics,
    metrics,
    submissionSource: submission.submissionSource ?? 'self',
    submittedBy:
      submission.submittedBy ??
      (submission.submittedByUserId
        ? {
            id: submission.submittedByUserId,
            fullName: '',
            username: '',
          }
        : null),
    isRepresented:
      submission.submissionSource === 'pimpinan' ||
      submission.submissionSource === 'represented' ||
      (Boolean(submission.submittedByUserId) &&
        submission.submittedByUserId !== submission.userId),
    notes: submission.notes,
    submittedAt: submission.submittedAt,
    postingCompleteness: postingMeta.postingCompleteness,
    missingPlatforms: postingMeta.missingPlatforms,
  };
}
