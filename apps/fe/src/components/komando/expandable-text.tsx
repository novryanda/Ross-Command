"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const lineClampClass: Record<number, string> = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

type ExpandableTextProps = {
  children?: string | null;
  lines?: number;
  className?: string;
  textClassName?: string;
  expandLabel?: string;
  collapseLabel?: string;
};

function estimateNeedsExpand(text: string, lines: number) {
  const lineCount = text.split("\n").length;
  const charThreshold = lines * 72;

  return lineCount > lines || text.length > charThreshold;
}

export function ExpandableText({
  children,
  lines = 4,
  className,
  textClassName,
  expandLabel = "Selengkapnya",
  collapseLabel = "Sembunyikan",
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const text = children?.trim() ?? "";

  if (!text) {
    return null;
  }

  const needsExpand = estimateNeedsExpand(text, lines);
  const clampClass = lineClampClass[lines] ?? lineClampClass[4];

  if (!needsExpand) {
    return (
      <p className={cn("whitespace-pre-wrap leading-6", textClassName, className)}>{text}</p>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <p
        className={cn(
          "whitespace-pre-wrap leading-6",
          textClassName,
          !expanded && clampClass,
        )}
      >
        {text}
      </p>
      <Button
        type="button"
        variant="link"
        className="text-primary h-auto p-0 text-xs font-bold"
        onClick={() => setExpanded((current) => !current)}
      >
        {expanded ? collapseLabel : expandLabel}
      </Button>
    </div>
  );
}

type LabeledExpandableTextProps = ExpandableTextProps & {
  label: string;
};

export function LabeledExpandableText({
  label,
  className,
  textClassName,
  ...props
}: LabeledExpandableTextProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-muted-foreground text-sm">{label}</p>
      <ExpandableText textClassName={textClassName} {...props} />
    </div>
  );
}
