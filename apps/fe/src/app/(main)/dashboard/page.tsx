import { DashboardAdminView } from "@/components/features/dashboard/dashboard-admin";
import { DashboardCommanderView } from "@/components/features/dashboard/dashboard-commander";
import { DashboardMemberView } from "@/components/features/dashboard/dashboard-member";
import { buildQueryString } from "@/lib/api/client";
import { getMe, serverApiFetch } from "@/lib/api/server";
import type { DashboardAdmin, DashboardCommander, DashboardMember } from "@/lib/api/types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const me = await getMe();
  const params = await searchParams;

  if (me.role === "super_admin") {
    const response = await serverApiFetch<DashboardAdmin>("/api/v1/dashboard/admin");
    return <DashboardAdminView data={response.data} />;
  }

  if (me.isCommander) {
    const query = buildQueryString({
      period: params.period,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      status: params.status,
      orderType: params.orderType,
      deadlineFrom: params.deadlineFrom,
      deadlineTo: params.deadlineTo,
    });
    const response = await serverApiFetch<DashboardCommander>(
      `/api/v1/dashboard/commander${query ? `?${query}` : ""}`,
    );

    return <DashboardCommanderView data={response.data} />;
  }

  const response = await serverApiFetch<DashboardMember>("/api/v1/dashboard/member");
  return <DashboardMemberView data={response.data} />;
}
