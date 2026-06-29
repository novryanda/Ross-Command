"use client";

import { useMemo, useState } from "react";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { TargetMetricInputSection } from "@/components/features/orders/target-metric-section";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { clientApiFetch } from "@/lib/api/client";
import type {
  Assignment,
  OrderSocialTarget,
  OrderType,
  Submission,
  SubmissionMetrics,
} from "@/lib/api/types";
import { isBlastingOrderType } from "@/lib/order-utils";
import {
  buildInitialTargetMetricValues,
  buildTargetMetricsPayload,
  hasAnyTargetMetric,
} from "@/lib/blasting-metrics";

export function UnitTotalSubmissionForm({
  orderId,
  unitId,
  orderType,
  targetUrls = [],
  initialSubmission,
  compact = false,
}: {
  orderId: string;
  unitId: string;
  orderType: OrderType;
  targetUrls?: OrderSocialTarget[];
  initialSubmission?: Submission | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const isBlasting = isBlastingOrderType(orderType);
  const resolvedTargets = useMemo(
    () => targetUrls.filter((target): target is OrderSocialTarget & { id: string } => Boolean(target.id)),
    [targetUrls],
  );
  const [metricValues, setMetricValues] = useState<Record<string, SubmissionMetrics>>(() =>
    buildInitialTargetMetricValues(resolvedTargets, initialSubmission ?? null),
  );
  const [driveLink, setDriveLink] = useState(initialSubmission?.driveLink ?? "");
  const [notes, setNotes] = useState(initialSubmission?.notes ?? "");

  const canSubmitBlasting = hasAnyTargetMetric(resolvedTargets, metricValues);
  const canSubmitProof = driveLink.trim().length > 0;
  const canSubmit = isBlasting ? canSubmitBlasting : canSubmitProof;

  function updateTargetMetrics(targetKey: string, metrics: SubmissionMetrics) {
    setMetricValues((current) => ({
      ...current,
      [targetKey]: metrics,
    }));
  }

  async function submit() {
    if (!canSubmit) {
      toast.error(
        isBlasting
          ? "Isi minimal satu metrik pada salah satu link target"
          : "Link bukti wajib diisi",
      );
      return;
    }

    setSaving(true);
    try {
      await clientApiFetch(`/api/v1/orders/${orderId}/units/${unitId}/unit-submission`, {
        method: "POST",
        body: JSON.stringify(
          isBlasting
            ? {
                targetMetrics: buildTargetMetricsPayload(resolvedTargets, metricValues),
                notes: notes.trim() || undefined,
              }
            : {
                driveLink: driveLink.trim(),
                notes: notes.trim() || undefined,
              },
        ),
      });
      toast.success("Total satuan berhasil disimpan");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan total satuan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <p className="text-muted-foreground text-sm">
        Input total pelaksanaan seluruh anggota satuan. Metrik atau bukti ini mewakili
        keseluruhan anggota di satuan ini.
      </p>

      {isBlasting ? (
        resolvedTargets.length ? (
          <TargetMetricInputSection
            targets={resolvedTargets}
            values={metricValues}
            onChange={updateTargetMetrics}
          />
        ) : (
          <p className="text-muted-foreground text-sm">
            Link target blasting belum tersedia untuk tugas ini.
          </p>
        )
      ) : (
        <div className="grid gap-2">
          <Label htmlFor="unit-drive-link">Link Bukti (Google Drive)</Label>
          <Input
            id="unit-drive-link"
            type="url"
            placeholder="https://drive.google.com/..."
            value={driveLink}
            onChange={(event) => setDriveLink(event.target.value)}
          />
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="unit-notes">Catatan (opsional)</Label>
        <Textarea
          id="unit-notes"
          rows={2}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>

      <Button type="button" disabled={!canSubmit || saving} onClick={submit}>
        {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
        Simpan Total Satuan
      </Button>
    </div>
  );
}

export function UnitTotalSubmissionDialog({
  orderId,
  assignment,
  orderType,
  targetUrls = [],
  trigger,
}: {
  orderId: string;
  assignment: Assignment;
  orderType?: OrderType;
  targetUrls?: OrderSocialTarget[];
  trigger: React.ReactNode;
}) {
  const unitId = assignment.unit?.id;
  if (!unitId) {
    return null;
  }

  const resolvedOrderType = orderType ?? assignment.order?.orderType ?? "blasting";
  const hasSubmission = Boolean(assignment.latestSubmission);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{hasSubmission ? "Ubah Total Satuan" : "Input Total Satuan"}</DialogTitle>
        </DialogHeader>
        <UnitTotalSubmissionForm
          orderId={orderId}
          unitId={unitId}
          orderType={resolvedOrderType}
          targetUrls={targetUrls}
          initialSubmission={assignment.latestSubmission}
        />
      </DialogContent>
    </Dialog>
  );
}
