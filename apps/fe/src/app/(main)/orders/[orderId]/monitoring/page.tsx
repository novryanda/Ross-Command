import { notFound } from "next/navigation";

import Link from "next/link";

import { OrderProgressMonitoringView } from "@/components/features/orders/order-progress-monitoring-view";
import { BackButton } from "@/components/komando/back-button";
import { CommentSentimentBadge, DeadlineBadge, OrderTypeBadge, StatusBadge } from "@/components/komando/badges";
import { PageHero } from "@/components/komando/page-hero";
import { Button } from "@/components/ui/button";
import { ApiRequestError, type OrderDetail, type OrderProgressByUnit } from "@/lib/api/types";
import { serverApiFetch } from "@/lib/api/server";

export default async function OrderMonitoringPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { orderId } = await params;
  const queryParams = await searchParams;
  const tabValue = typeof queryParams.tab === "string" ? queryParams.tab : undefined;
  const unitValue = typeof queryParams.unit === "string" ? queryParams.unit : undefined;
  const defaultTab = tabValue === "persatuan" ? "persatuan" : "perorangan";

  let orderResponse;
  let monitoringResponse;

  try {
    [orderResponse, monitoringResponse] = await Promise.all([
      serverApiFetch<OrderDetail>(`/api/v1/orders/${orderId}`),
      serverApiFetch<OrderProgressByUnit>(`/api/v1/orders/${orderId}/assignments/by-unit`),
    ]);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const order = orderResponse.data;
  const monitoring = monitoringResponse.data;
  const showBulkSubmit = monitoring.units.some((item) =>
    item.members.some((member) => member.canSubmitForMember),
  );

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <BackButton href={`/orders/${orderId}`} label="Kembali ke detail perintah" />

      <PageHero
        eyebrow="Monitoring perintah"
        title={`Monitoring - ${order.title}`}
        description="Pantau progres keseluruhan, perorangan, dan persatuan dalam tampilan penuh yang lebih nyaman."
        actions={
          showBulkSubmit && order.orderType === "posting" ? (
            <Button asChild>
              <Link href={`/orders/${orderId}/monitoring/bulk-submit`}>Bulk Submit</Link>
            </Button>
          ) : null
        }
      >
        <div className="flex flex-wrap gap-1.5">
          <OrderTypeBadge type={order.orderType} />
          {order.orderType === "komentar" && order.sentiment ? (
            <CommentSentimentBadge sentiment={order.sentiment} />
          ) : null}
          <StatusBadge status={order.status} />
          <DeadlineBadge deadline={order.deadline} />
        </div>
      </PageHero>

      <OrderProgressMonitoringView
        monitoring={monitoring}
        defaultTab={defaultTab}
        initialUnitId={unitValue}
        orderId={orderId}
        orderType={order.orderType}
        showBulkSubmit={showBulkSubmit}
      />
    </div>
  );
}
