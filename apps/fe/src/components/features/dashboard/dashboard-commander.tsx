import { ClipboardCheckIcon, ClipboardListIcon, SendIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

import { DeadlineBadge, OrderTypeBadge, StatusBadge } from "@/components/komando/badges";
import { PageHero } from "@/components/komando/page-hero";
import { PageState } from "@/components/komando/page-state";
import { StatsCard } from "@/components/komando/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DashboardCommander } from "@/lib/api/types";

export function DashboardCommanderView({ data }: { data: DashboardCommander }) {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Komando"
        title="Dashboard Pimpinan"
        description="Pantau perintah aktif, anggota yang belum submit, dan progress pelaksanaan di bawah struktur komando."
        actions={
          <Button asChild size="sm">
            <Link href="/orders/new">Buat Perintah Baru</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Perintah Aktif" value={data.stats.totalActiveOrders} icon={SendIcon} />
        <StatsCard title="Anggota di Bawah" value={data.stats.totalSubordinateMembers} icon={UsersIcon} />
        <StatsCard title="Belum Submit" value={data.stats.totalPendingAssignments} icon={ClipboardListIcon} />
        <StatsCard title="Sudah Submit" value={data.stats.totalCompletedAssignments} icon={ClipboardCheckIcon} />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Perintah Terbaru</h2>
          <Button asChild size="sm" variant="ghost">
            <Link href="/orders">Lihat semua</Link>
          </Button>
        </div>
        {data.activeOrders.length ? (
          <div className="grid gap-3">
            {data.activeOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <Link href={`/orders/${order.id}`} className="font-medium hover:underline">
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
                      <span>{order.progress.totalSubmitted}/{order.progress.totalAssigned} submit</span>
                      <span>{order.progress.percentageComplete}%</span>
                    </div>
                    <Progress value={order.progress.percentageComplete} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <PageState title="Belum ada perintah aktif" description="Buat perintah baru untuk mulai memantau progress anggota." />
        )}
      </section>
    </div>
  );
}
