export type PlatformProofLink = {
  platform: string;
  url: string;
};

export type PostingCompleteness = 'lengkap' | 'sebagian';

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
  driveLink: string | null;
  platformLinks: unknown;
  notes: string | null;
  submittedAt: Date;
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
    notes: submission.notes,
    submittedAt: submission.submittedAt,
    postingCompleteness: postingMeta.postingCompleteness,
    missingPlatforms: postingMeta.missingPlatforms,
  };
}
