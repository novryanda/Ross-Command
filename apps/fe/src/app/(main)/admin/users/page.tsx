import { UserAdminManager } from "@/components/features/admin/user-admin-manager";
import { FilterBar } from "@/components/komando/filter-bar";
import { PageHero } from "@/components/komando/page-hero";
import { PageState } from "@/components/komando/page-state";
import { ServerPagination } from "@/components/komando/server-pagination";
import { buildQueryString } from "@/lib/api/client";
import { serverApiFetch } from "@/lib/api/server";
import type { UnitNode, UserListItem } from "@/lib/api/types";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = buildQueryString({
    page: params.page,
    limit: params.limit ?? 20,
    search: params.search,
    role: params.role,
    unitId: params.unitId,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });
  const [users, units] = await Promise.all([
    serverApiFetch<UserListItem[]>(`/api/v1/users${query ? `?${query}` : ""}`),
    serverApiFetch<UnitNode[]>("/api/v1/units"),
  ]);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Admin"
        title="Manajemen User"
        description="Kelola akun, role, satuan aktif, reset password, unlock akun, dan status akses pengguna."
      />
      <FilterBar
        searchKey="search"
        searchPlaceholder="Cari nama, username, atau NIP..."
        selects={[
          {
            key: "role",
            label: "Role",
            options: [
              { value: "member", label: "Member" },
              { value: "super_admin", label: "Super Admin" },
            ],
          },
        ]}
      />
      {users.data.length ? <UserAdminManager users={users.data} units={units.data} /> : <PageState title="Tidak ada user" />}
      <ServerPagination meta={users.meta?.pagination} searchParams={params} />
    </div>
  );
}
