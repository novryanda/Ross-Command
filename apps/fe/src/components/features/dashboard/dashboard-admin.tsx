import { Building2Icon, LockIcon, Share2Icon, UsersIcon, ClipboardListIcon } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/komando/page-hero";
import { StatsCard } from "@/components/komando/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardAdmin } from "@/lib/api/types";

export function DashboardAdminView({ data }: { data: DashboardAdmin }) {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Super admin"
        title="Dashboard Admin"
        description="Ringkasan sistem, struktur organisasi, akun user, dan sinyal yang perlu ditindaklanjuti."
        actions={
          <>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/units">Organisasi</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/users">User</Link>
          </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatsCard title="Total User" value={data.stats.totalUsers} icon={UsersIcon} />
        <StatsCard title="Total Satuan" value={data.stats.totalUnits} icon={Building2Icon} />
        <StatsCard title="Total Tugas" value={data.stats.totalOrders} icon={ClipboardListIcon} />
        <StatsCard title="Akun Sosmed" value={data.stats.totalSocialAccounts} icon={Share2Icon} />
        <StatsCard title="Akun Dikunci" value={data.stats.lockedUsers} icon={LockIcon} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prioritas Admin</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Button asChild variant="outline" className="justify-start">
            <Link href="/admin/units">Kelola struktur organisasi</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/admin/users">Kelola akun user dan reset password</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
