import { UserCreateForm } from "@/components/features/admin/user-create-form";
import { BackButton } from "@/components/komando/back-button";
import { PageHero } from "@/components/komando/page-hero";
import { serverApiFetch } from "@/lib/api/server";
import type { UnitNode } from "@/lib/api/types";

export default async function AdminUserCreatePage() {
  const units = await serverApiFetch<UnitNode[]>("/api/v1/units");

  return (
    <div className="space-y-6">
      <BackButton href="/admin/users" />
      <PageHero
        eyebrow="Admin"
        title="Tambah User"
        description="Lengkapi identitas, role, dan satuan aktif untuk membuat akun baru."
      />
      <UserCreateForm units={units.data} />
    </div>
  );
}
