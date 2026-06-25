import { Suspense } from "react";
import {
  AlertTriangleIcon,
  CircleCheckBigIcon,
  ClipboardListIcon,
  PlayCircleIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";

import { DashboardFilterBar } from "@/components/features/dashboard/dashboard-filter-bar";
import { CommandTaskCharts } from "@/components/komando/command-task-charts";
import { formatDashboardFilterSummary } from "@/lib/dashboard-filter-utils";
import { DeadlineBadge, OrderTypeBadge, StatusBadge } from "@/components/komando/badges";
import { PageHero } from "@/components/komando/page-hero";
import { PageState } from "@/components/komando/page-state";
import { StatsCard } from "@/components/komando/stats-card";
import { ToneProgressBar } from "@/components/komando/tone-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardCommander } from "@/lib/api/types";

export function DashboardCommanderView({ data }: { data: DashboardCommander }) {
  const filterSummary = formatDashboardFilterSummary(data.filters);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Komando"
        title="Dashboard Pimpinan"
        description={`${filterSummary}. Pantau progress pelaksanaan dan tren operasi di bawah struktur komando.`}
        actions={
          <Button asChild size="sm">
            <Link href="/orders/new">Buat Tugas Baru</Link>
          </Button>
        }
      />

      <Suspense fallback={null}>
        <DashboardFilterBar />
      </Suspense>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatsCard
          title="Jumlah Total Tugas"
          value={data.stats.totalOrders}
          description="Semua tugas sesuai filter"
          icon={ClipboardListIcon}
        />
        <StatsCard title="Personil Satuan" value={data.stats.totalSubordinateMembers} icon={UsersIcon} />
        <StatsCard
          title="Jumlah Tugas Terlaksana"
          value={data.stats.totalExecutedOrders}
          description="Tugas 100% terlaksana"
          icon={CircleCheckBigIcon}
        />
        <StatsCard
          title="Tugas Sedang Berjalan"
          value={data.stats.totalRunningOrders}
          description="Aktif & deadline belum lewat"
          icon={PlayCircleIcon}
        />
        <StatsCard
          title="Perlu Perhatian"
          value={data.stats.needsAttentionCount}
          description="Sedang berjalan, progress < 50%"
          icon={AlertTriangleIcon}
          className="border-amber-500/20 hover:border-amber-500/40"
        />
        <StatsCard
          title="Total Tugas Selesai"
          value={data.stats.totalCompletedOrders}
          description="Terlaksana penuh & waktu selesai"
          icon={CircleCheckBigIcon}
          className="border-emerald-500/20 hover:border-emerald-500/40"
        />
      </div>

      <CommandTaskCharts charts={data.charts} />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Tugas Terbaru</h2>
          <Button asChild size="sm" variant="ghost">
            <Link href="/orders">Lihat semua</Link>
          </Button>
        </div>
        {data.activeOrders.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {data.activeOrders.map((order) => (
              <Card key={order.id} className="border-border/70 shadow-sm">
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <Link href={`/orders/${order.id}`} className="line-clamp-1 font-medium hover:underline">
                        {order.title}
                      </Link>
                      <div className="flex flex-wrap gap-1.5">
                        <OrderTypeBadge type={order.orderType} />
                        <StatusBadge status={order.status} />
                        <DeadlineBadge deadline={order.deadline} />
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/orders/${order.id}`}>Detail</Link>
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-muted-foreground flex justify-between text-xs">
                      <span>
                        {order.progress.totalSubmitted}/{order.progress.totalAssigned} terlaksana
                      </span>
                      <span>{order.progress.percentageComplete}%</span>
                    </div>
                    <ToneProgressBar value={order.progress.percentageComplete} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <PageState
            title="Tidak ada tugas"
            description="Tidak ada data yang cocok dengan filter. Coba ubah periode, status, atau jenis tugas."
          />
        )}
      </section>
    </div>
  );
}
