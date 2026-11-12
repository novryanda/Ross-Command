import { readFileSync } from 'fs';
import { join } from 'path';
import { buildActorRunInput } from './apify.actor-input';
import { mergeDatasetMetrics } from './apify.mapper';

describe('YouTube Apify actor', () => {
  it('seeds a YouTube actor id that still exists', () => {
    const seed = readFileSync(
      join(__dirname, '..', '..', 'prisma', 'seed.ts'),
      'utf8',
    );
    const youtubeIds = [...seed.matchAll(/youtube: '([^']+)'/g)].map(
      (match) => match[1],
    );

    expect(youtubeIds).toEqual([
      'johnvc~youtube-shorts-api',
      'johnvc~youtube-shorts-api',
    ]);
  });

  it('builds the input the YouTube actor expects', () => {
    expect(
      buildActorRunInput({
        actorId: 'johnvc~youtube-shorts-api',
        platform: 'youtube',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      }),
    ).toEqual({
      startUrls: [{ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }],
      maxResultsShorts: 1,
    });
  });

  it('keeps the old input for other YouTube actors', () => {
    expect(
      buildActorRunInput({
        actorId: 'someone~youtube-scraper',
        platform: 'youtube',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      }),
    ).toEqual({
      startUrls: [{ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }],
      maxResults: 1,
    });
  });

  it('reads metrics from video rows and skips error rows', () => {
    const items = [
      {
        id: 'dQw4w9WgXcQ',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Demo',
        viewCount: 1500,
        likes: 120,
        commentsCount: 9,
      },
      {
        result_type: 'error',
        error_type: 'VIDEO_NOT_FOUND',
        error_message: 'Video not found',
        viewCount: 999,
        likes: 999,
        commentsCount: 999,
      },
    ];

    expect(mergeDatasetMetrics(items)).toEqual({
      views: 1500,
      likes: 120,
      comments: 9,
      shares: 0,
      reposts: 0,
    });
  });
});
