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
  submittedByUserId?: string;
  submissionSource?: string;
  driveLink: string | null;
  platformLinks: unknown;
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
) {
  if (!submission) {
    return null;
  }

  const platformLinks = parsePlatformLinks(submission.platformLinks);
  const postingMeta =
    orderType === 'posting'
      ? computePostingCompleteness(postingTargetPlatforms, platformLinks)
      : { postingCompleteness: null, missingPlatforms: [] as string[] };

  return {
    id: submission.id,
    driveLink: submission.driveLink,
    platformLinks,
    metrics: {
      views: submission.views ?? 0,
      likes: submission.likes ?? 0,
      comments: submission.comments ?? 0,
      shares: submission.shares ?? 0,
      reposts: submission.reposts ?? 0,
    },
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
      submission.submissionSource === 'represented' ||
      (Boolean(submission.submittedByUserId) &&
        submission.submittedByUserId !== submission.userId),
    notes: submission.notes,
    submittedAt: submission.submittedAt,
    postingCompleteness: postingMeta.postingCompleteness,
    missingPlatforms: postingMeta.missingPlatforms,
  };
}
