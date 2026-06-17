import { Suspense } from "react";

import { OrderActions } from "@/components/features/orders/order-actions";
import { OrderAssignmentsList } from "@/components/features/orders/order-assignments-list";
import { OrderPostingDetails } from "@/components/features/orders/order-posting-fields";
import { OrderTargetUrlsList } from "@/components/features/orders/order-target-urls-field";
import { CommentSentimentBadge, DeadlineBadge, OrderTypeBadge, StatusBadge } from "@/components/komando/badges";
import { ExpandableText, LabeledExpandableText } from "@/components/komando/expandable-text";
import { ListViewToggle } from "@/components/komando/list-view-toggle";
import { PageHero } from "@/components/komando/page-hero";
import { PageState } from "@/components/komando/page-state";
import { ServerPagination } from "@/components/komando/server-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { buildQueryString } from "@/lib/api/client";
import { serverApiFetch } from "@/lib/api/server";
import type { Assignment, OrderDetail } from "@/lib/api/types";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { orderId } = await params;
  const queryParams = await searchParams;
  const query = buildQueryString({
    page: queryParams.page,
    limit: queryParams.limit ?? 50,
    status: queryParams.status,
  });
  const [orderResponse, assignmentsResponse] = await Promise.all([
    serverApiFetch<OrderDetail>(`/api/v1/orders/${orderId}`),
    serverApiFetch<Assignment[]>(`/api/v1/orders/${orderId}/assignments${query ? `?${query}` : ""}`),
  ]);
  const order = orderResponse.data;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Detail perintah"
        title={order.title}
        description="Instruksi, target, progress anggota, dan bukti pelaksanaan dari perintah ini."
        actions={<OrderActions order={order} />}
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/70 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <CardTitle className="text-base">Instruksi</CardTitle>
            {order.orderType === "komentar" ? (
              <>
                <OrderTypeBadge type="komentar" />
                {order.sentiment ? <CommentSentimentBadge sentiment={order.sentiment} /> : null}
              </>
            ) : null}
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
            <CardTitle className="text-base">Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>{order.progress.totalSubmitted}/{order.progress.totalAssigned} submit</span>
                <span>{order.progress.percentageComplete}%</span>
              </div>
              <Progress value={order.progress.percentageComplete} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Info label="Assigned" value={order.progress.totalAssigned} />
              <Info label="Submit" value={order.progress.totalSubmitted} />
              <Info label="Pending" value={order.progress.totalPending} />
              <Info label="Late" value={order.progress.totalLate} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Target</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {order.targets.map((target) => (
            <div key={target.id} className="rounded-md border bg-muted/20 p-3 text-sm">
              <p className="font-medium">{target.unit?.name ?? target.user?.fullName ?? "Target"}</p>
              <p className="text-muted-foreground text-xs">
                {target.targetType} - {target.resolvedMemberCount} anggota
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Progress Anggota</h2>
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
            />
          </Suspense>
        ) : (
          <PageState title="Belum ada assignment" description="Assignment akan muncul setelah perintah dikirim." />
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
      <p className="text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}
