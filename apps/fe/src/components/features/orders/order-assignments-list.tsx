"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { PostingCompletenessBadge } from "@/components/features/assignments/posting-completeness-badge";
import { PostingProofDialog } from "@/components/features/assignments/posting-proof-dialog";
import { OrderAssignmentsTable } from "@/components/features/orders/order-assignments-table";
import { StatusBadge } from "@/components/komando/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Assignment, OrderType, SocialPlatform } from "@/lib/api/types";

export function OrderAssignmentsList({
  assignments,
  orderType,
  postingTargetPlatforms = [],
}: {
  assignments: Assignment[];
  orderType?: OrderType;
  postingTargetPlatforms?: SocialPlatform[];
}) {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const view = viewParam === "card" || viewParam === "table" ? viewParam : "card";
  const isPosting = orderType === "posting";

  if (view === "table") {
    return (
      <OrderAssignmentsTable
        assignments={assignments}
        orderType={orderType}
        postingTargetPlatforms={postingTargetPlatforms}
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
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={assignment.status} />
              {isPosting && assignment.latestSubmission?.postingCompleteness ? (
                <PostingCompletenessBadge
                  completeness={assignment.latestSubmission.postingCompleteness}
                  missingPlatforms={assignment.latestSubmission.missingPlatforms}
                />
              ) : null}
              {assignment.latestSubmission ? (
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
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
