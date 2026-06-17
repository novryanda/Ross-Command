"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";

import { PlatformBadge, platformLabel } from "@/components/komando/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OrderSocialTarget, SocialPlatform } from "@/lib/api/types";

const platformOptions: SocialPlatform[] = [
  "instagram",
  "twitter_x",
  "facebook",
  "tiktok",
  "youtube",
  "other",
];

export type OrderTargetUrlDraft = {
  clientId: string;
  platform: SocialPlatform;
  url: string;
};

export function createTargetUrlDraft(
  platform: SocialPlatform = "instagram",
  url = "",
): OrderTargetUrlDraft {
  return {
    clientId: crypto.randomUUID(),
    platform,
    url,
  };
}

export function isValidTargetUrl(value: string) {
  if (!value.trim()) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function hasValidTargetUrls(targetUrls: OrderTargetUrlDraft[]) {
  const filled = targetUrls.filter((item) => item.url.trim());
  return filled.length > 0 && filled.every((item) => isValidTargetUrl(item.url));
}

type OrderTargetUrlsFieldProps = {
  value: OrderTargetUrlDraft[];
  onChange: (value: OrderTargetUrlDraft[]) => void;
};

export function OrderTargetUrlsField({ value, onChange }: OrderTargetUrlsFieldProps) {
  function updateEntry(clientId: string, patch: Partial<OrderTargetUrlDraft>) {
    onChange(value.map((item) => (item.clientId === clientId ? { ...item, ...patch } : item)));
  }

  function removeEntry(clientId: string) {
    if (value.length === 1) {
      onChange([createTargetUrlDraft()]);
      return;
    }
    onChange(value.filter((item) => item.clientId !== clientId));
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label>URL Target</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onChange([...value, createTargetUrlDraft()])}
        >
          <PlusIcon className="size-3.5" />
          Tambah URL
        </Button>
      </div>

      <div className="space-y-2">
        {value.map((entry, index) => (
          <div key={entry.clientId} className="overflow-hidden rounded-lg border">
            <div className="bg-muted/40 flex items-center justify-between gap-2 border-b px-3 py-2">
              <Select
                value={entry.platform}
                onValueChange={(platform) => updateEntry(entry.clientId, { platform: platform as SocialPlatform })}
              >
                <SelectTrigger size="sm" className="h-7 w-44 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platformLabel[platform]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label={`Hapus URL target ${index + 1}`}
                onClick={() => removeEntry(entry.clientId)}
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </div>
            <div className="p-3">
              <Input
                type="url"
                placeholder="https://"
                value={entry.url}
                onChange={(event) => updateEntry(entry.clientId, { url: event.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderTargetUrlsList({ targets }: { targets: OrderSocialTarget[] }) {
  if (!targets.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm">URL Target</p>
      <ul className="space-y-2">
        {targets.map((target) => (
          <li key={target.id ?? `${target.platform}-${target.url}`} className="rounded-lg border p-3">
            <div className="mb-2">
              <PlatformBadge platform={target.platform} />
            </div>
            <a href={target.url} target="_blank" rel="noreferrer" className="text-primary break-all text-sm hover:underline">
              {target.url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
