"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { clientApiFetch } from "@/lib/api/client";
import type { OrderDetail } from "@/lib/api/types";

export function OrderActions({ order }: { order: OrderDetail }) {
  const [loading, setLoading] = useState<"send" | "cancel" | null>(null);
  const router = useRouter();

  async function run(action: "send" | "cancel") {
    setLoading(action);
    try {
      await clientApiFetch(`/api/v1/orders/${order.id}/${action === "send" ? "send" : "cancel"}`, {
        method: "POST",
      });
      toast.success(action === "send" ? "Perintah berhasil dikirim" : "Perintah berhasil dibatalkan");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Aksi gagal diproses");
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
      <Button size="sm" variant="outline" asChild>
        <a href={`/api/v1/orders/${order.id}/assignments/export`}>Export Excel</a>
      </Button>
    </div>
  );
}
