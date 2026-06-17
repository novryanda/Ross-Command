import Link from "next/link";

import { SubmitProofDialog } from "@/components/features/assignments/submit-proof-dialog";
import { OrderTargetUrlsList } from "@/components/features/orders/order-target-urls-field";
import { CommentSentimentBadge, DeadlineBadge, OrderTypeBadge, StatusBadge } from "@/components/komando/badges";
import { PageHero } from "@/components/komando/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { serverApiFetch } from "@/lib/api/server";
import type { Assignment } from "@/lib/api/types";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const response = await serverApiFetch<Assignment>(`/api/v1/assignments/me/${assignmentId}`);
  const assignment = response.data;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Detail perintah saya"
        title={assignment.order.title}
        description="Baca instruksi pelaksanaan, buka target, lalu submit bukti melalui link Drive."
        actions={<SubmitProofDialog assignmentId={assignment.id} />}
      >
        <div className="flex flex-wrap gap-1.5">
          <OrderTypeBadge type={assignment.order.orderType} />
          {assignment.order.orderType === "komentar" && assignment.order.sentiment ? (
            <CommentSentimentBadge sentiment={assignment.order.sentiment} />
          ) : null}
          <StatusBadge status={assignment.status} />
          <DeadlineBadge deadline={assignment.order.deadline} />
        </div>
      </PageHero>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <CardTitle className="text-base">Instruksi</CardTitle>
          {assignment.order.orderType === "komentar" && assignment.order.sentiment ? (
            <CommentSentimentBadge sentiment={assignment.order.sentiment} />
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="whitespace-pre-wrap">{assignment.order.description}</p>
          <OrderTargetUrlsList targets={assignment.order.targetUrls ?? []} />
          {assignment.order.narration ? <p><span className="text-muted-foreground">Narasi: </span>{assignment.order.narration}</p> : null}
          {assignment.order.reportReason ? <p><span className="text-muted-foreground">Alasan report: </span>{assignment.order.reportReason}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bukti Terakhir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {assignment.latestSubmission ? (
            <>
              <p>
                <span className="text-muted-foreground">Link: </span>
                <Link href={assignment.latestSubmission.driveLink} target="_blank" className="text-primary hover:underline">
                  {assignment.latestSubmission.driveLink}
                </Link>
              </p>
              {assignment.latestSubmission.notes ? <p><span className="text-muted-foreground">Catatan: </span>{assignment.latestSubmission.notes}</p> : null}
              <p className="text-muted-foreground text-xs">
                Dikirim: {new Date(assignment.latestSubmission.submittedAt).toLocaleString("id-ID")}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">Belum ada bukti dikirim.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
