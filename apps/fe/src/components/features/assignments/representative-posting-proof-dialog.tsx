"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CSSProperties } from "react";

import { platformLabel, StatusBadge } from "@/components/komando/badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientApiFetch } from "@/lib/api/client";
import type {
  BulkSubmissionList,
  BulkSubmissionResponse,
  SocialPlatform,
} from "@/lib/api/types";

type RepresentativePostingProofDialogProps = {
  orderId: string;
  postingTargetPlatforms?: SocialPlatform[] | null;
  trigger?: React.ReactNode;
};

type LinkInputs = Record<string, Record<string, string>>;

const defaultPostingPlatforms: SocialPlatform[] = ["instagram", "facebook"];

export function RepresentativePostingProofDialog({
  orderId,
  postingTargetPlatforms,
  trigger,
}: RepresentativePostingProofDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<BulkSubmissionList | null>(null);
  const [linkInputs, setLinkInputs] = useState<LinkInputs>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const platforms = useMemo(
    () =>
      postingTargetPlatforms?.length
        ? postingTargetPlatforms
        : (data?.order.postingTargetPlatforms?.length
            ? data.order.postingTargetPlatforms
            : defaultPostingPlatforms),
    [data?.order.postingTargetPlatforms, postingTargetPlatforms],
  );

  const submittableAssignments = useMemo(
    () => (data?.assignments ?? []).filter((assignment) => assignment.canSubmitForMember),
    [data?.assignments],
  );

  const filledCount = useMemo(
    () =>
      submittableAssignments.filter((assignment) =>
        platforms.some((platform) => isValidUrl(linkInputs[assignment.id]?.[platform] ?? "")),
      ).length,
    [linkInputs, platforms, submittableAssignments],
  );

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await clientApiFetch<BulkSubmissionList>(
        `/api/v1/orders/${orderId}/bulk-submission`,
      );
      const responsePlatforms = response.data.order.postingTargetPlatforms?.length
        ? response.data.order.postingTargetPlatforms
        : platforms;
      setData(response.data);
      setLinkInputs(buildInitialInputs(response.data, responsePlatforms));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal mengambil daftar anggota");
    } finally {
      setLoading(false);
    }
  }, [orderId, platforms]);

  useEffect(() => {
    if (!open || data || loading) {
      return;
    }

    void loadMembers();
  }, [data, loadMembers, loading, open]);

  function updateLink(assignmentId: string, platform: SocialPlatform, value: string) {
    setLinkInputs((current) => ({
      ...current,
      [assignmentId]: {
        ...(current[assignmentId] ?? {}),
        [platform]: value,
      },
    }));
  }

  async function submit() {
    const submissions = submittableAssignments
      .map((assignment) => {
        const rawLinks = platforms
          .map((platform) => linkInputs[assignment.id]?.[platform]?.trim() ?? "")
          .filter(isValidUrl)
          .join("\n");

        return {
          assignmentId: assignment.id,
          userId: assignment.userId,
          rawLinks,
        };
      })
      .filter((item) => item.rawLinks.length > 0);

    if (!submissions.length) {
      toast.error("Isi minimal satu link anggota terlebih dahulu");
      return;
    }

    setSubmitting(true);

    try {
      const response = await clientApiFetch<BulkSubmissionResponse>(
        `/api/v1/orders/${orderId}/bulk-submission`,
        {
          method: "POST",
          body: JSON.stringify({ submissions }),
        },
      );

      toast.success(`${response.data.totalSubmitted} bukti anggota berhasil dikirim`);
      setOpen(false);
      setData(null);
      setLinkInputs({});
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengirim bukti anggota");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setErrorMessage(null);
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? <Button size="sm">Kirim Bukti</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Kirim Bukti Anggota Satuan</DialogTitle>
          <DialogDescription>
            Isi link posting Instagram/Facebook sesuai nama anggota yang diwakili pimpinan satuan.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Memuat anggota...
          </div>
        ) : errorMessage ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{errorMessage}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={loadMembers}>
              <RefreshCwIcon className="size-4" />
              Coba Lagi
            </Button>
          </div>
        ) : submittableAssignments.length ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/25 p-3">
              <div>
                <p className="text-sm font-medium">{data?.order.title}</p>
                <p className="text-muted-foreground text-xs">
                  {filledCount}/{submittableAssignments.length} anggota sudah diisi
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {platforms.map((platform) => (
                  <Badge key={platform} variant="secondary" className="rounded-sm">
                    {platformLabel[platform]}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-md border">
              <div
                className="hidden gap-3 border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground lg:grid lg:grid-cols-[minmax(180px,1fr)_160px_repeat(var(--platform-count),minmax(180px,1fr))]"
                style={platformGridStyle(platforms.length)}
              >
                <span>Anggota</span>
                <span>Status</span>
                {platforms.map((platform) => (
                  <span key={platform}>{platformLabel[platform]}</span>
                ))}
              </div>
              <div className="divide-y">
                {submittableAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="grid gap-3 p-4 lg:grid-cols-[minmax(180px,1fr)_160px_repeat(var(--platform-count),minmax(180px,1fr))] lg:items-start"
                    style={platformGridStyle(platforms.length)}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{assignment.user.fullName}</p>
                      <p className="text-muted-foreground truncate text-xs">@{assignment.user.username}</p>
                    </div>
                    <div>
                      <StatusBadge status={assignment.status} />
                    </div>
                    {platforms.map((platform) => (
                      <div key={platform} className="grid gap-1.5">
                        <Label htmlFor={`${assignment.id}-${platform}`} className="text-xs lg:hidden">
                          {platformLabel[platform]}
                        </Label>
                        <Input
                          id={`${assignment.id}-${platform}`}
                          type="url"
                          placeholder="https://"
                          value={linkInputs[assignment.id]?.[platform] ?? ""}
                          disabled={data?.isLocked || submitting}
                          onChange={(event) => updateLink(assignment.id, platform, event.target.value)}
                        />
                        {linkInputs[assignment.id]?.[platform] &&
                        !isValidUrl(linkInputs[assignment.id][platform]) ? (
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            Link harus diawali http:// atau https://
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            Belum ada anggota satuan yang bisa diinput untuk tugas ini.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            onClick={submit}
            disabled={submitting || Boolean(data?.isLocked) || filledCount === 0}
          >
            {submitting ? <Loader2Icon className="size-4 animate-spin" /> : null}
            Kirim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildInitialInputs(data: BulkSubmissionList, platforms: SocialPlatform[]) {
  const inputs: LinkInputs = {};

  for (const assignment of data.assignments) {
    const links = assignment.latestSubmission?.platformLinks ?? [];
    inputs[assignment.id] = Object.fromEntries(
      platforms.map((platform) => [
        platform,
        links.find((link) => link.platform === platform)?.url ?? "",
      ]),
    );
  }

  return inputs;
}

function isValidUrl(value: string) {
  if (!value.trim()) {
    return false;
  }

  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function platformGridStyle(platformCount: number): CSSProperties {
  return { "--platform-count": platformCount } as CSSProperties;
}
