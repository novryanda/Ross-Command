import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Suspense } from "react";

import { OrdersList } from "@/components/features/orders/orders-list";
import { orderStatusLabel, orderTypeLabel, sentimentLabel } from "@/components/komando/badges";
import { FilterBar } from "@/components/komando/filter-bar";
import { ListViewToggle } from "@/components/komando/list-view-toggle";
import { PageHero } from "@/components/komando/page-hero";
import { PageState } from "@/components/komando/page-state";
import { ServerPagination } from "@/components/komando/server-pagination";
import { Button } from "@/components/ui/button";
import { buildQueryString } from "@/lib/api/client";
import { serverApiFetch } from "@/lib/api/server";
import type { Order } from "@/lib/api/types";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = buildQueryString({
    page: params.page,
    limit: params.limit ?? 20,
    search: params.search,
    status: params.status,
    orderType: params.orderType,
    sentiment: params.orderType === "komentar" ? params.sentiment : undefined,
    submitDate: params.submitDate,
    deadlineDate: params.deadlineDate,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });
  const response = await serverApiFetch<Order[]>(`/api/v1/orders${query ? `?${query}` : ""}`);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Manajemen perintah"
        title="Perintah yang Dibuat"
        description="Kelola draft, perintah aktif, progress submit anggota, dan export pelaksanaan dari satu tempat."
        actions={
          <Button asChild size="sm">
            <Link href="/orders/new">
              <PlusIcon />
              Buat Perintah
            </Link>
          </Button>
        }
      />

      <FilterBar
        searchKey="search"
        searchPlaceholder="Cari judul atau instruksi..."
        selects={[
          {
            key: "status",
            label: "Status",
            options: Object.entries(orderStatusLabel).map(([value, label]) => ({ value, label })),
          },
          {
            key: "orderType",
            label: "Jenis",
            options: Object.entries(orderTypeLabel).map(([value, label]) => ({ value, label })),
          },
          {
            key: "sentiment",
            label: "Komentar",
            options: Object.entries(sentimentLabel).map(([value, label]) => ({ value, label })),
            visibleWhen: { key: "orderType", equals: "komentar" },
          },
        ]}
        dateFilters={[
          { key: "submitDate", label: "Submit" },
          { key: "deadlineDate", label: "Deadline" },
        ]}
      />

      <div className="flex justify-end">
        <Suspense fallback={null}>
          <ListViewToggle />
        </Suspense>
      </div>

      {response.data.length ? (
        <Suspense fallback={null}>
          <OrdersList orders={response.data} />
        </Suspense>
      ) : (
        <PageState title="Belum ada perintah" description="Perintah yang cocok dengan filter akan muncul di sini." />
      )}

      <ServerPagination meta={response.meta?.pagination} searchParams={params} />
    </div>
  );
}
