import { formatDistanceToNowStrict } from "date-fns";
import { id } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import type { AssignmentStatus, OrderStatus, OrderType, SocialPlatform } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const orderStatusLabel: Record<OrderStatus, string> = {
  draft: "Draft",
  aktif: "Aktif",
  selesai: "Selesai",
  expired: "Expired",
  dibatalkan: "Dibatalkan",
};

const assignmentStatusLabel: Record<AssignmentStatus, string> = {
  belum_dikerjakan: "Belum Dikerjakan",
  selesai: "Selesai",
  terlambat: "Terlambat",
};

const statusClass: Record<OrderStatus | AssignmentStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  aktif: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  expired: "bg-red-500/10 text-red-700 dark:text-red-300",
  dibatalkan: "bg-red-500/10 text-red-700 dark:text-red-300",
  belum_dikerjakan: "bg-muted text-muted-foreground",
  selesai: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  terlambat: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

const orderTypeLabel: Record<OrderType, string> = {
  posting: "Posting",
  engagement: "Blasting",
  blasting: "Blasting",
  counter: "Counter",
  report_akun: "Report",
};

const orderTypeFilterOptions = [
  { value: "posting", label: "Posting" },
  { value: "blasting", label: "Blasting" },
  { value: "counter", label: "Counter" },
  { value: "report_akun", label: "Report" },
] as const;

const orderTypeFilterAliases = {
  engagement: "blasting",
  komentar: "counter",
} as const;

const orderTypeClass: Record<OrderType, string> = {
  posting: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  engagement: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  blasting: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  counter: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  report_akun: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

const platformLabel: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  twitter_x: "Twitter / X",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  other: "Lainnya",
};

export function StatusBadge({ status }: { status: OrderStatus | AssignmentStatus }) {
  const label = status in orderStatusLabel
    ? orderStatusLabel[status as OrderStatus]
    : assignmentStatusLabel[status as AssignmentStatus];

  return <Badge className={cn("h-5 rounded-sm px-1.5 text-xs", statusClass[status])}>{label}</Badge>;
}

export function OrderTypeBadge({ type }: { type: OrderType }) {
  return <Badge className={cn("h-5 rounded-sm px-1.5 text-xs", orderTypeClass[type])}>{orderTypeLabel[type]}</Badge>;
}

export function PlatformBadge({ platform }: { platform: SocialPlatform }) {
  return <Badge variant="secondary" className="h-5 rounded-sm px-1.5 text-xs">{platformLabel[platform]}</Badge>;
}

export function submissionInputLabel(submission?: {
  submissionSource?: string;
  isRepresented?: boolean;
} | null) {
  if (!submission) {
    return null;
  }

  const byCommander =
    submission.isRepresented ||
    submission.submissionSource === "pimpinan" ||
    submission.submissionSource === "represented";

  return byCommander ? "Pimpinan satuan" : "Mandiri";
}

export function DeadlineBadge({ deadline }: { deadline: string }) {
  const date = new Date(deadline);
  const diff = date.getTime() - Date.now();
  const isPast = diff < 0;
  const isNear = diff > 0 && diff < 24 * 60 * 60 * 1000;

  return (
    <Badge
      className={cn(
        "h-5 rounded-sm px-1.5 text-xs",
        isPast && "bg-red-500/10 text-red-700 dark:text-red-300",
        isNear && "bg-amber-500/10 text-amber-700 dark:text-amber-300",
      )}
      variant={isPast || isNear ? "default" : "outline"}
    >
      {isPast ? "Lewat deadline" : formatDistanceToNowStrict(date, { addSuffix: true, locale: id })}
    </Badge>
  );
}

export {
  assignmentStatusLabel,
  orderStatusLabel,
  orderTypeFilterAliases,
  orderTypeFilterOptions,
  orderTypeLabel,
  platformLabel,
};
