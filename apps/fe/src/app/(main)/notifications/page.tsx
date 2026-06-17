import { NotificationsView } from "@/components/features/notifications/notifications-view";
import { serverApiFetch } from "@/lib/api/server";
import type { NotificationItem } from "@/lib/api/types";

export default async function NotificationsPage() {
  const response = await serverApiFetch<NotificationItem[]>("/api/v1/notifications?limit=50");

  return (
    <NotificationsView
      notifications={response.data}
      generatedAt={typeof response.meta?.generatedAt === "string" ? response.meta.generatedAt : undefined}
    />
  );
}
