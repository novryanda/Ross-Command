import { CalendarIcon, Share2Icon, UserIcon } from "lucide-react";

import { PageHero } from "@/components/komando/page-hero";
import { StatsCard } from "@/components/komando/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import { getMe } from "@/lib/api/server";
import {
  getEmploymentTypeLabel,
  getIdentityNumberLabel,
  getRankOrGradeLabel,
} from "@/lib/user-identity";

export default async function ProfilePage() {
  const me = await getMe();

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Akun"
        title="Profil Saya"
        description="Informasi identitas, satuan aktif, dan status komando yang terbaca dari sesi saat ini."
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <h2 className="text-xl font-semibold">{me.fullName}</h2>
            <p className="text-muted-foreground text-sm">@{me.username}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Info label="Role" value={me.role} />
            <Info label="Jenis" value={getEmploymentTypeLabel(me.employmentType)} />
            <Info label={getIdentityNumberLabel(me.employmentType)} value={me.identityNumber ?? "-"} />
            <Info label={getRankOrGradeLabel(me.employmentType)} value={(me.employmentType === "tni" ? me.rank : me.grade) ?? "-"} />
            <Info label="Satuan" value={me.unit?.name ?? "Tanpa satuan"} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Pimpinan" value={me.isCommander ? "Ya" : "Tidak"} icon={UserIcon} />
        <StatsCard title="Akun Sosmed" value={me.socialAccountCount} icon={Share2Icon} />
        <StatsCard
          title="Bergabung"
          value={new Date(me.createdAt).toLocaleDateString("id-ID")}
          icon={CalendarIcon}
        />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
