"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";

import { PlatformBadge, platformLabel } from "@/components/komando/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { metricFieldLabels } from "@/lib/blasting-metrics";
import type { OrderSocialTarget, SocialPlatform, SubmissionMetrics } from "@/lib/api/types";

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
  baselineMetrics: SubmissionMetrics;
};

const emptyMetrics: SubmissionMetrics = {
  views: 0,
  likes: 0,
  comments: 0,
  shares: 0,
  reposts: 0,
};

export function createTargetUrlDraft(
  platform: SocialPlatform = "instagram",
  url = "",
  baselineMetrics: SubmissionMetrics = emptyMetrics,
): OrderTargetUrlDraft {
  return {
    clientId: crypto.randomUUID(),
    platform,
    url,
    baselineMetrics: { ...baselineMetrics },
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
  showBaselineMetrics?: boolean;
};

export function OrderTargetUrlsField({
  value,
  onChange,
  showBaselineMetrics = false,
}: OrderTargetUrlsFieldProps) {
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
              <div className="space-y-3">
                <Input
                  type="url"
                  placeholder="https://"
                  value={entry.url}
                  onChange={(event) => updateEntry(entry.clientId, { url: event.target.value })}
                />
                {showBaselineMetrics ? (
                  <div className="space-y-2 rounded-md border bg-muted/20 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">Baseline Metrik Awal</p>
                      <PlatformBadge platform={entry.platform} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                      {metricFieldLabels.map((field) => (
                        <label key={field.key} className="grid gap-1 text-xs">
                          <span className="text-muted-foreground">{field.label}</span>
                          <Input
                            type="number"
                            min={0}
                            value={entry.baselineMetrics[field.key]}
                            onChange={(event) =>
                              updateEntry(entry.clientId, {
                                baselineMetrics: {
                                  ...entry.baselineMetrics,
                                  [field.key]: Math.max(0, Number(event.target.value) || 0),
                                },
                              })
                            }
                            className="h-8"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
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
            {target.baselineMetrics ? (
              <div className="mt-3 grid grid-cols-5 gap-1">
                {metricFieldLabels.map((field) => (
                  <div
                    key={field.key}
                    title={field.label}
                    className="flex flex-col items-center gap-0.5 rounded-md bg-muted/60 px-1.5 py-1.5 text-center"
                  >
                    <field.icon className="text-muted-foreground size-3.5" aria-label={field.label} />
                    <p className="truncate text-xs font-medium tabular-nums">
                      {target.baselineMetrics?.[field.key].toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
