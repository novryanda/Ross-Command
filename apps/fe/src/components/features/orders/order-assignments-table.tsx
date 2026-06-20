"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDownIcon, Settings2Icon } from "lucide-react";

import { PostingCompletenessBadge } from "@/components/features/assignments/posting-completeness-badge";
import { PostingProofDialog } from "@/components/features/assignments/posting-proof-dialog";
import { SubmitProofDialog } from "@/components/features/assignments/submit-proof-dialog";
import { BlastingMetricsInlineForm } from "@/components/features/orders/blasting-metrics-inline-form";
import { StatusBadge } from "@/components/komando/badges";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Assignment, OrderType, SocialPlatform } from "@/lib/api/types";

type AssignmentTableColumn =
  | "unit"
  | "status"
  | "postingCompleteness"
  | "metrics"
  | "submittedAt"
  | "submitter"
  | "action";

const defaultVisibleColumns: Record<AssignmentTableColumn, boolean> = {
  unit: true,
  status: true,
  postingCompleteness: true,
  metrics: true,
  submittedAt: false,
  submitter: false,
  action: true,
};

const columnLabels: Record<AssignmentTableColumn, string> = {
  unit: "Satuan",
  status: "Status",
  postingCompleteness: "Kelengkapan",
  metrics: "Metrik",
  submittedAt: "Submit",
  submitter: "Diinput",
  action: "Aksi",
};

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

function SubmitterLabel({ assignment }: { assignment: Assignment }) {
  const submission = assignment.latestSubmission;
  if (!submission) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }

  return (
    <div className="min-w-28">
      <p className="text-sm leading-tight">{submission.isRepresented ? "Diwakili Pimpinan" : "Mandiri"}</p>
      <p className="text-muted-foreground text-xs">{submission.submittedBy?.fullName ?? "-"}</p>
    </div>
  );
}

export function OrderAssignmentsTable({
  assignments,
  orderType,
  postingTargetPlatforms = [],
  orderId,
}: {
  assignments: Assignment[];
  orderType?: OrderType;
  postingTargetPlatforms?: SocialPlatform[];
  orderId: string;
}) {
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const isPosting = orderType === "posting";
  const isBlasting = orderType === "engagement" || orderType === "blasting";
  const toggleableColumns = getToggleableColumns({ isPosting, isBlasting });

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center justify-end border-b p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Settings2Icon className="size-3.5" />
              Columns
              <ChevronDownIcon className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Tampilkan kolom</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {toggleableColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column}
                checked={visibleColumns[column]}
                onCheckedChange={(checked) =>
                  setVisibleColumns((current) => ({
                    ...current,
                    [column]: Boolean(checked),
                  }))
                }
              >
                {columnLabels[column]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-muted-foreground h-10 min-w-64 text-xs first:pl-4">Anggota</TableHead>
              {visibleColumns.unit ? (
                <TableHead className="text-muted-foreground h-10 min-w-56 text-xs">Satuan</TableHead>
              ) : null}
              {visibleColumns.status ? (
                <TableHead className="text-muted-foreground h-10 min-w-36 text-xs">Status</TableHead>
              ) : null}
              {isPosting && visibleColumns.postingCompleteness ? (
                <TableHead className="text-muted-foreground h-10 min-w-40 text-xs">Kelengkapan</TableHead>
              ) : null}
              {isBlasting && visibleColumns.metrics ? (
                <TableHead className="text-muted-foreground h-10 min-w-80 text-xs">Metrik</TableHead>
              ) : null}
              {visibleColumns.submittedAt ? (
                <TableHead className="text-muted-foreground h-10 min-w-32 text-xs">Submit</TableHead>
              ) : null}
              {visibleColumns.submitter ? (
                <TableHead className="text-muted-foreground h-10 min-w-48 text-xs">Diinput</TableHead>
              ) : null}
              {visibleColumns.action ? (
                <TableHead className="text-muted-foreground h-10 min-w-32 text-right text-xs last:pr-4">
                  Aksi
                </TableHead>
              ) : null}
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
                      <p className="truncate text-sm font-medium">{assignment.user?.fullName ?? "Anggota"}</p>
                      <p className="text-muted-foreground truncate text-xs">@{assignment.user?.username ?? "-"}</p>
                      <p className="text-muted-foreground mt-1 truncate text-xs md:hidden">
                        {assignment.unit?.name ?? "-"}
                      </p>
                    </div>
                  </TableCell>
                  {visibleColumns.unit ? (
                  <TableCell className="text-muted-foreground py-2.5 text-sm">
                    <span className="block max-w-[12rem] truncate">{assignment.unit?.name ?? "-"}</span>
                  </TableCell>
                  ) : null}
                  {visibleColumns.status ? (
                  <TableCell className="py-2.5">
                    <StatusBadge status={assignment.status} />
                  </TableCell>
                  ) : null}
                  {isPosting && visibleColumns.postingCompleteness ? (
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
                  {isBlasting && visibleColumns.metrics ? (
                    <TableCell className="py-2.5">
                      <MetricSummary assignment={assignment} />
                    </TableCell>
                  ) : null}
                  {visibleColumns.submittedAt ? (
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
                  ) : null}
                  {visibleColumns.submitter ? (
                  <TableCell className="py-2.5">
                    <SubmitterLabel assignment={assignment} />
                  </TableCell>
                  ) : null}
                  {visibleColumns.action ? (
                  <TableCell className="py-2.5 text-right last:pr-4">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {isBlasting && assignment.canSubmitForMember ? (
                        <BlastingMetricsDialog
                          assignment={assignment}
                          submitUrl={`/api/v1/orders/${orderId}/assignments/${assignment.id}/submit`}
                        />
                      ) : (
                        <ProofCell
                          assignment={assignment}
                          isPosting={isPosting}
                          postingTargetPlatforms={postingTargetPlatforms}
                        />
                      )}
                      {!isBlasting && assignment.canSubmitForMember ? (
                        <SubmitProofDialog
                          assignmentId={assignment.id}
                          orderType={orderType}
                          postingTargetPlatforms={postingTargetPlatforms}
                          submitUrl={`/api/v1/orders/${orderId}/assignments/${assignment.id}/submit`}
                          initialSubmission={assignment.latestSubmission}
                          title={assignment.latestSubmission ? "Edit Bukti Anggota" : "Input Bukti Anggota"}
                          trigger={
                            <Button size="sm" variant="outline" className="h-8">
                              {assignment.latestSubmission ? "Edit" : "Input"}
                            </Button>
                          }
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function getToggleableColumns({
  isPosting,
  isBlasting,
}: {
  isPosting: boolean;
  isBlasting: boolean;
}) {
  return [
    "unit",
    "status",
    ...(isPosting ? (["postingCompleteness"] as const) : []),
    ...(isBlasting ? (["metrics"] as const) : []),
    "submittedAt",
    "submitter",
    "action",
  ] satisfies AssignmentTableColumn[];
}

function MetricSummary({ assignment }: { assignment: Assignment }) {
  const metrics = assignment.latestSubmission?.metrics ?? {
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    reposts: 0,
  };
  const items = [
    { label: "V", value: metrics.views },
    { label: "L", value: metrics.likes },
    { label: "C", value: metrics.comments },
    { label: "S", value: metrics.shares },
    { label: "R", value: metrics.reposts },
  ];

  return (
    <div className="grid min-w-0 grid-cols-5 gap-1">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 rounded-md bg-muted/60 px-1.5 py-1 text-center">
          <p className="text-muted-foreground text-[10px] leading-none">{item.label}</p>
          <p className="truncate text-xs font-medium tabular-nums">
            {item.value.toLocaleString("id-ID")}
          </p>
        </div>
      ))}
    </div>
  );
}

function BlastingMetricsDialog({
  assignment,
  submitUrl,
}: {
  assignment: Assignment;
  submitUrl: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8">
          {assignment.latestSubmission ? "Edit" : "Input"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Input Metrik Blasting</DialogTitle>
        </DialogHeader>
        <BlastingMetricsInlineForm assignment={assignment} submitUrl={submitUrl} />
      </DialogContent>
    </Dialog>
  );
}
