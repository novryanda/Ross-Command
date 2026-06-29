"use client";

import { useMemo, useState } from "react";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { TargetPicker, type OrderTargetInput } from "@/components/komando/trees/target-picker";
import {
  OrderPostingFields,
  hasValidPostingDraft,
} from "@/components/features/orders/order-posting-fields";
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
import { Stepper } from "@/components/wizard-stepper";
import { clientApiFetch } from "@/lib/api/client";
import type { Order, OrderType, SocialPlatform, UnitNode } from "@/lib/api/types";

const BLASTING_ACTIONS = ["like", "share", "repost"] as const;

const defaultDescription: Record<Exclude<OrderType, "posting">, string> = {
  engagement: "Lakukan like, share, dan repost pada URL target.",
  blasting: "Lakukan like, share, dan repost pada URL target.",
  counter: "Berikan counter narasi sesuai instruksi pada URL target.",
  report_akun: "Laporkan akun target sesuai alasan yang ditentukan.",
};

const steps = [
  { id: "detail", title: "Detail", description: "Jenis dan instruksi" },
  { id: "target", title: "Target", description: "Satuan target" },
  { id: "review", title: "Review", description: "Simpan atau kirim" },
];

function resolveDescription(orderType: OrderType, description: string) {
  const trimmed = description.trim();
  if (orderType === "posting") {
    return trimmed;
  }

  return trimmed.length >= 3 ? trimmed : defaultDescription[orderType];
}

type OrderDraft = {
  title: string;
  orderType: OrderType;
  description: string;
  targetUrls: OrderTargetUrlDraft[];
  postingSourceUrl: string;
  postingTargetPlatforms: SocialPlatform[];
  deskripsi: string;
  narration: string;
  engagementActions: string[];
  reportReason: string;
  deadline: string;
};

export function OrderForm({
  units,
  initialOrderType = "posting",
}: {
  units: UnitNode[];
  currentUserId?: string;
  initialOrderType?: OrderType;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState<"draft" | "aktif" | null>(null);
  const [targets, setTargets] = useState<OrderTargetInput[]>([]);
  const [draft, setDraft] = useState<OrderDraft>({
    title: "",
    orderType: initialOrderType,
    description: "",
    targetUrls: [createTargetUrlDraft()],
    postingSourceUrl: "",
    postingTargetPlatforms: [],
    deskripsi: "",
    narration: "",
    engagementActions: [],
    reportReason: "",
    deadline: "",
  });

  const isPosting = draft.orderType === "posting";
  const isBlasting = draft.orderType === "engagement" || draft.orderType === "blasting";
  const requiresNarration = draft.orderType === "counter";
  const requiresReport = draft.orderType === "report_akun";

  const canContinue = useMemo(() => {
    if (step === 0) {
      if (draft.title.length < 3 || !draft.deadline) return false;

      if (isPosting) {
        return hasValidPostingDraft({
          postingSourceUrl: draft.postingSourceUrl,
          postingTargetPlatforms: draft.postingTargetPlatforms,
          deskripsi: draft.deskripsi,
        });
      }

      if (!hasValidTargetUrls(draft.targetUrls)) return false;
      if (requiresNarration) {
        return draft.narration.length >= 3;
      }
      if (requiresReport) return draft.reportReason.length >= 3;
      return true;
    }
    if (step === 1) return targets.length > 0;
    return true;
  }, [draft, isPosting, requiresNarration, requiresReport, step, targets.length]);

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
      const payload = isPosting
        ? {
            title: draft.title,
            orderType: draft.orderType,
            description: draft.deskripsi.trim(),
            postingSourceUrl: draft.postingSourceUrl.trim() || undefined,
            postingTargetPlatforms: draft.postingTargetPlatforms,
            targetUrls: [],
            narration: draft.description.trim() || undefined,
            deadline: new Date(draft.deadline).toISOString(),
            status,
            targets,
          }
        : {
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
            engagementActions:
              isBlasting ? [...BLASTING_ACTIONS] : undefined,
            reportReason: draft.reportReason || undefined,
            deadline: new Date(draft.deadline).toISOString(),
            status,
            targets,
          };
      const response = await clientApiFetch<Order>("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success(status === "aktif" ? "Tugas berhasil dibuat dan dikirim" : "Draft tugas berhasil dibuat");
      router.push(`/orders/${response.data.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat tugas");
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
            <CardTitle className="text-base">Detail Tugas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Judul</Label>
              <Input id="title" value={draft.title} onChange={(event) => setField("title", event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Jenis Tugas</Label>
              <Select
                value={draft.orderType}
                onValueChange={(value) => {
                  const orderType = value as OrderType;
                  setDraft((current) => ({
                    ...current,
                    orderType,
                    engagementActions: orderType === "blasting" ? [...BLASTING_ACTIONS] : [],
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="posting">Posting</SelectItem>
                  <SelectItem value="blasting">Blasting</SelectItem>
                  <SelectItem value="counter">Counter</SelectItem>
                  <SelectItem value="report_akun">Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!isPosting ? (
              <OrderTargetUrlsField
                value={draft.targetUrls}
                onChange={(targetUrls) => setField("targetUrls", targetUrls)}
                showApifyNotice={isBlasting}
              />
            ) : (
              <OrderPostingFields
                postingSourceUrl={draft.postingSourceUrl}
                postingTargetPlatforms={draft.postingTargetPlatforms}
                deskripsi={draft.deskripsi}
                onPostingSourceUrlChange={(value) => setField("postingSourceUrl", value)}
                onPostingTargetPlatformsChange={(value) => setField("postingTargetPlatforms", value)}
                onDeskripsiChange={(value) => setField("deskripsi", value)}
              />
            )}
            <div className="grid gap-2">
              <Label htmlFor="description">Instruksi</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Opsional - tambahan instruksi untuk anggota"
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
                <Label htmlFor="narration">Narasi Counter</Label>
                <Textarea
                  id="narration"
                  rows={3}
                  placeholder="Teks counter narasi yang harus digunakan anggota"
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
            <TargetPicker units={units} value={targets} onChange={setTargets} />
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review Tugas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="text-muted-foreground">Judul:</span> {draft.title}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Jenis:</span>
              <span>{draft.orderType}</span>
            </div>
            {requiresNarration ? (
              <p><span className="text-muted-foreground">Narasi:</span> {draft.narration || "-"}</p>
            ) : null}
            {isPosting ? (
              <>
                <p><span className="text-muted-foreground">Sumber Posting:</span> {draft.postingSourceUrl || "-"}</p>
                <p>
                  <span className="text-muted-foreground">Target Sosmed:</span>{" "}
                  {draft.postingTargetPlatforms.length
                    ? draft.postingTargetPlatforms.join(", ")
                    : "-"}
                </p>
                <p><span className="text-muted-foreground">Deskripsi:</span> {draft.deskripsi || "-"}</p>
                <p><span className="text-muted-foreground">Instruksi:</span> {draft.description || "-"}</p>
              </>
            ) : (
              <div className="space-y-1">
                <p className="text-muted-foreground">URL Target:</p>
                <ul className="space-y-1">
                  {draft.targetUrls
                    .filter((item) => item.url.trim())
                    .map((item) => (
                      <li key={item.clientId} className="text-sm">
                        <div>{item.platform}: {item.url}</div>
                        {isBlasting ? (
                          <div className="text-muted-foreground text-xs">
                            Metrik akan diambil otomatis oleh Apify setelah tugas dikirim.
                          </div>
                        ) : null}
                      </li>
                    ))}
                </ul>
              </div>
            )}
            <p>
              <span className="text-muted-foreground">Satuan target:</span>{" "}
              {targets.length} satuan
            </p>
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
              Kirim Tugas
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
