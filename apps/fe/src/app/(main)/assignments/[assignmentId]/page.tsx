import Link from "next/link";

import { PostingCompletenessBadge } from "@/components/features/assignments/posting-completeness-badge";
import { PostingProofDialog } from "@/components/features/assignments/posting-proof-dialog";
import { RepresentativePostingProofDialog } from "@/components/features/assignments/representative-posting-proof-dialog";
import { SubmitProofDialog } from "@/components/features/assignments/submit-proof-dialog";
import { BlastingMetricsInlineForm } from "@/components/features/orders/blasting-metrics-inline-form";
import { TargetMetricTotalsSection } from "@/components/features/orders/target-metric-section";
import { OrderPostingDetails } from "@/components/features/orders/order-posting-fields";
import { OrderTargetUrlsList } from "@/components/features/orders/order-target-urls-field";
import { BackButton } from "@/components/komando/back-button";
import { DeadlineBadge, OrderTypeBadge, StatusBadge, submissionInputLabel } from "@/components/komando/badges";
import { ExpandableText, LabeledExpandableText } from "@/components/komando/expandable-text";
import { PageHero } from "@/components/komando/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { serverApiFetch } from "@/lib/api/server";
import type { Assignment } from "@/lib/api/types";
import { toTargetMetricTotals } from "@/lib/blasting-metrics";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const response = await serverApiFetch<Assignment>(`/api/v1/assignments/me/${assignmentId}`);
  const assignment = response.data;
  const isBlasting = assignment.order.orderType === "engagement" || assignment.order.orderType === "blasting";

  return (
    <div className="space-y-6">
      <BackButton href="/assignments" />

      <PageHero
        eyebrow="Detail tugas saya"
        title={assignment.order.title}
        description={
          assignment.order.orderType === "posting"
            ? "Baca instruksi pelaksanaan, unggah posting ke sosmed target, lalu kirim link tiap platform."
            : isBlasting
              ? "Baca instruksi pelaksanaan, buka target, lalu input metrik blasting."
              : "Baca instruksi pelaksanaan, buka target, lalu kirim bukti melalui link Drive."
        }
        actions={
          isBlasting ? null : assignment.order.orderType === "posting" && assignment.canSubmitForMember ? (
            <RepresentativePostingProofDialog
              orderId={assignment.order.id}
              postingTargetPlatforms={assignment.order.postingTargetPlatforms}
              trigger={<Button size="sm">Kirim Bukti</Button>}
            />
          ) : (
            <SubmitProofDialog
              assignmentId={assignment.id}
              orderType={assignment.order.orderType}
              postingTargetPlatforms={assignment.order.postingTargetPlatforms}
              initialSubmission={assignment.latestSubmission}
              title={assignment.latestSubmission ? "Edit Bukti Pelaksanaan" : "Kirim Bukti Pelaksanaan"}
              trigger={
                <Button size="sm">
                  {assignment.latestSubmission ? "Edit Bukti" : "Kirim Bukti"}
                </Button>
              }
            />
          )
        }
      >
        <div className="flex flex-wrap gap-1.5">
          <OrderTypeBadge type={assignment.order.orderType} />
          <StatusBadge status={assignment.status} />
          <DeadlineBadge deadline={assignment.order.deadline} />
        </div>
      </PageHero>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <CardTitle className="text-base">Instruksi</CardTitle>
          {assignment.order.orderType === "counter" ? <OrderTypeBadge type="counter" /> : null}
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

      {isBlasting ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {assignment.latestSubmission ? "Edit Metrik Blasting" : "Input Metrik Blasting"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BlastingMetricsInlineForm
              assignment={assignment}
              targetUrls={assignment.order.targetUrls ?? []}
              submitUrl={`/api/v1/assignments/me/${assignment.id}/submit`}
            />
          </CardContent>
        </Card>
      ) : null}

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
              ) : isBlasting && assignment.latestSubmission.targetMetrics?.length ? (
                <TargetMetricTotalsSection
                  targets={toTargetMetricTotals(assignment.latestSubmission.targetMetrics)}
                  title="Perbandingan per Link Target"
                />
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
              {isBlasting ? (
                <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
                  <Metric label="Views" value={assignment.latestSubmission.metrics.views} />
                  <Metric label="Like" value={assignment.latestSubmission.metrics.likes} />
                  <Metric label="Comment" value={assignment.latestSubmission.metrics.comments} />
                  <Metric label="Share" value={assignment.latestSubmission.metrics.shares} />
                  <Metric label="Repost" value={assignment.latestSubmission.metrics.reposts} />
                </div>
              ) : null}
              <p className="text-muted-foreground text-xs">
                Diinput: {submissionInputLabel(assignment.latestSubmission) ?? "-"}
                {assignment.latestSubmission.submittedBy?.fullName &&
                assignment.latestSubmission.submissionSource !== "self"
                  ? ` — ${assignment.latestSubmission.submittedBy.fullName}`
                  : ""}
              </p>
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-background/70 p-2">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
    </div>
  );
}
