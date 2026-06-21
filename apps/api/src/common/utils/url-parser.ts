import type { z } from 'zod';
import { socialPlatformSchema } from '../../orders/orders.schema';

export type SocialPlatform = z.infer<typeof socialPlatformSchema>;

const PLATFORM_DOMAINS: Record<string, SocialPlatform> = {
  'instagram.com': 'instagram',
  'instagr.am': 'instagram',
  'tiktok.com': 'tiktok',
  'twitter.com': 'twitter_x',
  'x.com': 'twitter_x',
  'facebook.com': 'facebook',
  'fb.com': 'facebook',
  'fb.watch': 'facebook',
  'youtube.com': 'youtube',
  'youtu.be': 'youtube',
};

export type ParsedLink = {
  url: string;
  platform: SocialPlatform;
};

export function detectPlatform(url: string): SocialPlatform {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return PLATFORM_DOMAINS[hostname] ?? 'other';
  } catch {
    return 'other';
  }
}

export function parseLinks(rawText: string): ParsedLink[] {
  const urlRegex = /https?:\/\/[^\s,<>"']+/g;
  const urls = rawText.match(urlRegex) ?? [];

  return urls
    .map((url) => url.replace(/[.,;!?)]+$/, ''))
    .filter((url, index, self) => self.indexOf(url) === index)
    .map((url) => ({
      url,
      platform: detectPlatform(url),
    }));
}
