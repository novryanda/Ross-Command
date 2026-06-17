"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

export function SubmitProofDialog({ assignmentId }: { assignmentId: string }) {
  const [open, setOpen] = useState(false);
  const [driveLink, setDriveLink] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function submit() {
    setSubmitting(true);
    try {
      await clientApiFetch(`/api/v1/assignments/me/${assignmentId}/submit`, {
        method: "POST",
        body: JSON.stringify({ driveLink, notes: notes || undefined }),
      });
      toast.success("Bukti berhasil dikirim");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengirim bukti");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Submit Bukti</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Bukti Pelaksanaan</DialogTitle>
          <DialogDescription>Masukkan link Google Drive atau dokumen bukti yang dapat dibuka komandan.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="driveLink">Link Bukti</Label>
            <Input id="driveLink" type="url" value={driveLink} onChange={(event) => setDriveLink(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea id="notes" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button onClick={submit} disabled={submitting || !driveLink}>
            {submitting ? <Loader2Icon className="animate-spin" /> : null}
            Kirim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
