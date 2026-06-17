"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BellIcon,
  CheckCheckIcon,
  ClipboardCheckIcon,
  Clock3Icon,
  InboxIcon,
  SendIcon,
  ShieldAlertIcon,
  UserRoundCogIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { clientApiFetch } from "@/lib/api/client";
import type { NotificationCategory, NotificationItem, NotificationSeverity } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "komando.notifications.readIds";

const categoryMeta: Record<
  NotificationCategory,
  { label: string; icon: LucideIcon; className: string }
> = {
  assignment: {
    label: "Perintah",
    icon: ClipboardCheckIcon,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  deadline: {
    label: "Deadline",
    icon: Clock3Icon,
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  submission: {
    label: "Bukti",
    icon: InboxIcon,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  order: {
    label: "Progress",
    icon: SendIcon,
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  organization: {
    label: "Organisasi",
    icon: UsersIcon,
    className: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  },
  account: {
    label: "Akun",
    icon: UserRoundCogIcon,
    className: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  system: {
    label: "Sistem",
    icon: ShieldAlertIcon,
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
};

const severityRing: Record<NotificationSeverity, string> = {
  danger: "ring-red-500/30",
  warning: "ring-amber-500/30",
  info: "ring-blue-500/20",
  success: "ring-emerald-500/20",
};

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

function readStoredIds() {
  if (typeof window === "undefined") return new Set<string>();
  try {
    return new Set<string>(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]"));
  } catch {
    return new Set<string>();
  }
}

function storeReadIds(ids: Set<string>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids).slice(-150)));
}

export function KomandoNotificationPanel() {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const notificationsQuery = useQuery({
    queryKey: ["notifications", "panel"],
    queryFn: async () => (await clientApiFetch<NotificationItem[]>("/api/v1/notifications?limit=6")).data,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    setReadIds(readStoredIds());
  }, []);

  const items = notificationsQuery.data ?? [];
  const unreadItems = useMemo(
    () => items.filter((item) => !item.readAt && !readIds.has(item.id)),
    [items, readIds],
  );
  const unread = unreadItems.length;

  const markAllMutation = useMutation({
    mutationFn: async () =>
      clientApiFetch<null>("/api/v1/notifications/mark-all-read", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    onSettled: () => {
      const next = new Set(readIds);
      items.forEach((item) => next.add(item.id));
      storeReadIds(next);
      setReadIds(next);
    },
  });

  const markRead = (id: string) => {
    const next = new Set(readIds);
    next.add(id);
    storeReadIds(next);
    setReadIds(next);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifikasi" className="relative">
          <BellIcon />
          {unread > 0 ? (
            <span className="bg-red-500 text-white absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-[22rem] max-h-[min(24rem,calc(100dvh-5rem))] flex-col overflow-hidden p-0">
        <div className="flex shrink-0 items-center justify-between p-3">
          <div>
            <p className="text-sm font-semibold">Notifikasi</p>
            <p className="text-muted-foreground text-xs">
              {unread > 0 ? `${unread} belum dibaca` : "Semua sudah terbaca"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => markAllMutation.mutate()}
            disabled={unread === 0 || markAllMutation.isPending}
          >
            <CheckCheckIcon className="size-3.5" />
            Tandai
          </Button>
        </div>

        <Separator className="shrink-0" />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {notificationsQuery.isLoading ? (
            <div className="space-y-3 p-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-muted h-14 animate-pulse rounded-md" />
              ))}
            </div>
          ) : unreadItems.length === 0 ? (
            <div className="text-muted-foreground flex min-h-32 flex-col items-center justify-center gap-2 px-6 text-center text-xs">
              <BellIcon className="size-5" />
              Tidak ada notifikasi operasional saat ini.
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {unreadItems.map((item) => {
                const meta = categoryMeta[item.category];
                const Icon = meta.icon;
                const content = (
                  <span
                    className={cn(
                      "hover:bg-accent/70 bg-accent/35 flex w-full items-start gap-3 p-3 text-left transition-colors",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md ring-1",
                        meta.className,
                        severityRing[item.severity],
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1 space-y-0.5">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{item.title}</span>
                        <span className="bg-primary size-1.5 shrink-0 rounded-full" aria-hidden />
                      </span>
                      <span className="text-muted-foreground line-clamp-1 text-xs">{item.description}</span>
                      <span className="text-muted-foreground block text-[10px]">{formatRelative(item.createdAt)}</span>
                    </span>
                  </span>
                );

                return (
                  <li key={item.id}>
                    {item.href ? (
                      <Link href={item.href} onClick={() => markRead(item.id)}>
                        {content}
                      </Link>
                    ) : (
                      <button type="button" className="w-full" onClick={() => markRead(item.id)}>
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Separator className="shrink-0" />

        <div className="shrink-0 p-2">
          <Button asChild variant="ghost" size="sm" className="w-full text-xs">
            <Link href="/notifications">Lihat semua notifikasi</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
