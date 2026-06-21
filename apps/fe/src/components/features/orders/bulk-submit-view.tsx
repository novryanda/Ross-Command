"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DeadlineBadge, PlatformBadge, StatusBadge, platformLabel } from "@/components/komando/badges";
import { PageState } from "@/components/komando/page-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { clientApiFetch } from "@/lib/api/client";
import type {
  BulkSubmissionList,
  BulkSubmissionResponse,
  BulkSubmissionAssignment,
  SocialPlatform,
} from "@/lib/api/types";
import { isPlatformInTarget, parseLinks, type ParsedLink } from "@/lib/url-parser";
import { cn } from "@/lib/utils";

type BulkSubmitViewProps = {
  orderId: string;
  initialData: BulkSubmissionList;
  unitId?: string;
};

const statusSortOrder: Record<BulkSubmissionAssignment["status"], number> = {
  belum_dikerjakan: 0,
  terlambat: 1,
  selesai: 2,
};

export function BulkSubmitView({ orderId, initialData, unitId }: BulkSubmitViewProps) {
  const router = useRouter();
  const [linkInputs, setLinkInputs] = useState<Record<string, string>>({});
  const [parsedByAssignment, setParsedByAssignment] = useState<Record<string, ParsedLink[]>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [resultSummary, setResultSummary] = useState<BulkSubmissionResponse | null>(null);

  const targetPlatforms = initialData.order.postingTargetPlatforms ?? [];
  const isLocked = initialData.isLocked;

  const sortedAssignments = useMemo(
    () =>
      [...initialData.assignments].sort(
        (left, right) => statusSortOrder[left.status] - statusSortOrder[right.status],
      ),
    [initialData.assignments],
  );

  const submittableAssignments = useMemo(
    () => sortedAssignments.filter((assignment) => assignment.canSubmitForMember),
    [sortedAssignments],
  );

  const filledCount = useMemo(
    () =>
      submittableAssignments.filter((assignment) => {
        const raw = linkInputs[assignment.id]?.trim();
        return raw && parseLinks(raw).length > 0;
      }).length,
    [linkInputs, submittableAssignments],
  );

  const debouncedParse = useCallback((assignmentId: string, value: string) => {
    setParsedByAssignment((current) => ({
      ...current,
      [assignmentId]: parseLinks(value),
    }));
  }, []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const [assignmentId, value] of Object.entries(linkInputs)) {
      timers.push(
        setTimeout(() => {
          debouncedParse(assignmentId, value);
        }, 300),
      );
    }

    return () => {
      for (const timer of timers) {
        clearTimeout(timer);
      }
    };
  }, [debouncedParse, linkInputs]);

  function updateLinkInput(assignmentId: string, value: string) {
    setLinkInputs((current) => ({
      ...current,
      [assignmentId]: value,
    }));
  }

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(new Set(submittableAssignments.map((assignment) => assignment.id)));
      return;
    }

    setSelectedIds(new Set());
  }

  function toggleAssignment(assignmentId: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(assignmentId);
      } else {
        next.delete(assignmentId);
      }
      return next;
    });
  }

  async function handleSubmit() {
    const submissions = submittableAssignments
      .filter((assignment) => {
        const raw = linkInputs[assignment.id]?.trim();
        return raw && parseLinks(raw).length > 0;
      })
      .map((assignment) => ({
        assignmentId: assignment.id,
        userId: assignment.userId,
        rawLinks: linkInputs[assignment.id].trim(),
      }));

    if (!submissions.length) {
      toast.error("Isi minimal satu link posting sebelum submit");
      return;
    }

    setSubmitting(true);
    setResultSummary(null);

    try {
      const response = await clientApiFetch<BulkSubmissionResponse>(
        `/api/v1/orders/${orderId}/bulk-submission`,
        {
          method: "POST",
          body: JSON.stringify({ submissions }),
        },
      );

      setResultSummary(response.data);

      const submittedIds = new Set(
        response.data.results
          .filter((item) => item.status === "submitted")
          .map((item) => item.assignmentId),
      );

      if (submittedIds.size) {
        setLinkInputs((current) => {
          const next = { ...current };
          for (const assignmentId of submittedIds) {
            delete next[assignmentId];
          }
          return next;
        });
        setParsedByAssignment((current) => {
          const next = { ...current };
          for (const assignmentId of submittedIds) {
            delete next[assignmentId];
          }
          return next;
        });
      }

      toast.success(
        `${response.data.totalSubmitted} anggota berhasil disubmit${
          response.data.totalSkipped ? `, ${response.data.totalSkipped} dilewati` : ""
        }`,
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal melakukan bulk submission");
    } finally {
      setSubmitting(false);
    }
  }

  if (!submittableAssignments.length) {
    return (
      <PageState
        title="Tidak ada anggota yang dapat diinput"
        description="Anda tidak memiliki satuan dengan anggota yang ditugaskan pada perintah ini."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-muted/20 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Submit Posting - {initialData.order.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <DeadlineBadge deadline={initialData.order.deadline} />
              <StatusBadge status={initialData.order.status} />
            </div>
          </div>
          {targetPlatforms.length ? (
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Platform yang diminta</p>
              <div className="flex flex-wrap gap-1">
                {targetPlatforms.map((platform) => (
                  <PlatformBadge key={platform} platform={platform} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
        {isLocked ? (
          <p className="text-destructive mt-3 text-sm">
            Halaman terkunci karena perintah tidak aktif atau deadline sudah lewat.
          </p>
        ) : null}
      </section>

      {resultSummary ? (
        <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <p className="text-sm font-medium">
            Hasil submit: {resultSummary.totalSubmitted} berhasil, {resultSummary.totalSkipped}{" "}
            dilewati
          </p>
          {resultSummary.results.some((item) => item.status === "error") ? (
            <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
              {resultSummary.results
                .filter((item) => item.status === "error")
                .map((item) => (
                  <li key={item.assignmentId}>
                    {item.userId}: {item.reason ?? "Gagal"}
                  </li>
                ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-xl border">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              id="select-all"
              checked={
                selectedIds.size > 0 && selectedIds.size === submittableAssignments.length
              }
              onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))}
              disabled={isLocked}
            />
            <Label htmlFor="select-all" className="text-sm font-medium">
              Pilih Semua ({filledCount}/{submittableAssignments.length} terisi)
            </Label>
          </div>
          <Button onClick={handleSubmit} disabled={isLocked || submitting || filledCount === 0}>
            {submitting ? <Loader2Icon className="size-4 animate-spin" /> : null}
            Submit Semua
          </Button>
        </div>

        <div className="divide-y">
          {submittableAssignments.map((assignment, index) => {
            const parsedLinks = parsedByAssignment[assignment.id] ?? [];
            const previousLinks = assignment.latestSubmission?.platformLinks ?? [];

            return (
              <div key={assignment.id} className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedIds.has(assignment.id)}
                    onCheckedChange={(checked) => toggleAssignment(assignment.id, Boolean(checked))}
                    disabled={isLocked}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-medium">
                          {index + 1}. {assignment.user.fullName}
                        </p>
                        <p className="text-muted-foreground text-xs">@{assignment.user.username}</p>
                      </div>
                      <StatusBadge status={assignment.status} />
                    </div>

                    {previousLinks.length ? (
                      <div className="rounded-md border bg-muted/30 p-3">
                        <p className="text-muted-foreground text-xs">Link sebelumnya</p>
                        <div className="mt-1 space-y-1">
                          {previousLinks.map((link) => (
                            <p key={`${link.platform}-${link.url}`} className="truncate text-sm">
                              {platformLabel[link.platform]}: {link.url}
                            </p>
                          ))}
                        </div>
                        {assignment.latestSubmission?.submissionSource === "pimpinan" ||
                        assignment.latestSubmission?.isRepresented ? (
                          <p className="text-muted-foreground mt-2 text-xs">
                            Diinput pimpinan satuan
                            {assignment.latestSubmission.submittedBy?.fullName
                              ? ` — ${assignment.latestSubmission.submittedBy.fullName}`
                              : ""}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <Textarea
                        value={linkInputs[assignment.id] ?? ""}
                        onChange={(event) => updateLinkInput(assignment.id, event.target.value)}
                        placeholder={
                          assignment.status === "selesai"
                            ? "Kosongkan jika tidak ingin update. Paste link posting di sini..."
                            : "Paste link posting di sini... (pisahkan dengan enter atau spasi)"
                        }
                        rows={3}
                        disabled={isLocked}
                        className="min-h-24 resize-y"
                      />
                      <DetectedLinks
                        links={parsedLinks}
                        targetPlatforms={targetPlatforms}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link
            href={
              unitId
                ? `/orders/${orderId}/monitoring?tab=persatuan&unit=${unitId}`
                : `/orders/${orderId}/monitoring`
            }
          >
            Kembali ke Monitoring
          </Link>
        </Button>
      </div>
    </div>
  );
}

function DetectedLinks({
  links,
  targetPlatforms,
}: {
  links: ParsedLink[];
  targetPlatforms: SocialPlatform[];
}) {
  if (!links.length) {
    return (
      <p className="text-muted-foreground text-xs">Platform terdeteksi: (belum ada)</p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-xs">Platform terdeteksi:</p>
      <div className="flex flex-col gap-1.5">
        {links.map((link) => {
          const inTarget = isPlatformInTarget(link.platform, targetPlatforms);

          return (
            <div
              key={link.url}
              className="flex flex-wrap items-center gap-2 rounded-md border px-2 py-1.5"
            >
              <Badge
                className={cn(
                  "h-5 rounded-sm px-1.5 text-xs",
                  inTarget
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-300",
                )}
              >
                {platformLabel[link.platform]}
              </Badge>
              <span className="text-muted-foreground truncate text-xs">{link.url}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
