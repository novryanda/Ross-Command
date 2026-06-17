"use client";

import { platformLabel } from "@/components/komando/badges";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PostingCompleteness, SocialPlatform } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const completenessClass: Record<PostingCompleteness, string> = {
  lengkap: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  sebagian: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

const completenessLabel: Record<PostingCompleteness, string> = {
  lengkap: "Lengkap",
  sebagian: "Sebagian",
};

export function PostingCompletenessBadge({
  completeness,
  missingPlatforms = [],
}: {
  completeness: PostingCompleteness;
  missingPlatforms?: SocialPlatform[];
}) {
  const badge = (
    <Badge className={cn("h-5 rounded-sm px-1.5 text-xs", completenessClass[completeness])}>
      {completenessLabel[completeness]}
    </Badge>
  );

  if (completeness === "sebagian" && missingPlatforms.length) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Belum diisi: {missingPlatforms.map((platform) => platformLabel[platform]).join(", ")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}
