import { UnitAdminManager } from "@/components/features/admin/unit-admin-manager";
import { PageHero } from "@/components/komando/page-hero";
import { PageState } from "@/components/komando/page-state";
import { serverApiFetch } from "@/lib/api/server";
import type { UnitNode, UserListItem } from "@/lib/api/types";

export default async function AdminUnitsPage() {
  const [units, users] = await Promise.all([
    serverApiFetch<UnitNode[]>("/api/v1/units"),
    serverApiFetch<UserListItem[]>("/api/v1/users?limit=100"),
  ]);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Admin"
        title="Manajemen Organisasi"
        description="Kelola tree satuan, struktur parent-child, pimpinan satuan, serta pemindahan anggota antar satuan."
      />
      {units.data.length ? (
        <UnitAdminManager units={units.data} users={users.data} />
      ) : (
        <div className="space-y-4">
          <UnitAdminManager units={[]} users={users.data} />
          <PageState title="Belum ada satuan" description="Tambahkan satuan root untuk memulai struktur organisasi." />
        </div>
      )}
    </div>
  );
}
