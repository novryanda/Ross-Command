"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

export function PasswordSettingsForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak sama");
      return;
    }

    setSubmitting(true);
    const result = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setSubmitting(false);

    if (result.error) {
      toast.error(result.error.message ?? "Password gagal diubah");
      return;
    }

    toast.success("Password berhasil diubah");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Ubah password secara berkala untuk menjaga keamanan akun.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-2">
            <Label>Password Saat Ini</Label>
            <Input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Password Baru</Label>
            <Input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            <p className="text-muted-foreground text-xs">Minimal 8 karakter.</p>
          </div>
          <div className="grid gap-2">
            <Label>Konfirmasi Password Baru</Label>
            <Input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </div>
          <Separator />
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting || !currentPassword || newPassword.length < 8 || !confirmPassword}>
              {submitting ? <Loader2Icon className="animate-spin" /> : null}
              Perbarui password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
