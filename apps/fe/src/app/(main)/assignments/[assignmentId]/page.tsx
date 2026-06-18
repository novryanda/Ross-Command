import Link from "next/link";

import { PostingCompletenessBadge } from "@/components/features/assignments/posting-completeness-badge";
import { PostingProofDialog } from "@/components/features/assignments/posting-proof-dialog";
import { SubmitProofDialog } from "@/components/features/assignments/submit-proof-dialog";
import { OrderPostingDetails } from "@/components/features/orders/order-posting-fields";
import { OrderTargetUrlsList } from "@/components/features/orders/order-target-urls-field";
import { BackButton } from "@/components/komando/back-button";
import { CommentSentimentBadge, DeadlineBadge, OrderTypeBadge, StatusBadge } from "@/components/komando/badges";
import { ExpandableText, LabeledExpandableText } from "@/components/komando/expandable-text";
import { PageHero } from "@/components/komando/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <BackButton href="/assignments" />

      <PageHero
        eyebrow="Detail perintah saya"
        title={assignment.order.title}
        description={
          assignment.order.orderType === "posting"
            ? "Baca instruksi pelaksanaan, unggah posting ke sosmed target, lalu submit link tiap platform."
            : "Baca instruksi pelaksanaan, buka target, lalu submit bukti melalui link Drive."
        }
        actions={
          <SubmitProofDialog
            assignmentId={assignment.id}
            orderType={assignment.order.orderType}
            postingTargetPlatforms={assignment.order.postingTargetPlatforms}
          />
        }
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
          {assignment.order.orderType === "komentar" ? (
            <>
              <OrderTypeBadge type="komentar" />
              {assignment.order.sentiment ? (
                <CommentSentimentBadge sentiment={assignment.order.sentiment} />
              ) : null}
            </>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {assignment.order.orderType === "posting" ? (
            <OrderPostingDetails
              postingSourceUrl={assignment.order.postingSourceUrl}
              postingTargetPlatforms={assignment.order.postingTargetPlatforms}
              deskripsi={assignment.order.description}
              instruksi={assignment.order.narration}
            />
          ) : (
            <>
              <ExpandableText lines={4}>{assignment.order.description}</ExpandableText>
              <OrderTargetUrlsList targets={assignment.order.targetUrls ?? []} />
              {assignment.order.narration ? (
                <LabeledExpandableText label="Narasi" lines={3}>
                  {assignment.order.narration}
                </LabeledExpandableText>
              ) : null}
            </>
          )}
          {assignment.order.reportReason ? (
            <LabeledExpandableText label="Alasan report" lines={3}>
              {assignment.order.reportReason}
            </LabeledExpandableText>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bukti Terakhir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {assignment.latestSubmission ? (
            <>
              {assignment.order.orderType === "posting" ? (
                <div className="space-y-3">
                  {assignment.latestSubmission.postingCompleteness ? (
                    <PostingCompletenessBadge
                      completeness={assignment.latestSubmission.postingCompleteness}
                      missingPlatforms={assignment.latestSubmission.missingPlatforms}
                    />
                  ) : null}
                  <PostingProofDialog
                    submission={assignment.latestSubmission}
                    targetPlatforms={assignment.order.postingTargetPlatforms ?? []}
                    trigger={
                      <Button size="sm" variant="outline">
                        Lihat Bukti Posting
                      </Button>
                    }
                  />
                </div>
              ) : assignment.latestSubmission.driveLink ? (
                <p>
                  <span className="text-muted-foreground">Link: </span>
                  <Link href={assignment.latestSubmission.driveLink} target="_blank" className="text-primary hover:underline">
                    {assignment.latestSubmission.driveLink}
                  </Link>
                </p>
              ) : null}
              {assignment.latestSubmission.notes ? (
                <p>
                  <span className="text-muted-foreground">Catatan: </span>
                  {assignment.latestSubmission.notes}
                </p>
              ) : null}
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
