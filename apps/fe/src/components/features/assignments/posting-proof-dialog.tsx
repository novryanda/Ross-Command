"use client";

import Link from "next/link";

import { platformLabel } from "@/components/komando/badges";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { PlatformProofLink, SocialPlatform, Submission } from "@/lib/api/types";

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function PostingProofDialog({
  submission,
  targetPlatforms = [],
  trigger,
}: {
  submission: Submission;
  targetPlatforms?: SocialPlatform[];
  trigger?: React.ReactNode;
}) {
  const linksByPlatform = new Map(
    (submission.platformLinks ?? []).map((link) => [link.platform, link.url]),
  );
  const platforms = targetPlatforms.length
    ? targetPlatforms
    : (submission.platformLinks ?? []).map((link) => link.platform);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline" className="h-8">
            Bukti
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bukti Posting Sosmed</DialogTitle>
          <DialogDescription>
            Link posting per platform yang dikirim anggota.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {submission.driveLink ? (
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium">Link Drive</p>
              <Link
                href={submission.driveLink}
                target="_blank"
                rel="noreferrer"
                className="text-primary mt-1 block break-all text-sm hover:underline"
              >
                {submission.driveLink}
              </Link>
            </div>
          ) : null}
          {platforms.map((platform) => {
            const url = linksByPlatform.get(platform);

            return (
              <div key={platform} className="rounded-lg border p-3">
                <p className="text-sm font-medium">{platformLabel[platform]}</p>
                {url ? (
                  <Link
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary mt-1 block break-all text-sm hover:underline"
                  >
                    {url}
                  </Link>
                ) : (
                  <p className="text-muted-foreground mt-1 text-sm">Belum diisi</p>
                )}
              </div>
            );
          })}
          {submission.notes ? (
            <p className="text-muted-foreground text-sm">
              <span className="text-foreground font-medium">Catatan: </span>
              {submission.notes}
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function buildPostingPlatformLinks(
  targetPlatforms: SocialPlatform[],
  values: Record<string, string>,
): PlatformProofLink[] {
  return targetPlatforms
    .map((platform) => ({
      platform,
      url: values[platform]?.trim() ?? "",
    }))
    .filter((item) => isValidUrl(item.url));
}

export function hasAtLeastOnePostingLink(
  targetPlatforms: SocialPlatform[],
  values: Record<string, string>,
) {
  return buildPostingPlatformLinks(targetPlatforms, values).length > 0;
}

export function getMissingPostingPlatforms(
  targetPlatforms: SocialPlatform[],
  values: Record<string, string>,
) {
  const submitted = new Set(
    buildPostingPlatformLinks(targetPlatforms, values).map((link) => link.platform),
  );

  return targetPlatforms.filter((platform) => !submitted.has(platform));
}
