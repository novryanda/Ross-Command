"use client";

import { useMemo, useState } from "react";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { TargetPicker, type OrderTargetInput } from "@/components/komando/trees/target-picker";
import { CommentSentimentBadge } from "@/components/komando/badges";
import {
  OrderTargetUrlsField,
  createTargetUrlDraft,
  hasValidTargetUrls,
  type OrderTargetUrlDraft,
} from "@/components/features/orders/order-target-urls-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Stepper } from "@/components/wizard-stepper";
import { clientApiFetch } from "@/lib/api/client";
import type { Order, OrderType, UnitNode, UserListItem } from "@/lib/api/types";

const ENGAGEMENT_ACTIONS = ["like", "share", "repost"] as const;

const defaultDescription: Record<OrderType, string> = {
  posting: "Unggah konten sesuai brief pada URL target.",
  engagement: "Lakukan like, share, dan repost pada URL target.",
  komentar: "Berikan komentar sesuai narasi pada URL target.",
  report_akun: "Laporkan akun target sesuai alasan yang ditentukan.",
};

function resolveDescription(orderType: OrderType, description: string) {
  const trimmed = description.trim();
  return trimmed.length >= 3 ? trimmed : defaultDescription[orderType];
}

const steps = [
  { id: "detail", title: "Detail", description: "Jenis dan instruksi" },
  { id: "target", title: "Target", description: "Satuan atau individu" },
  { id: "review", title: "Review", description: "Simpan atau kirim" },
];

type OrderDraft = {
  title: string;
  orderType: OrderType;
  description: string;
  targetUrls: OrderTargetUrlDraft[];
  narration: string;
  sentiment: "positive" | "negative" | "";
  engagementActions: string[];
  reportReason: string;
  deadline: string;
};

export function OrderForm({ units, members }: { units: UnitNode[]; members: UserListItem[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState<"draft" | "aktif" | null>(null);
  const [targets, setTargets] = useState<OrderTargetInput[]>([]);
  const [draft, setDraft] = useState<OrderDraft>({
    title: "",
    orderType: "posting",
    description: "",
    targetUrls: [createTargetUrlDraft()],
    narration: "",
    sentiment: "",
    engagementActions: [],
    reportReason: "",
    deadline: "",
  });

  const requiresNarration = draft.orderType === "komentar";
  const requiresReport = draft.orderType === "report_akun";

  const canContinue = useMemo(() => {
    if (step === 0) {
      const baseValid =
        draft.title.length >= 3 && hasValidTargetUrls(draft.targetUrls) && draft.deadline;
      if (!baseValid) return false;
      if (requiresNarration) {
        return draft.narration.length >= 3 && (draft.sentiment === "positive" || draft.sentiment === "negative");
      }
      if (requiresReport) return draft.reportReason.length >= 3;
      return true;
    }
    if (step === 1) return targets.length > 0;
    return true;
  }, [draft, requiresNarration, requiresReport, step, targets.length]);

  function setField<K extends keyof OrderDraft>(key: K, value: OrderDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function submit(status: "draft" | "aktif") {
    if (!targets.length) {
      toast.error("Pilih minimal satu target");
      return;
    }

    setSubmitting(status);
    try {
      const payload = {
        title: draft.title,
        orderType: draft.orderType,
        description: resolveDescription(draft.orderType, draft.description),
        targetUrls: draft.targetUrls
          .filter((item) => item.url.trim())
          .map((item) => ({
            platform: item.platform,
            url: item.url.trim(),
          })),
        narration: draft.narration || undefined,
        sentiment: draft.sentiment || undefined,
        engagementActions:
          draft.orderType === "engagement" ? [...ENGAGEMENT_ACTIONS] : undefined,
        reportReason: draft.reportReason || undefined,
        deadline: new Date(draft.deadline).toISOString(),
        status,
        targets,
      };
      const response = await clientApiFetch<Order>("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success(status === "aktif" ? "Perintah berhasil dibuat dan dikirim" : "Draft perintah berhasil dibuat");
      router.push(`/orders/${response.data.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat perintah");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="space-y-4">
      <Stepper steps={steps} currentIndex={step} />

      {step === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detail Perintah</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Judul</Label>
              <Input id="title" value={draft.title} onChange={(event) => setField("title", event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Jenis Perintah</Label>
              <Select
                value={draft.orderType}
                onValueChange={(value) => {
                  const orderType = value as OrderType;
                  setDraft((current) => ({
                    ...current,
                    orderType,
                    sentiment: orderType === "komentar" ? current.sentiment : "",
                    engagementActions: orderType === "engagement" ? [...ENGAGEMENT_ACTIONS] : [],
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="posting">Posting</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="komentar">Komentar</SelectItem>
                  <SelectItem value="report_akun">Report Akun</SelectItem>
                </SelectContent>
              </Select>
              {requiresNarration ? (
                <ToggleGroup
                  type="single"
                  variant="outline"
                  spacing={0}
                  value={draft.sentiment || undefined}
                  onValueChange={(value) => setField("sentiment", (value as "positive" | "negative") || "")}
                >
                  <ToggleGroupItem value="positive" aria-label="Pro">
                    👍 Pro
                  </ToggleGroupItem>
                  <ToggleGroupItem value="negative" aria-label="Kontra">
                    👎 Kontra
                  </ToggleGroupItem>
                </ToggleGroup>
              ) : null}
            </div>
            <OrderTargetUrlsField
              value={draft.targetUrls}
              onChange={(targetUrls) => setField("targetUrls", targetUrls)}
            />
            <div className="grid gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor="description">Instruksi</Label>
                {requiresNarration && (draft.sentiment === "positive" || draft.sentiment === "negative") ? (
                  <CommentSentimentBadge sentiment={draft.sentiment} />
                ) : null}
              </div>
              <Textarea
                id="description"
                rows={4}
                placeholder="Opsional — tambahan instruksi untuk anggota"
                value={draft.description}
                onChange={(event) => setField("description", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="datetime-local" value={draft.deadline} onChange={(event) => setField("deadline", event.target.value)} />
            </div>
            {requiresNarration ? (
              <div className="grid gap-2">
                <Label htmlFor="narration">Narasi Komentar</Label>
                <Textarea
                  id="narration"
                  rows={3}
                  placeholder="Teks komentar yang harus digunakan anggota"
                  value={draft.narration}
                  onChange={(event) => setField("narration", event.target.value)}
                />
              </div>
            ) : null}
            {requiresReport ? (
              <div className="grid gap-2">
                <Label htmlFor="reportReason">Alasan Report</Label>
                <Textarea id="reportReason" rows={3} value={draft.reportReason} onChange={(event) => setField("reportReason", event.target.value)} />
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pilih Target</CardTitle>
          </CardHeader>
          <CardContent>
            <TargetPicker units={units} members={members} value={targets} onChange={setTargets} />
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review Perintah</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="text-muted-foreground">Judul:</span> {draft.title}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Jenis:</span>
              <span>{draft.orderType}</span>
              {requiresNarration && (draft.sentiment === "positive" || draft.sentiment === "negative") ? (
                <CommentSentimentBadge sentiment={draft.sentiment} />
              ) : null}
            </div>
            {requiresNarration ? (
              <p><span className="text-muted-foreground">Narasi:</span> {draft.narration || "-"}</p>
            ) : null}
            <div className="space-y-1">
              <p className="text-muted-foreground">URL Target:</p>
              <ul className="space-y-1">
                {draft.targetUrls
                  .filter((item) => item.url.trim())
                  .map((item) => (
                    <li key={item.clientId} className="text-sm">
                      {item.platform}: {item.url}
                    </li>
                  ))}
              </ul>
            </div>
            <p><span className="text-muted-foreground">Target:</span> {targets.length} target</p>
            <p><span className="text-muted-foreground">Deadline:</span> {draft.deadline ? new Date(draft.deadline).toLocaleString("id-ID") : "-"}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" disabled={step === 0 || Boolean(submitting)} onClick={() => setStep((value) => value - 1)}>
          Kembali
        </Button>
        {step < 2 ? (
          <Button type="button" disabled={!canContinue} onClick={() => setStep((value) => value + 1)}>
            Lanjut
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={Boolean(submitting)} onClick={() => submit("draft")}>
              {submitting === "draft" ? <Loader2Icon className="animate-spin" /> : null}
              Simpan Draft
            </Button>
            <Button type="button" disabled={Boolean(submitting)} onClick={() => submit("aktif")}>
              {submitting === "aktif" ? <Loader2Icon className="animate-spin" /> : null}
              Kirim Perintah
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
