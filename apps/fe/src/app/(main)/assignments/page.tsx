import { Suspense } from "react";

import { AssignmentsList } from "@/components/features/assignments/assignments-list";
import {
  assignmentStatusLabel,
  orderTypeFilterAliases,
  orderTypeFilterOptions,
} from "@/components/komando/badges";
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
    search: params.search,
    status: params.status,
    orderType: params.orderType,
    submitDate: params.submitDate,
    deadlineDate: params.deadlineDate,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });
  const response = await serverApiFetch<Assignment[]>(`/api/v1/assignments/me${query ? `?${query}` : ""}`);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Tugas"
        title="Tugas Saya"
        description="Daftar tugas yang diterima, deadline pelaksanaan, dan status bukti yang sudah dikirim."
      />

      <FilterBar
        searchKey="search"
        searchPlaceholder="Cari judul atau instruksi..."
        selects={[
          {
            key: "status",
            label: "Status",
            options: Object.entries(assignmentStatusLabel).map(([value, label]) => ({ value, label })),
          },
          {
            key: "orderType",
            label: "Jenis",
            options: [...orderTypeFilterOptions],
            aliases: orderTypeFilterAliases,
          },
        ]}
        dateFilters={[
          { key: "submitDate", label: "Terlaksana" },
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
          <AssignmentsList assignments={response.data} pagination={response.meta?.pagination} />
        </Suspense>
      ) : (
        <PageState title="Tidak ada tugas" description="Tugas yang cocok dengan filter akan tampil di halaman ini." />
      )}

      {params.view === "table" ? null : <ServerPagination meta={response.meta?.pagination} searchParams={params} />}
    </div>
  );
}
