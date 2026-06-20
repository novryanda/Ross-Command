import { OrderForm } from "@/components/features/orders/order-form";
import { PageHero } from "@/components/komando/page-hero";
import { getMe, serverApiFetch } from "@/lib/api/server";
import type { UnitNode } from "@/lib/api/types";

export default async function NewOrderPage() {
  const [units, me] = await Promise.all([
    serverApiFetch<UnitNode[]>("/api/v1/commander/members/by-unit"),
    getMe(),
  ]);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Wizard perintah"
        title="Buat Perintah Baru"
        description="Susun instruksi, pilih target satuan, lalu tentukan apakah perintah dikirim ke seluruh anggota atau cukup ke pimpinan satuan."
      />
      <OrderForm units={units.data} currentUserId={me.id} />
    </div>
  );
}
