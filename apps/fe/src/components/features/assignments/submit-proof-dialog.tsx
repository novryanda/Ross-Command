"use client";

import { useMemo, useState } from "react";
import { Loader2Icon } from "lucide-react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  buildPostingPlatformLinks,
  getMissingPostingPlatforms,
  hasAtLeastOnePostingLink,
} from "@/components/features/assignments/posting-proof-dialog";
import { platformLabel } from "@/components/komando/badges";
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
import { Textarea } from "@/components/ui/textarea";
import { clientApiFetch } from "@/lib/api/client";
import type { OrderType, SocialPlatform, Submission, SubmissionMetrics } from "@/lib/api/types";

type SubmitProofDialogProps = {
  assignmentId: string;
  orderType?: OrderType;
  postingTargetPlatforms?: SocialPlatform[] | null;
  submitUrl?: string;
  trigger?: ReactNode;
  title?: string;
  initialSubmission?: Submission | null;
};

const metricFields: Array<{ key: keyof SubmissionMetrics; label: string }> = [
  { key: "views", label: "Views" },
  { key: "likes", label: "Like" },
  { key: "comments", label: "Comment" },
  { key: "shares", label: "Share" },
  { key: "reposts", label: "Repost" },
];

const emptyMetrics: SubmissionMetrics = {
  views: 0,
  likes: 0,
  comments: 0,
  shares: 0,
  reposts: 0,
};

export function SubmitProofDialog({
  assignmentId,
  orderType = "engagement",
  postingTargetPlatforms = [],
  submitUrl,
  trigger,
  title = "Submit Bukti Pelaksanaan",
  initialSubmission,
}: SubmitProofDialogProps) {
  const isPosting = orderType === "posting";
  const isBlasting = orderType === "engagement" || orderType === "blasting";
  const targetPlatforms = postingTargetPlatforms ?? [];
  const [open, setOpen] = useState(false);
  const [driveLink, setDriveLink] = useState(() => initialSubmission?.driveLink ?? "");
  const [platformValues, setPlatformValues] = useState<Record<string, string>>(() =>
    buildInitialPlatformValues(initialSubmission),
  );
  const [metrics, setMetrics] = useState<SubmissionMetrics>(
    () => initialSubmission?.metrics ?? emptyMetrics,
  );
  const [notes, setNotes] = useState(() => initialSubmission?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const missingPlatforms = useMemo(
    () => (isPosting ? getMissingPostingPlatforms(targetPlatforms, platformValues) : []),
    [isPosting, platformValues, targetPlatforms],
  );

  const canSubmit = isPosting
    ? hasAtLeastOnePostingLink(targetPlatforms, platformValues)
    : Boolean(driveLink.trim()) || (isBlasting && Object.values(metrics).some((value) => value > 0));

  function resetForm() {
    setDriveLink(initialSubmission?.driveLink ?? "");
    setPlatformValues(buildInitialPlatformValues(initialSubmission));
    setMetrics(initialSubmission?.metrics ?? emptyMetrics);
    setNotes(initialSubmission?.notes ?? "");
  }

  function setMetricValue(key: keyof SubmissionMetrics, value: string) {
    const numericValue = Math.max(0, Number.parseInt(value || "0", 10) || 0);
    setMetrics((current) => ({ ...current, [key]: numericValue }));
  }

  async function submit() {
    setSubmitting(true);
    try {
      const payloadMetrics = isBlasting ? metrics : emptyMetrics;
      const payload = isPosting
        ? {
            platformLinks: buildPostingPlatformLinks(targetPlatforms, platformValues),
            driveLink: driveLink.trim() || undefined,
            metrics: payloadMetrics,
            notes: notes || undefined,
          }
        : {
            driveLink: driveLink.trim() || undefined,
            metrics: payloadMetrics,
            notes: notes || undefined,
          };

      await clientApiFetch(submitUrl ?? `/api/v1/assignments/me/${assignmentId}/submit`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("Bukti berhasil dikirim");
      setOpen(false);
      resetForm();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengirim bukti");
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
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? <Button size="sm">Submit Bukti</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isPosting
              ? "Masukkan link posting untuk setiap sosmed target. Boleh dikirim sebagian, asalkan minimal satu link terisi."
              : "Masukkan link Google Drive atau dokumen bukti yang dapat dibuka pimpinan."}{" "}
            Submit ulang akan tercatat sebagai aktivitas baru.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {isPosting ? (
            <div className="space-y-3">
              <div className="grid gap-2">
                <Label htmlFor="driveLink">Link Drive</Label>
                <Input
                  id="driveLink"
                  type="url"
                  placeholder="https://drive.google.com/... (opsional)"
                  value={driveLink}
                  onChange={(event) => setDriveLink(event.target.value)}
                />
                <p className="text-muted-foreground text-xs">Opsional — lampiran tambahan di Google Drive.</p>
              </div>
              {targetPlatforms.map((platform) => (
                <div key={platform} className="grid gap-2">
                  <Label htmlFor={`proof-${platform}`}>{platformLabel[platform]}</Label>
                  <Input
                    id={`proof-${platform}`}
                    type="url"
                    placeholder="https://"
                    value={platformValues[platform] ?? ""}
                    onChange={(event) =>
                      setPlatformValues((current) => ({
                        ...current,
                        [platform]: event.target.value,
                      }))
                    }
                  />
                </div>
              ))}
              {missingPlatforms.length ? (
                <p className="text-amber-700 text-xs dark:text-amber-300">
                  Belum diisi: {missingPlatforms.map((platform) => platformLabel[platform]).join(", ")}
                </p>
              ) : targetPlatforms.length ? (
                <p className="text-emerald-700 text-xs dark:text-emerald-300">Semua target sosmed sudah terisi.</p>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="driveLink">Link Bukti</Label>
              <Input
                id="driveLink"
                type="url"
                value={driveLink}
                onChange={(event) => setDriveLink(event.target.value)}
              />
            </div>
          )}
          {isBlasting ? (
            <div className="grid gap-3 rounded-md border p-3 sm:grid-cols-2">
              {metricFields.map((field) => (
                <div key={field.key} className="grid gap-2">
                  <Label htmlFor={`metric-${field.key}`}>{field.label}</Label>
                  <Input
                    id={`metric-${field.key}`}
                    type="number"
                    min={0}
                    value={metrics[field.key]}
                    onChange={(event) => setMetricValue(field.key, event.target.value)}
                  />
                </div>
              ))}
            </div>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea id="notes" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={submitting || !canSubmit}>
            {submitting ? <Loader2Icon className="animate-spin" /> : null}
            Kirim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildInitialPlatformValues(submission?: Submission | null) {
  return Object.fromEntries(
    (submission?.platformLinks ?? []).map((link) => [link.platform, link.url]),
  );
}
