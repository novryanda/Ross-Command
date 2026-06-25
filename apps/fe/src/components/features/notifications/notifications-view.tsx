"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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

import { PageHero } from "@/components/komando/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clientApiFetch } from "@/lib/api/client";
import type { NotificationCategory, NotificationItem, NotificationSeverity } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread" | NotificationCategory;

const STORAGE_KEY = "komando.notifications.readIds";

const categoryMeta: Record<
  NotificationCategory,
  { label: string; icon: LucideIcon; className: string }
> = {
  assignment: {
    label: "Tugas",
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

const severityClass: Record<NotificationSeverity, string> = {
  danger: "border-l-red-500",
  warning: "border-l-amber-500",
  info: "border-l-blue-500",
  success: "border-l-emerald-500",
};

function readStoredIds() {
  if (typeof window === "undefined") return new Set<string>();
  try {
    return new Set<string>(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]"));
  } catch {
    return new Set<string>();
  }
}

function storeReadIds(ids: Set<string>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids).slice(-250)));
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

export function NotificationsView({
  notifications,
  generatedAt,
}: {
  notifications: NotificationItem[];
  generatedAt?: string;
}) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    setReadIds(readStoredIds());
  }, []);

  const unreadCount = notifications.filter((item) => !item.readAt && !readIds.has(item.id)).length;
  const categories = Object.keys(categoryMeta).filter((category) =>
    notifications.some((item) => item.category === category),
  ) as NotificationCategory[];

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((item) => !item.readAt && !readIds.has(item.id));
    return notifications.filter((item) => item.category === filter);
  }, [filter, notifications, readIds]);

  const markRead = (id: string) => {
    const next = new Set(readIds);
    next.add(id);
    storeReadIds(next);
    setReadIds(next);
  };

  const markAllRead = async () => {
    await clientApiFetch<null>("/api/v1/notifications/mark-all-read", {
      method: "POST",
      body: JSON.stringify({}),
    }).catch(() => null);

    const next = new Set(readIds);
    notifications.forEach((item) => next.add(item.id));
    storeReadIds(next);
    setReadIds(next);
    toast.success("Notifikasi ditandai sudah dibaca");
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Pusat aktivitas"
        title="Notifikasi"
        description="Alert operasional dari tugas, deadline, submission anggota, akun, dan struktur organisasi."
        actions={
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheckIcon />
            Tandai semua
          </Button>
        }
      >
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <HeroMetric label="Belum dibaca" value={unreadCount} />
          <HeroMetric label="Total alert" value={notifications.length} />
          <HeroMetric
            label="Terakhir sinkron"
            value={generatedAt ? new Date(generatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}
          />
        </div>
      </PageHero>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="unread">
            Belum dibaca
            {unreadCount > 0 ? (
              <Badge variant="secondary" className="ml-1.5">
                {unreadCount}
              </Badge>
            ) : null}
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {categoryMeta[category].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <Card className="py-0">
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BellIcon />
              </EmptyMedia>
              <EmptyTitle>Tidak ada notifikasi</EmptyTitle>
              <EmptyDescription>
                {filter === "all"
                  ? "Semua kondisi operasional sedang aman."
                  : "Tidak ada notifikasi yang cocok dengan filter ini."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </Card>
      ) : (
        <Card className="divide-border overflow-hidden divide-y py-0">
          {filtered.map((item) => {
            const meta = categoryMeta[item.category];
            const Icon = meta.icon;
            const isRead = Boolean(item.readAt) || readIds.has(item.id);
            const row = (
              <span
                className={cn(
                  "group flex w-full items-start gap-4 border-l-2 p-4 text-left transition-colors hover:bg-accent/60",
                  severityClass[item.severity],
                  !isRead && "bg-accent/35",
                )}
              >
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-md", meta.className)}>
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={cn("text-sm", !isRead && "font-semibold")}>{item.title}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {meta.label}
                    </Badge>
                    {!isRead ? <span className="bg-primary size-1.5 rounded-full" aria-hidden /> : null}
                  </span>
                  <span className="text-muted-foreground block text-sm">{item.description}</span>
                  <span className="text-muted-foreground block text-xs">{formatRelative(item.createdAt)}</span>
                </span>
                {item.href ? (
                  <span className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-medium opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    Buka
                  </span>
                ) : null}
              </span>
            );

            return item.href ? (
              <Link key={item.id} href={item.href} onClick={() => markRead(item.id)}>
                {row}
              </Link>
            ) : (
              <button key={item.id} type="button" className="w-full" onClick={() => markRead(item.id)}>
                {row}
              </button>
            );
          })}
        </Card>
      )}
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border bg-background/70 px-3 py-2">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
    </div>
  );
}
