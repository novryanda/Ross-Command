import { MembersTable } from "@/components/features/members/members-table";
import { FilterBar } from "@/components/komando/filter-bar";
import { PageHero } from "@/components/komando/page-hero";
import { PageState } from "@/components/komando/page-state";
import { ServerPagination } from "@/components/komando/server-pagination";
import { buildQueryString } from "@/lib/api/client";
import { serverApiFetch } from "@/lib/api/server";
import type { UserListItem } from "@/lib/api/types";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = buildQueryString({
    page: params.page,
    limit: params.limit ?? 20,
    search: params.search,
    unitId: params.unitId,
  });
  const members = await serverApiFetch<UserListItem[]>(`/api/v1/commander/members${query ? `?${query}` : ""}`);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Hierarki komando"
        title="Anggota Saya"
        description="Lihat anggota dalam cakupan komando, akun sosial media, dan posisi satuan."
      />

      <div className="space-y-4">
        <FilterBar searchKey="search" searchPlaceholder="Cari nama atau username..." />
        {members.data.length ? (
          <MembersTable members={members.data} />
        ) : (
          <PageState title="Tidak ada anggota" description="Tidak ada anggota yang cocok dengan filter saat ini." />
        )}
        <ServerPagination meta={members.meta?.pagination} searchParams={params} />
      </div>
    </div>
  );
}
