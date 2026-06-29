import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderActions } from "@/components/features/orders/order-actions";
import { OrderAssignmentsList } from "@/components/features/orders/order-assignments-list";
import { isBlastingOrderType } from "@/lib/order-utils";
import { OrderPostingDetails } from "@/components/features/orders/order-posting-fields";
import { OrderTargetUrlsList } from "@/components/features/orders/order-target-urls-field";
import { BackButton } from "@/components/komando/back-button";
import { DeadlineBadge, OrderTypeBadge, StatusBadge } from "@/components/komando/badges";
import { ExpandableText, LabeledExpandableText } from "@/components/komando/expandable-text";
import { ListViewToggle } from "@/components/komando/list-view-toggle";
import { PageHero } from "@/components/komando/page-hero";
import { PageState } from "@/components/komando/page-state";
import { ServerPagination } from "@/components/komando/server-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToneProgressBar } from "@/components/komando/tone-progress-bar";
import { buildQueryString } from "@/lib/api/client";
import { ApiRequestError } from "@/lib/api/types";
import { serverApiFetch } from "@/lib/api/server";
import type { Assignment, OrderDetail } from "@/lib/api/types";
import { OrdersPageView } from "@/components/features/orders/orders-page-view";
import { type OrdersPageScope } from "@/lib/order-page-scope";

const ORDER_LIST_SCOPE_BY_SEGMENT: Partial<Record<string, OrdersPageScope>> = {
  blasting: "blasting",
  counter: "counter",
  report: "report",
  posting: "posting",
};

function isOrderUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { orderId } = await params;

  const listScope = ORDER_LIST_SCOPE_BY_SEGMENT[orderId];
  if (listScope) {
    return <OrdersPageView scope={listScope} searchParams={searchParams} />;
  }

  if (!isOrderUuid(orderId)) {
    notFound();
  }

  const queryParams = await searchParams;
  const query = buildQueryString({
    page: queryParams.page,
    limit: queryParams.limit ?? 50,
    status: queryParams.status,
  });
  let orderResponse;
  let assignmentsResponse;

  try {
    [orderResponse, assignmentsResponse] = await Promise.all([
      serverApiFetch<OrderDetail>(`/api/v1/orders/${orderId}`),
      serverApiFetch<Assignment[]>(`/api/v1/orders/${orderId}/assignments${query ? `?${query}` : ""}`),
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
      <BackButton href="/orders" />

      <PageHero
        eyebrow="Detail tugas"
        title={order.title}
        actions={<OrderActions order={order} />}
      >
        <div className="flex flex-wrap gap-1.5">
          <OrderTypeBadge type={order.orderType} />
          <StatusBadge status={order.status} />
          <DeadlineBadge deadline={order.deadline} />
        </div>
      </PageHero>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/70 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <CardTitle className="text-base">Instruksi</CardTitle>
            {order.orderType === "counter" ? <OrderTypeBadge type="counter" /> : null}
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {order.orderType === "posting" ? (
              <OrderPostingDetails
                postingSourceUrl={order.postingSourceUrl}
                postingTargetPlatforms={order.postingTargetPlatforms}
                deskripsi={order.description}
                instruksi={order.narration}
              />
            ) : (
              <>
                <ExpandableText lines={4}>{order.description}</ExpandableText>
                <OrderTargetUrlsList targets={order.targetUrls ?? []} />
                {order.narration ? (
                  <LabeledExpandableText label="Narasi" lines={3}>
                    {order.narration}
                  </LabeledExpandableText>
                ) : null}
              </>
            )}
            {order.reportReason ? (
              <LabeledExpandableText label="Alasan report" lines={3}>
                {order.reportReason}
              </LabeledExpandableText>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Progres</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>
                  {order.progress.totalSubmitted}/{order.progress.totalAssigned} melaksanakan
                </span>
                <span>{order.progress.percentageComplete}%</span>
              </div>
              <ToneProgressBar value={order.progress.percentageComplete} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Info label="Ditugaskan" value={order.progress.totalAssigned} />
              <Info label="Sudah Melaksanakan" value={order.progress.totalSubmitted} />
              <Info label="Belum Melaksanakan" value={order.progress.totalPending} />
              <Info label="Terlambat" value={order.progress.totalLate} />
            </div>
            {isBlastingOrderType(order.orderType) ? (
              <Button asChild className="w-full">
                <Link href={`/orders/${order.id}/metrics`}>Monitoring Detail</Link>
              </Button>
            ) : null}
            <div className="grid gap-2 sm:grid-cols-2">
              <Button asChild variant="outline" className="w-full">
                <Link href={`/orders/${order.id}/monitoring?tab=perorangan`}>Pantau Perorangan</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/orders/${order.id}/monitoring?tab=persatuan`}>Pantau Persatuan</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Penugasan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {order.targets.map((target) => (
            <div key={target.id} className="rounded-md border bg-muted/20 p-3 text-sm">
              <p className="font-medium">{target.unit?.name ?? target.user?.fullName ?? "Target"}</p>
              <p className="text-muted-foreground text-xs">
                {describeTargetAudience(target.targetAudience, target.resolvedMemberCount)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold"></h2>
          <Suspense fallback={null}>
            <ListViewToggle defaultView="card" />
          </Suspense>
        </div>
        {assignmentsResponse.data.length ? (
          <Suspense fallback={null}>
            <OrderAssignmentsList
              assignments={assignmentsResponse.data}
              orderType={order.orderType}
              postingTargetPlatforms={order.postingTargetPlatforms ?? []}
              targetUrls={order.targetUrls}
              orderId={order.id}
            />
          </Suspense>
        ) : (
          <PageState title="Belum ada assignment" description="Assignment akan muncul setelah tugas dikirim." />
        )}
        <ServerPagination meta={assignmentsResponse.meta?.pagination} searchParams={queryParams} />
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-background/70 p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-sm font-semibold tabular-nums">{value.toLocaleString("id-ID")}</p>
    </div>
  );
}

function describeTargetAudience(
  targetAudience: OrderDetail["targets"][number]["targetAudience"],
  count: number,
) {
  if (targetAudience === "unit_leaders") {
    return `${count} pimpinan satuan (order lama)`;
  }

  if (targetAudience === "direct_user") {
    return `Target individu - ${count} anggota`;
  }

  return `${count} anggota`;
}