import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Suspense } from "react";

import { OrdersList } from "@/components/features/orders/orders-list";
import { OrdersSummaryCharts } from "@/components/features/orders/orders-summary-charts";
import {
  orderStatusLabel,
  orderTypeFilterOptions,
} from "@/components/komando/badges";
import { FilterBar } from "@/components/komando/filter-bar";
import { ListViewToggle } from "@/components/komando/list-view-toggle";
import { PageHero } from "@/components/komando/page-hero";
import { PageState } from "@/components/komando/page-state";
import { ServerPagination } from "@/components/komando/server-pagination";
import { Button } from "@/components/ui/button";
import { buildQueryString } from "@/lib/api/client";
import { serverApiFetch } from "@/lib/api/server";
import type { Order, OrdersSummary } from "@/lib/api/types";
import { getOrdersPageMeta, getOrdersPageOrderType, type OrdersPageScope } from "@/lib/order-page-scope";

export async function OrdersPageView({
  scope,
  searchParams,
}: {
  scope: OrdersPageScope;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const fixedOrderType = getOrdersPageOrderType(scope);
  const meta = getOrdersPageMeta(scope);
  const query = buildQueryString({
    page: params.page,
    limit: params.limit ?? 20,
    search: params.search,
    status: params.status,
    orderType: fixedOrderType ?? params.orderType,
    submitDate: params.submitDate,
    deadlineDate: params.deadlineDate,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });
  const summaryQuery = buildQueryString({
    search: params.search,
    status: params.status,
    orderType: fixedOrderType ?? params.orderType,
    submitDate: params.submitDate,
    deadlineDate: params.deadlineDate,
  });

  const [response, summaryResponse] = await Promise.all([
    serverApiFetch<Order[]>(`/api/v1/orders${query ? `?${query}` : ""}`),
    serverApiFetch<OrdersSummary>(`/api/v1/orders/summary${summaryQuery ? `?${summaryQuery}` : ""}`),
  ]);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Manajemen perintah"
        title={meta.title}
        description={meta.description}
        actions={
          <Button asChild size="sm">
            <Link href={meta.createHref}>
              <PlusIcon />
              Buat Perintah
            </Link>
          </Button>
        }
      />

      <OrdersSummaryCharts summary={summaryResponse.data} />

      <FilterBar
        searchKey="search"
        searchPlaceholder="Cari judul atau instruksi..."
        selects={[
          {
            key: "status",
            label: "Status",
            options: Object.entries(orderStatusLabel).map(([value, label]) => ({ value, label })),
          },
          ...(scope === "all"
            ? [{
                key: "orderType",
                label: "Jenis",
                options: [...orderTypeFilterOptions],
              }]
            : []),
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
          <OrdersList orders={response.data} pagination={response.meta?.pagination} />
        </Suspense>
      ) : (
        <PageState title="Belum ada perintah" description="Perintah yang cocok dengan filter akan muncul di sini." />
      )}

      {params.view === "card" ? <ServerPagination meta={response.meta?.pagination} searchParams={params} /> : null}
    </div>
  );
}
