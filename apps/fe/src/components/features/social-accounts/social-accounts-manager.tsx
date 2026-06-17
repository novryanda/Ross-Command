"use client";

import { useState } from "react";
import { Loader2Icon, MoreVerticalIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PlatformBadge } from "@/components/komando/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { clientApiFetch } from "@/lib/api/client";
import type { SocialAccount, SocialPlatform } from "@/lib/api/types";

const platforms: SocialPlatform[] = ["instagram", "twitter_x", "facebook", "tiktok", "youtube", "other"];

type FormState = {
  id?: string;
  platform: SocialPlatform;
  username: string;
  profileUrl: string;
  notes: string;
};

const emptyForm: FormState = {
  platform: "instagram",
  username: "",
  profileUrl: "",
  notes: "",
};

export function SocialAccountsManager({ accounts }: { accounts: SocialAccount[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  function edit(account: SocialAccount) {
    setForm({
      id: account.id,
      platform: account.platform,
      username: account.username,
      profileUrl: account.profileUrl ?? "",
      notes: account.notes ?? "",
    });
    setOpen(true);
  }

  async function submit() {
    setSubmitting(true);
    try {
      const path = form.id ? `/api/v1/social-accounts/${form.id}` : "/api/v1/social-accounts";
      await clientApiFetch(path, {
        method: form.id ? "PATCH" : "POST",
        body: JSON.stringify({
          platform: form.platform,
          username: form.username,
          profileUrl: form.profileUrl || undefined,
          notes: form.notes || undefined,
        }),
      });
      toast.success(form.id ? "Akun sosmed diperbarui" : "Akun sosmed ditambahkan");
      setOpen(false);
      setForm(emptyForm);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan akun sosmed");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    try {
      await clientApiFetch(`/api/v1/social-accounts/${id}`, { method: "DELETE" });
      toast.success("Akun sosmed dihapus");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus akun sosmed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setForm(emptyForm)}>
              <PlusIcon className="size-4" />
              Tambah Akun
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit Akun Sosmed" : "Tambah Akun Sosmed"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Platform</Label>
                <Select value={form.platform} onValueChange={(value) => setForm((current) => ({ ...current, platform: value as SocialPlatform }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Username</Label>
                <Input value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>URL Profil</Label>
                <Input type="url" value={form.profileUrl} onChange={(event) => setForm((current) => ({ ...current, profileUrl: event.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Catatan</Label>
                <Textarea rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button disabled={submitting || !form.username} onClick={submit}>
                {submitting ? <Loader2Icon className="animate-spin" /> : null}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0 space-y-1">
                <PlatformBadge platform={account.platform} />
                <p className="truncate font-medium">{account.username}</p>
                {account.profileUrl ? (
                  <a href={account.profileUrl} target="_blank" rel="noreferrer" className="text-primary block truncate text-xs hover:underline">
                    {account.profileUrl}
                  </a>
                ) : null}
                {account.notes ? <p className="text-muted-foreground text-xs">{account.notes}</p> : null}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreVerticalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => edit(account)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => remove(account.id)}>Hapus</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
