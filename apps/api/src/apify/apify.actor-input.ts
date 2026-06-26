type BuildActorRunInputParams = {
  actorId: string;
  platform: string;
  url: string;
};

export function normalizeScrapeTargetUrl(url: string, platform: string): string {
  try {
    const parsed = new URL(url.trim());
    if (platform === 'instagram') {
      return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, '');
    }
    return parsed.toString();
  } catch {
    return url.trim();
  }
}

export function buildActorRunInput(
  params: BuildActorRunInputParams,
): Record<string, unknown> {
  const normalizedUrl = normalizeScrapeTargetUrl(params.url, params.platform);
  const actorKey = params.actorId.toLowerCase();

  if (params.platform === 'instagram' || actorKey.includes('instagram')) {
    if (actorKey.includes('instagram-post-scraper')) {
      return {
        username: [normalizedUrl],
        resultsLimit: 1,
      };
    }

    if (actorKey.includes('instagram-scraper')) {
      return {
        directUrls: [normalizedUrl],
        resultsType: 'posts',
        resultsLimit: 1,
      };
    }

    return {
      username: [normalizedUrl],
      resultsLimit: 1,
    };
  }

  if (params.platform === 'twitter_x' || actorKey.includes('twitter')) {
    return {
      startUrls: [normalizedUrl],
      maxItems: 1,
    };
  }

  if (params.platform === 'facebook' || actorKey.includes('facebook')) {
    return {
      startUrls: [{ url: normalizedUrl }],
      maxPosts: 1,
    };
  }

  if (params.platform === 'tiktok' || actorKey.includes('tiktok')) {
    return {
      postURLs: [normalizedUrl],
      resultsPerPage: 1,
    };
  }

  if (params.platform === 'youtube' || actorKey.includes('youtube')) {
    return {
      startUrls: [{ url: normalizedUrl }],
      maxResults: 1,
    };
  }

  return {
    startUrls: [{ url: normalizedUrl }],
  };
}
