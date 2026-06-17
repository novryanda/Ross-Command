import { Suspense } from "react";

import { AssignmentsList } from "@/components/features/assignments/assignments-list";
import { assignmentStatusLabel, orderTypeLabel } from "@/components/komando/badges";
import { FilterBar } from "@/components/komando/filter-bar";
import { ListViewToggle } from "@/components/komando/list-view-toggle";
import { PageHero } from "@/components/komando/page-hero";
import { PageState } from "@/components/komando/page-state";
import { ServerPagination } from "@/components/komando/server-pagination";
import { buildQueryString } from "@/lib/api/client";
import { serverApiFetch } from "@/lib/api/server";
import type { Assignment } from "@/lib/api/types";

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = buildQueryString({
    page: params.page,
    limit: params.limit ?? 20,
    status: params.status,
    orderType: params.orderType,
  });
  const response = await serverApiFetch<Assignment[]>(`/api/v1/assignments/me${query ? `?${query}` : ""}`);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Tugas"
        title="Perintah Saya"
        description="Daftar perintah yang diterima, deadline pelaksanaan, dan status bukti yang sudah dikirim."
      />

      <FilterBar
        selects={[
          {
            key: "status",
            label: "Status",
            options: Object.entries(assignmentStatusLabel).map(([value, label]) => ({ value, label })),
          },
          {
            key: "orderType",
            label: "Jenis",
            options: Object.entries(orderTypeLabel).map(([value, label]) => ({ value, label })),
          },
        ]}
      />

      <div className="flex justify-end">
        <Suspense fallback={null}>
          <ListViewToggle />
        </Suspense>
      </div>

      {response.data.length ? (
        <Suspense fallback={null}>
          <AssignmentsList assignments={response.data} />
        </Suspense>
      ) : (
        <PageState title="Tidak ada perintah" description="Perintah dari komandan akan tampil di halaman ini." />
      )}

      <ServerPagination meta={response.meta?.pagination} searchParams={params} />
    </div>
  );
}
