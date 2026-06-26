import {
  emptySubmissionMetrics,
  normalizeMetrics,
  type SubmissionMetrics,
} from '../common/utils/submission.util';

const METRIC_ALIASES: Record<keyof SubmissionMetrics, string[]> = {
  views: [
    'views',
    'viewCount',
    'view_count',
    'videoViewCount',
    'videoPlayCount',
    'playCount',
    'plays',
    'play_count',
  ],
  likes: [
    'likes',
    'likeCount',
    'like_count',
    'likesCount',
    'hearts',
    'heartCount',
  ],
  comments: [
    'comments',
    'commentCount',
    'comment_count',
    'commentsCount',
    'replies',
    'replyCount',
  ],
  shares: ['shares', 'shareCount', 'share_count'],
  reposts: ['reposts', 'repostCount', 'repost_count', 'retweets', 'retweetCount'],
};

function pickNumber(source: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.max(0, Math.floor(value));
    }
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return Math.max(0, Math.floor(parsed));
      }
    }
  }

  return 0;
}

export function mapApifyOutputToMetrics(payload: unknown): SubmissionMetrics {
  if (!payload || typeof payload !== 'object') {
    return { ...emptySubmissionMetrics };
  }

  const source = payload as Record<string, unknown>;
  const nested =
    source.metrics && typeof source.metrics === 'object'
      ? (source.metrics as Record<string, unknown>)
      : source.result && typeof source.result === 'object'
        ? (source.result as Record<string, unknown>)
        : source;

  const metrics: SubmissionMetrics = {
    views: pickNumber(nested, METRIC_ALIASES.views),
    likes: pickNumber(nested, METRIC_ALIASES.likes),
    comments: pickNumber(nested, METRIC_ALIASES.comments),
    shares: pickNumber(nested, METRIC_ALIASES.shares),
    reposts: pickNumber(nested, METRIC_ALIASES.reposts),
  };

  return normalizeMetrics(metrics);
}

export function extractApifyDatasetItems(payload: unknown): unknown[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const source = payload as Record<string, unknown>;

  if (Array.isArray(source)) {
    return source;
  }

  if (Array.isArray(source.items)) {
    return source.items;
  }

  if (Array.isArray(source.data)) {
    return source.data;
  }

  if (source.data && typeof source.data === 'object') {
    const nested = source.data as Record<string, unknown>;
    if (Array.isArray(nested.items)) {
      return nested.items;
    }
  }

  return [payload];
}

export function mergeDatasetMetrics(items: unknown[]): SubmissionMetrics {
  return items.reduce<SubmissionMetrics>(
    (total, item) => {
      const metrics = mapApifyOutputToMetrics(item);
      return {
        views: total.views + metrics.views,
        likes: total.likes + metrics.likes,
        comments: total.comments + metrics.comments,
        shares: total.shares + metrics.shares,
        reposts: total.reposts + metrics.reposts,
      };
    },
    emptySubmissionMetrics,
  );
}
