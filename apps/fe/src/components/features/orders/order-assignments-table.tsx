"use client";

import Link from "next/link";

import { PostingCompletenessBadge } from "@/components/features/assignments/posting-completeness-badge";
import { PostingProofDialog } from "@/components/features/assignments/posting-proof-dialog";
import { StatusBadge } from "@/components/komando/badges";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Assignment, OrderType, SocialPlatform } from "@/lib/api/types";

function formatDateTime(value: string) {
  const date = new Date(value);
  return {
    date: new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  };
}

function ProofCell({
  assignment,
  isPosting,
  postingTargetPlatforms,
}: {
  assignment: Assignment;
  isPosting: boolean;
  postingTargetPlatforms: SocialPlatform[];
}) {
  const submission = assignment.latestSubmission;

  if (!submission) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }

  if (isPosting && submission.platformLinks?.length) {
    return (
      <PostingProofDialog
        submission={submission}
        targetPlatforms={postingTargetPlatforms}
      />
    );
  }

  if (submission.driveLink) {
    return (
      <Button asChild size="sm" variant="outline" className="h-8">
        <Link href={submission.driveLink} target="_blank">
          Bukti
        </Link>
      </Button>
    );
  }

  return <span className="text-muted-foreground text-sm">-</span>;
}

export function OrderAssignmentsTable({
  assignments,
  orderType,
  postingTargetPlatforms = [],
}: {
  assignments: Assignment[];
  orderType?: OrderType;
  postingTargetPlatforms?: SocialPlatform[];
}) {
  const isPosting = orderType === "posting";

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-muted-foreground h-10 text-xs first:pl-4">Anggota</TableHead>
              <TableHead className="text-muted-foreground h-10 text-xs">Satuan</TableHead>
              <TableHead className="text-muted-foreground h-10 text-xs">Status</TableHead>
              {isPosting ? (
                <TableHead className="text-muted-foreground h-10 text-xs">Kelengkapan</TableHead>
              ) : null}
              <TableHead className="text-muted-foreground h-10 text-xs">Submit</TableHead>
              <TableHead className="text-muted-foreground h-10 text-xs last:pr-4">Bukti</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => {
              const submittedAt = assignment.latestSubmission?.submittedAt;
              const formatted = submittedAt ? formatDateTime(submittedAt) : null;

              return (
                <TableRow key={assignment.id}>
                  <TableCell className="py-2.5 first:pl-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{assignment.user?.fullName ?? "Anggota"}</p>
                      <p className="text-muted-foreground text-xs">@{assignment.user?.username ?? "-"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground py-2.5 text-sm">
                    {assignment.unit?.name ?? "-"}
                  </TableCell>
                  <TableCell className="py-2.5">
                    <StatusBadge status={assignment.status} />
                  </TableCell>
                  {isPosting ? (
                    <TableCell className="py-2.5">
                      {assignment.latestSubmission?.postingCompleteness ? (
                        <PostingCompletenessBadge
                          completeness={assignment.latestSubmission.postingCompleteness}
                          missingPlatforms={assignment.latestSubmission.missingPlatforms}
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  ) : null}
                  <TableCell className="py-2.5">
                    {formatted ? (
                      <div className="min-w-28">
                        <p className="text-sm leading-tight">{formatted.date}</p>
                        <p className="text-muted-foreground text-xs">{formatted.time}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2.5 last:pr-4">
                    <ProofCell
                      assignment={assignment}
                      isPosting={isPosting}
                      postingTargetPlatforms={postingTargetPlatforms}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
