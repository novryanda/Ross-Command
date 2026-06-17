import { DashboardAdminView } from "@/components/features/dashboard/dashboard-admin";
import { DashboardCommanderView } from "@/components/features/dashboard/dashboard-commander";
import { DashboardMemberView } from "@/components/features/dashboard/dashboard-member";
import { getMe, serverApiFetch } from "@/lib/api/server";
import type { DashboardAdmin, DashboardCommander, DashboardMember } from "@/lib/api/types";

export default async function DashboardPage() {
  const me = await getMe();

  if (me.role === "super_admin") {
    const response = await serverApiFetch<DashboardAdmin>("/api/v1/dashboard/admin");
    return <DashboardAdminView data={response.data} />;
  }

  if (me.isCommander) {
    const response = await serverApiFetch<DashboardCommander>("/api/v1/dashboard/commander");
    return <DashboardCommanderView data={response.data} />;
  }

  const response = await serverApiFetch<DashboardMember>("/api/v1/dashboard/member");
  return <DashboardMemberView data={response.data} />;
}
