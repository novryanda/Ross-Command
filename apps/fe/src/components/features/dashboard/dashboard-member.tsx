import { ClipboardListIcon, Share2Icon } from "lucide-react";
import Link from "next/link";

import { DeadlineBadge, OrderTypeBadge, StatusBadge } from "@/components/komando/badges";
import { PageHero } from "@/components/komando/page-hero";
import { PageState } from "@/components/komando/page-state";
import { StatsCard } from "@/components/komando/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardMember } from "@/lib/api/types";

export function DashboardMemberView({ data }: { data: DashboardMember }) {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Anggota"
        title="Dashboard Anggota"
        description="Perintah yang perlu dikerjakan, status deadline, dan kesiapan akun sosial media kamu."
        actions={
          <Button asChild size="sm">
            <Link href="/assignments">Lihat Perintah Saya</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard title="Belum Dikerjakan" value={data.stats.pendingAssignments} icon={ClipboardListIcon} />
        <StatsCard title="Akun Sosmed" value={data.stats.socialAccountCount} icon={Share2Icon} />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Perintah Terbaru</h2>
          <Button asChild size="sm" variant="ghost">
            <Link href="/assignments">Lihat semua</Link>
          </Button>
        </div>
        {data.recentAssignments.length ? (
          <div className="grid gap-3">
            {data.recentAssignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0 space-y-1">
                    <Link href={`/assignments/${assignment.id}`} className="font-medium hover:underline">
                      {assignment.order.title}
                    </Link>
                    <div className="flex flex-wrap gap-1.5">
                      <OrderTypeBadge type={assignment.order.orderType} />
                      <StatusBadge status={assignment.status} />
                      <DeadlineBadge deadline={assignment.deadline ?? assignment.order.deadline} />
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/assignments/${assignment.id}`}>Buka</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <PageState title="Tidak ada perintah aktif" description="Semua perintah yang tersedia akan muncul di sini." />
        )}
      </section>
    </div>
  );
}
