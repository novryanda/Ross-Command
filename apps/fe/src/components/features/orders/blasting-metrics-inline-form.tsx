"use client";

import { useState } from "react";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clientApiFetch } from "@/lib/api/client";
import type { Assignment, SubmissionMetrics } from "@/lib/api/types";

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

export function BlastingMetricsInlineForm({
  assignment,
  submitUrl,
  compact = false,
}: {
  assignment: Assignment;
  submitUrl: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [metrics, setMetrics] = useState<SubmissionMetrics>(
    assignment.latestSubmission?.metrics ?? emptyMetrics,
  );

  const hasAnyMetric = Object.values(metrics).some((value) => value > 0);

  function setMetric(key: keyof SubmissionMetrics, value: string) {
    setMetrics((current) => ({
      ...current,
      [key]: Math.max(0, Number(value) || 0),
    }));
  }

  async function submit() {
    if (!hasAnyMetric) {
      toast.error("Isi minimal satu metrik blasting");
      return;
    }

    setSaving(true);
    try {
      await clientApiFetch(submitUrl, {
        method: "POST",
        body: JSON.stringify({ metrics }),
      });
      toast.success("Metrik blasting berhasil disimpan");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan metrik blasting");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={compact ? "grid min-w-[18rem] grid-cols-3 gap-2 lg:grid-cols-6" : "grid gap-2 sm:grid-cols-3 lg:grid-cols-6"}>
      {metricFields.map((field) => (
        <label key={field.key} className="grid gap-1 text-xs">
          <span className="text-muted-foreground">{field.label}</span>
          <Input
            type="number"
            min={0}
            value={metrics[field.key]}
            onChange={(event) => setMetric(field.key, event.target.value)}
            className="h-8 w-full"
          />
        </label>
      ))}
      <div className="flex items-end">
        <Button
          type="button"
          size="sm"
          className="h-8 w-full"
          disabled={saving}
          onClick={submit}
        >
          {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
          Simpan
        </Button>
      </div>
    </div>
  );
}
