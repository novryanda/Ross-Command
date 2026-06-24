import { Suspense } from "react";
import {
  AlertTriangleIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  FilterIcon,
  SendIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";

import { DashboardFilterBar } from "@/components/features/dashboard/dashboard-filter-bar";
import { DashboardCommanderCharts } from "@/components/features/dashboard/dashboard-commander-charts";
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
            <Link href="/orders/new">Buat Perintah Baru</Link>
          </Button>
        }
      />

      <Suspense fallback={null}>
        <DashboardFilterBar />
      </Suspense>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatsCard title="Perintah Aktif" value={data.stats.totalActiveOrders} icon={SendIcon} />
        <StatsCard title="Personil Satuan" value={data.stats.totalSubordinateMembers} icon={UsersIcon} />
        <StatsCard title="Belum Submit" value={data.stats.totalPendingAssignments} icon={ClipboardListIcon} />
        <StatsCard title="Sudah Submit" value={data.stats.totalCompletedAssignments} icon={ClipboardCheckIcon} />
        <StatsCard
          title="Perlu Perhatian"
          value={data.stats.needsAttentionCount}
          description="Perintah aktif progress < 50%"
          icon={AlertTriangleIcon}
          className="border-amber-500/20 hover:border-amber-500/40"
        />
        <StatsCard
          title="Perintah Terfilter"
          value={data.stats.totalFilteredOrders}
          description="Sesuai filter aktif"
          icon={FilterIcon}
        />
      </div>

      <DashboardCommanderCharts charts={data.charts} />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Perintah Terbaru</h2>
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
                        {order.progress.totalSubmitted}/{order.progress.totalAssigned} submit
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
            title="Tidak ada perintah"
            description="Tidak ada data yang cocok dengan filter. Coba ubah periode, status, atau jenis perintah."
          />
        )}
      </section>
    </div>
  );
}
