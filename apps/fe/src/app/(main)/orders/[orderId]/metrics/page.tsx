import { notFound } from "next/navigation";

import { BlastingMetricsDashboardLoader } from "@/components/features/orders/blasting-metrics-dashboard-loader";import { BackButton } from "@/components/komando/back-button";
import { DeadlineBadge, OrderTypeBadge, StatusBadge } from "@/components/komando/badges";
import { PageHero } from "@/components/komando/page-hero";
import { ApiRequestError, type BlastingMetricsDashboard, type OrderDetail } from "@/lib/api/types";
import { serverApiFetch } from "@/lib/api/server";

export default async function OrderMetricsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  let orderResponse;
  let metricsResponse;

  try {
    [orderResponse, metricsResponse] = await Promise.all([
      serverApiFetch<OrderDetail>(`/api/v1/orders/${orderId}`),
      serverApiFetch<BlastingMetricsDashboard>(`/api/v1/orders/${orderId}/metrics-dashboard`),
    ]);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const order = orderResponse.data;

  return (
    <div className="space-y-6">
      <BackButton href={`/orders/${orderId}`} label="Kembali ke detail tugas" />

      <PageHero
        eyebrow="Dashboard metrik"
        title={`Perbandingan Metrik — ${order.title}`}
        description="Visualisasi metrik Apify saat tugas dibuat versus setelah deadline berakhir."
      >
        <div className="flex flex-wrap gap-1.5">
          <OrderTypeBadge type={order.orderType} />
          <StatusBadge status={order.status} />
          <DeadlineBadge deadline={order.deadline} />
        </div>
      </PageHero>

      <BlastingMetricsDashboardLoader initialData={metricsResponse.data} orderId={orderId} />
    </div>
  );
}
