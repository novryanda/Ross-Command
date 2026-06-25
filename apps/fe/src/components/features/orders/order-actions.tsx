"use client";

import { DownloadIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { clientApiFetch } from "@/lib/api/client";
import type { OrderDetail } from "@/lib/api/types";

export function OrderActions({ order }: { order: OrderDetail }) {
  const [loading, setLoading] = useState<"send" | "cancel" | "export" | null>(null);
  const router = useRouter();

  async function run(action: "send" | "cancel") {
    setLoading(action);
    try {
      await clientApiFetch(`/api/v1/orders/${order.id}/${action === "send" ? "send" : "cancel"}`, {
        method: "POST",
      });
      toast.success(action === "send" ? "Tugas berhasil dikirim" : "Tugas berhasil dibatalkan");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Aksi gagal diproses");
    } finally {
      setLoading(null);
    }
  }

  async function exportExcel() {
    setLoading("export");
    try {
      const response = await fetch(`/api/v1/orders/${order.id}/assignments/export`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
        throw new Error(payload?.error?.message ?? "Export Excel gagal diproses");
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const disposition = response.headers.get("content-disposition");
      const fileNameMatch = disposition?.match(/filename="?([^"]+)"?/i);
      const fileName = fileNameMatch?.[1] ?? `order-${order.id}-progress.xlsx`;

      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);

      toast.success("File Excel berhasil diunduh");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export Excel gagal diproses");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {order.status === "draft" ? (
        <Button size="sm" disabled={Boolean(loading)} onClick={() => run("send")}>
          {loading === "send" ? <Loader2Icon className="animate-spin" /> : null}
          Kirim
        </Button>
      ) : null}
      {order.status === "aktif" ? (
        <Button size="sm" variant="destructive" disabled={Boolean(loading)} onClick={() => run("cancel")}>
          {loading === "cancel" ? <Loader2Icon className="animate-spin" /> : null}
          Batalkan
        </Button>
      ) : null}
      <Button size="sm" variant="outline" disabled={Boolean(loading)} onClick={exportExcel}>
        {loading === "export" ? <Loader2Icon className="animate-spin" /> : <DownloadIcon />}
        Export Excel
      </Button>
    </div>
  );
}
