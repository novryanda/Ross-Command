import Link from "next/link";

import { BackButton } from "@/components/komando/back-button";
import { DeadlineBadge, OrderTypeBadge, PlatformBadge, StatusBadge } from "@/components/komando/badges";
import { PageHero } from "@/components/komando/page-hero";
import { PageState } from "@/components/komando/page-state";
import { ServerPagination } from "@/components/komando/server-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildQueryString } from "@/lib/api/client";
import { serverApiFetch } from "@/lib/api/server";
import type { CommanderMemberDetail } from "@/lib/api/types";

export default async function MemberDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { userId } = await params;
  const queryParams = await searchParams;
  const query = buildQueryString({
    page: queryParams.page,
    limit: queryParams.limit ?? 20,
    status: queryParams.status,
    orderType: queryParams.orderType,
  });
  const response = await serverApiFetch<CommanderMemberDetail>(
    `/api/v1/commander/members/${userId}${query ? `?${query}` : ""}`,
  );
  const detail = response.data;

  return (
    <div className="space-y-6">
      <BackButton href="/members" />

      <PageHero
        eyebrow="Profil anggota"
        title={detail.user.fullName}
        description={`@${detail.user.username} - ${detail.user.unit?.name ?? "Tanpa satuan"}`}
      >
        <div className="grid gap-3 sm:grid-cols-4">
          <Summary label="Total" value={detail.assignmentSummary.total} />
          <Summary label="Selesai" value={detail.assignmentSummary.totalDone} />
          <Summary label="Terlambat" value={detail.assignmentSummary.totalLate} />
          <Summary label="Pending" value={detail.assignmentSummary.totalPending} />
        </div>
      </PageHero>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Akun Sosmed</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {detail.socialAccounts.length ? (
            detail.socialAccounts.map((account) => (
              <div key={account.id} className="rounded-md border bg-muted/20 p-3">
                <PlatformBadge platform={account.platform} />
                <p className="mt-1 text-sm font-medium">{account.username}</p>
                {account.profileUrl ? (
                  <Link href={account.profileUrl} target="_blank" className="text-primary break-all text-xs hover:underline">
                    {account.profileUrl}
                  </Link>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">Belum ada akun sosmed.</p>
          )}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Riwayat Perintah</h2>
        {detail.assignments.length ? (
          <div className="grid gap-3">
            {detail.assignments.map((assignment) => (
              <Card key={assignment.id} className="border-border/70 shadow-sm transition-colors hover:border-primary/35">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="space-y-1">
                    <p className="font-medium">{assignment.order.title}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <OrderTypeBadge type={assignment.order.orderType} />
                      <StatusBadge status={assignment.status} />
                      <DeadlineBadge deadline={assignment.order.deadline} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <PageState title="Belum ada riwayat" />
        )}
        <ServerPagination meta={response.meta?.pagination} searchParams={queryParams} />
      </section>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-background/70 p-3 text-center">
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}
