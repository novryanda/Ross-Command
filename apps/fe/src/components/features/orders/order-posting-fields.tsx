"use client";

import { PlatformBadge, platformLabel } from "@/components/komando/badges";
import { PlatformIcon } from "@/components/komando/platform-icon";
import { ExpandableText, LabeledExpandableText } from "@/components/komando/expandable-text";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SocialPlatform } from "@/lib/api/types";

const platformOptions: SocialPlatform[] = [
  "instagram",
  "twitter_x",
  "facebook",
  "tiktok",
  "youtube",
];

export function isValidDriveUrl(value: string) {
  if (!value.trim()) return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

type OrderPostingFieldsProps = {
  postingSourceUrl: string;
  postingTargetPlatforms: SocialPlatform[];
  deskripsi: string;
  onPostingSourceUrlChange: (value: string) => void;
  onPostingTargetPlatformsChange: (value: SocialPlatform[]) => void;
  onDeskripsiChange: (value: string) => void;
};

export function OrderPostingFields({
  postingSourceUrl,
  postingTargetPlatforms,
  deskripsi,
  onPostingSourceUrlChange,
  onPostingTargetPlatformsChange,
  onDeskripsiChange,
}: OrderPostingFieldsProps) {
  function togglePlatform(platform: SocialPlatform, checked: boolean) {
    if (checked) {
      onPostingTargetPlatformsChange([...postingTargetPlatforms, platform]);
      return;
    }

    onPostingTargetPlatformsChange(postingTargetPlatforms.filter((item) => item !== platform));
  }

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="postingSourceUrl">Sumber Posting</Label>
        <Input
          id="postingSourceUrl"
          type="url"
          placeholder="https://drive.google.com/... (opsional)"
          value={postingSourceUrl}
          onChange={(event) => onPostingSourceUrlChange(event.target.value)}
        />
        <p className="text-muted-foreground text-xs">Opsional — link Google Drive berisi materi posting.</p>
      </div>

      <div className="grid gap-2">
        <Label>Target Sosmed Posting</Label>
        <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
          {platformOptions.map((platform) => {
            const checked = postingTargetPlatforms.includes(platform);
            const id = `posting-platform-${platform}`;

            return (
              <label key={platform} htmlFor={id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(value) => togglePlatform(platform, value === true)}
                />
                <PlatformIcon platform={platform} className="size-4" />
                <span>{platformLabel[platform]}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="deskripsi">Deskripsi</Label>
        <Textarea
          id="deskripsi"
          rows={4}
          placeholder="Deskripsi konten yang harus diposting"
          value={deskripsi}
          onChange={(event) => onDeskripsiChange(event.target.value)}
        />
      </div>
    </>
  );
}

export function OrderPostingDetails({
  postingSourceUrl,
  postingTargetPlatforms,
  deskripsi,
  instruksi,
}: {
  postingSourceUrl?: string | null;
  postingTargetPlatforms?: SocialPlatform[] | null;
  deskripsi?: string | null;
  instruksi?: string | null;
}) {
  return (
    <div className="space-y-3">
      {deskripsi ? (
        <LabeledExpandableText label="Deskripsi" lines={4}>
          {deskripsi}
        </LabeledExpandableText>
      ) : null}
      {postingSourceUrl ? (
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">Sumber Posting</p>
          <div className="rounded-lg border p-3">
            <a
              href={postingSourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary break-all text-sm hover:underline"
            >
              {postingSourceUrl}
            </a>
          </div>
        </div>
      ) : null}
      {postingTargetPlatforms?.length ? (
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">Target Sosmed Posting</p>
          <div className="flex flex-wrap gap-1.5">
            {postingTargetPlatforms.map((platform) => (
              <PlatformBadge key={platform} platform={platform} />
            ))}
          </div>
        </div>
      ) : null}
      {instruksi ? (
        <LabeledExpandableText label="Instruksi" lines={3}>
          {instruksi}
        </LabeledExpandableText>
      ) : null}
    </div>
  );
}

export function hasValidPostingDraft({
  postingSourceUrl,
  postingTargetPlatforms,
  deskripsi,
}: {
  postingSourceUrl: string;
  postingTargetPlatforms: SocialPlatform[];
  deskripsi: string;
}) {
  return (
    postingTargetPlatforms.length > 0 &&
    deskripsi.trim().length >= 3 &&
    (!postingSourceUrl.trim() || isValidDriveUrl(postingSourceUrl))
  );
}
