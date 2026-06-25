import { Globe2Icon } from "lucide-react";

import type { SocialPlatform } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const platformIconSrc: Partial<Record<SocialPlatform, string>> = {
  instagram: "/asset/instagram.svg",
  twitter_x: "/asset/x.svg",
  facebook: "/asset/facebook.svg",
  tiktok: "/asset/tiktok.svg",
  youtube: "/asset/youtube.svg",
};

const platformIconLabel: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  twitter_x: "Twitter / X",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  other: "Lainnya",
};

export function PlatformIcon({
  platform,
  className,
}: {
  platform: SocialPlatform;
  className?: string;
}) {
  const src = platformIconSrc[platform];
  const label = platformIconLabel[platform];

  if (!src) {
    return (
      <Globe2Icon
        className={cn("text-muted-foreground size-4 shrink-0", className)}
        aria-label={label}
      />
    );
  }

  // Brand SVGs live in /public/asset; render them as plain images.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={label} className={cn("size-4 shrink-0 object-contain", className)} />;
}
