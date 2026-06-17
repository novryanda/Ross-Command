import { OrderForm } from "@/components/features/orders/order-form";
import { PageHero } from "@/components/komando/page-hero";
import { serverApiFetch } from "@/lib/api/server";
import type { UnitNode, UserListItem } from "@/lib/api/types";

export default async function NewOrderPage() {
  const [units, members] = await Promise.all([
    serverApiFetch<UnitNode[]>("/api/v1/commander/members/by-unit"),
    serverApiFetch<UserListItem[]>("/api/v1/commander/members?limit=100"),
  ]);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Wizard perintah"
        title="Buat Perintah Baru"
        description="Susun instruksi, pilih target satuan atau individu, lalu simpan sebagai draft atau langsung kirim ke anggota."
      />
      <OrderForm units={units.data} members={members.data} />
    </div>
  );
}
