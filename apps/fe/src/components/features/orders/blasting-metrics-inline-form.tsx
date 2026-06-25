"use client";

import { useMemo, useState } from "react";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { TargetMetricInputSection } from "@/components/features/orders/target-metric-section";
import { Button } from "@/components/ui/button";
import { clientApiFetch } from "@/lib/api/client";
import type { Assignment, OrderSocialTarget, SubmissionMetrics } from "@/lib/api/types";
import {
  buildInitialTargetMetricValues,
  buildTargetMetricsPayload,
  hasAnyTargetMetric,
} from "@/lib/blasting-metrics";

export function BlastingMetricsInlineForm({
  assignment,
  targetUrls,
  submitUrl,
  compact = false,
}: {
  assignment: Assignment;
  targetUrls: OrderSocialTarget[];
  submitUrl: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const resolvedTargets = useMemo(
    () => targetUrls.filter((target): target is OrderSocialTarget & { id: string } => Boolean(target.id)),
    [targetUrls],
  );
  const [values, setValues] = useState<Record<string, SubmissionMetrics>>(() =>
    buildInitialTargetMetricValues(resolvedTargets, assignment.latestSubmission),
  );

  const canSubmit = hasAnyTargetMetric(resolvedTargets, values);

  if (!resolvedTargets.length) {
    return (
      <p className="text-muted-foreground text-sm">
        Link target blasting belum tersedia untuk tugas ini.
      </p>
    );
  }

  function updateTargetMetrics(targetKey: string, metrics: SubmissionMetrics) {
    setValues((current) => ({
      ...current,
      [targetKey]: metrics,
    }));
  }

  async function submit() {
    if (!canSubmit) {
      toast.error("Isi minimal satu metrik pada salah satu link target");
      return;
    }

    setSaving(true);
    try {
      await clientApiFetch(submitUrl, {
        method: "POST",
        body: JSON.stringify({
          targetMetrics: buildTargetMetricsPayload(resolvedTargets, values),
        }),
      });
      toast.success("Metrik blasting berhasil disimpan");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan metrik blasting");
    } finally {
      setSaving(false);
    }
  }

  if (compact) {
    return (
      <div className="min-w-[20rem] space-y-3">
        <TargetMetricInputSection targets={resolvedTargets} values={values} onChange={updateTargetMetrics} />
        <Button type="button" size="sm" className="h-8 w-full" disabled={saving || !canSubmit} onClick={submit}>
          {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
          Simpan
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TargetMetricInputSection targets={resolvedTargets} values={values} onChange={updateTargetMetrics} />
      <div className="flex justify-end">
        <Button type="button" disabled={saving || !canSubmit} onClick={submit}>
          {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
          Simpan Metrik
        </Button>
      </div>
    </div>
  );
}
