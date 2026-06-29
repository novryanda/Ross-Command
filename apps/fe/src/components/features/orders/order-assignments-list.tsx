"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { PostingCompletenessBadge } from "@/components/features/assignments/posting-completeness-badge";
import { PostingProofDialog } from "@/components/features/assignments/posting-proof-dialog";
import { SubmitProofDialog } from "@/components/features/assignments/submit-proof-dialog";
import { BlastingMetricsInlineForm } from "@/components/features/orders/blasting-metrics-inline-form";
import { OrderAssignmentsTable } from "@/components/features/orders/order-assignments-table";
import { RepresentedByLeaderBadge, StatusBadge, submissionInputLabel } from "@/components/komando/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Assignment, OrderSocialTarget, OrderType, SocialPlatform } from "@/lib/api/types";

export function OrderAssignmentsList({
  assignments,
  orderType,
  postingTargetPlatforms = [],
  targetUrls = [],
  orderId,
}: {
  assignments: Assignment[];
  orderType?: OrderType;
  postingTargetPlatforms?: SocialPlatform[];
  targetUrls?: OrderSocialTarget[];
  orderId: string;
}) {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const view = viewParam === "card" || viewParam === "table" ? viewParam : "card";
  const isPosting = orderType === "posting";
  const isBlasting = orderType === "engagement" || orderType === "blasting";

  if (view === "table") {
    return (
      <OrderAssignmentsTable
        assignments={assignments}
        orderType={orderType}
        postingTargetPlatforms={postingTargetPlatforms}
        targetUrls={targetUrls}
        orderId={orderId}
      />
    );
  }

  return (
    <Card className="border-border/70 py-0 shadow-sm">
      <CardContent className="divide-border divide-y p-0">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-medium">{assignment.user?.fullName ?? "Anggota"}</p>
              <p className="text-muted-foreground text-xs">
                {assignment.unit?.name ?? "-"} - @{assignment.user?.username}
              </p>
              {assignment.latestSubmission ? (
                <p className="text-muted-foreground mt-1 text-xs">
                  {submissionInputLabel(assignment.latestSubmission)}
                  {assignment.latestSubmission.submittedBy?.fullName
                    ? ` — ${assignment.latestSubmission.submittedBy.fullName}`
                    : ""}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={assignment.status} />
              {assignment.representedByLeader ? <RepresentedByLeaderBadge /> : null}
              {isPosting && assignment.latestSubmission?.postingCompleteness ? (
                <PostingCompletenessBadge
                  completeness={assignment.latestSubmission.postingCompleteness}
                  missingPlatforms={assignment.latestSubmission.missingPlatforms}
                />
              ) : null}
              {isBlasting && assignment.canSubmitForMember ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      {assignment.latestSubmission ? "Ubah Metrik" : "Input Metrik"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>
                        {assignment.latestSubmission ? "Ubah Metrik Blasting" : "Input Metrik Blasting"}
                      </DialogTitle>
                    </DialogHeader>
                    <BlastingMetricsInlineForm
                      assignment={assignment}
                      targetUrls={targetUrls}
                      submitUrl={`/api/v1/orders/${orderId}/assignments/${assignment.id}/submit`}
                    />
                  </DialogContent>
                </Dialog>
              ) : assignment.representedByLeader ? null : assignment.latestSubmission ? (
                isPosting && assignment.latestSubmission.platformLinks?.length ? (
                  <PostingProofDialog
                    submission={assignment.latestSubmission}
                    targetPlatforms={postingTargetPlatforms}
                  />
                ) : assignment.latestSubmission.driveLink ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href={assignment.latestSubmission.driveLink} target="_blank">
                      Bukti
                    </Link>
                  </Button>
                ) : null
              ) : null}
              {!isBlasting && assignment.canSubmitForMember ? (
                <SubmitProofDialog
                  assignmentId={assignment.id}
                  orderType={orderType}
                  postingTargetPlatforms={postingTargetPlatforms}
                  submitUrl={`/api/v1/orders/${orderId}/assignments/${assignment.id}/submit`}
                  initialSubmission={assignment.latestSubmission}
                  title={assignment.latestSubmission ? "Edit Bukti Anggota" : "Input Bukti Anggota"}
                  trigger={
                    <Button size="sm" variant="outline">
                      {assignment.latestSubmission ? "Ubah Bukti" : "Input Bukti"}
                    </Button>
                  }
                />
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
