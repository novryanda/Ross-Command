import { MembersTable } from "@/components/features/members/members-table";
import { FilterBar } from "@/components/komando/filter-bar";
import { PageHero } from "@/components/komando/page-hero";
import { PageState } from "@/components/komando/page-state";
import { buildQueryString } from "@/lib/api/client";
import { serverApiFetch } from "@/lib/api/server";
import type { UnitNode, UserListItem } from "@/lib/api/types";

function flattenUnits(units: UnitNode[]): UnitNode[] {
  return units.flatMap((unit) => [unit, ...flattenUnits(unit.children ?? [])]);
}

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
  const [members, units] = await Promise.all([
    serverApiFetch<UserListItem[]>(`/api/v1/commander/members${query ? `?${query}` : ""}`),
    serverApiFetch<UnitNode[]>("/api/v1/commander/members/by-unit"),
  ]);
  const unitOptions = flattenUnits(units.data).map((unit) => ({
    value: unit.id,
    label: unit.depthLevel > 0 ? `${"— ".repeat(unit.depthLevel)}${unit.name}` : unit.name,
  }));

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Hierarki komando"
        title="Anggota Saya"
        description="Lihat anggota dalam cakupan komando, akun sosial media, dan posisi satuan."
      />

      <div className="space-y-4">
        <FilterBar
          searchKey="search"
          searchPlaceholder="Cari nama atau username..."
          selects={[
            {
              key: "unitId",
              label: "Satuan",
              options: unitOptions,
            },
          ]}
        />
        {members.data.length ? (
          <MembersTable members={members.data} pagination={members.meta?.pagination} />
        ) : (
          <PageState title="Tidak ada anggota" description="Tidak ada anggota yang cocok dengan filter saat ini." />
        )}
      </div>
    </div>
  );
}
