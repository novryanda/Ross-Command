import { OrderForm } from "@/components/features/orders/order-form";
import { PageHero } from "@/components/komando/page-hero";
import { getMe, serverApiFetch } from "@/lib/api/server";
import type { OrderType, UnitNode } from "@/lib/api/types";

function resolveInitialOrderType(value?: string): OrderType {
  if (value === "blasting") return "blasting";
  if (value === "counter") return "counter";
  if (value === "report_akun" || value === "report") return "report_akun";
  return "posting";
}

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [units, me] = await Promise.all([
    serverApiFetch<UnitNode[]>("/api/v1/commander/members/by-unit"),
    getMe(),
  ]);
  const initialOrderType = resolveInitialOrderType(
    typeof params.type === "string" ? params.type : undefined,
  );

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Wizard perintah"
        title="Buat Perintah Baru"
        description="Susun instruksi, pilih target satuan, lalu tentukan apakah perintah dikirim ke seluruh anggota atau cukup ke pimpinan satuan."
      />
      <OrderForm units={units.data} currentUserId={me.id} initialOrderType={initialOrderType} />
    </div>
  );
}
