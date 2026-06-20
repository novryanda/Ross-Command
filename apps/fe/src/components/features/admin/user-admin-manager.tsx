"use client";

import { useState } from "react";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { UsersAdminTable } from "@/components/features/admin/users-admin-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clientApiFetch } from "@/lib/api/client";
import type { PaginationMeta, Role, UnitNode, UserListItem } from "@/lib/api/types";

type UserFormState = {
  id?: string;
  fullName: string;
  username: string;
  password: string;
  nip: string;
  role: Role;
  unitId: string;
};

const emptyForm: UserFormState = {
  fullName: "",
  username: "",
  password: "",
  nip: "",
  role: "member",
  unitId: "none",
};

function flattenUnits(units: UnitNode[]): UnitNode[] {
  return units.flatMap((unit) => [unit, ...flattenUnits(unit.children ?? [])]);
}

export function UserAdminManager({
  users,
  units,
  pagination,
}: {
  users: UserListItem[];
  units: UnitNode[];
  pagination?: PaginationMeta;
}) {
  const [open, setOpen] = useState(false);
  const [resetUser, setResetUser] = useState<UserListItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const unitOptions = flattenUnits(units);

  function edit(user: UserListItem) {
    setForm({
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      password: "",
      nip: user.nip ?? "",
      role: user.role ?? "member",
      unitId: user.unit?.id ?? "none",
    });
    setOpen(true);
  }

  async function submit() {
    setSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName,
        username: form.username,
        ...(form.id ? {} : { password: form.password }),
        nip: form.nip || undefined,
        role: form.role,
        unitId: form.unitId === "none" ? null : form.unitId,
      };
      await clientApiFetch(form.id ? `/api/v1/users/${form.id}` : "/api/v1/users", {
        method: form.id ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      toast.success(form.id ? "User diperbarui" : "User ditambahkan");
      setOpen(false);
      setForm(emptyForm);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan user");
    } finally {
      setSubmitting(false);
    }
  }

  async function run(path: string, method: string, body?: unknown, success = "Aksi berhasil") {
    try {
      await clientApiFetch(path, { method, body: body ? JSON.stringify(body) : undefined });
      toast.success(success);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Aksi gagal");
    }
  }

  async function submitReset() {
    if (!resetUser) return;
    setSubmitting(true);
    await run("/api/v1/auth/admin/reset-password", "PATCH", { userId: resetUser.id, newPassword }, "Password berhasil direset");
    setSubmitting(false);
    setResetUser(null);
    setNewPassword("");
  }

  return (
    <div className="space-y-4">
      <UsersAdminTable
        users={users}
        pagination={pagination}
        onEdit={edit}
        onResetPassword={setResetUser}
        onUnlock={(user) => run("/api/v1/auth/admin/unlock-user", "POST", { userId: user.id }, "Akun dibuka")}
        onDeactivate={(user) => run(`/api/v1/users/${user.id}`, "DELETE", undefined, "User dinonaktifkan")}
        toolbarActions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="h-8"
                onClick={() => setForm(emptyForm)}
              >
                <PlusIcon className="size-3.5" />
                Tambah User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{form.id ? "Edit User" : "Tambah User"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <Field label="Nama Lengkap" value={form.fullName} onChange={(value) => setForm((current) => ({ ...current, fullName: value }))} />
                <Field label="Username" value={form.username} onChange={(value) => setForm((current) => ({ ...current, username: value }))} />
                {!form.id ? <Field label="Password" type="password" value={form.password} onChange={(value) => setForm((current) => ({ ...current, password: value }))} /> : null}
                <Field label="NIP" value={form.nip} onChange={(value) => setForm((current) => ({ ...current, nip: value }))} />
                <div className="grid gap-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(value) => setForm((current) => ({ ...current, role: value as Role }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Satuan</Label>
                  <Select value={form.unitId} onValueChange={(value) => setForm((current) => ({ ...current, unitId: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tanpa Satuan</SelectItem>
                      {unitOptions.map((unit) => <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button disabled={submitting || !form.fullName || !form.username || (!form.id && !form.password)} onClick={submit}>
                  {submitting ? <Loader2Icon className="animate-spin" /> : null}
                  Simpan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Dialog open={Boolean(resetUser)} onOpenChange={(value) => !value && setResetUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label>Password Baru untuk {resetUser?.fullName}</Label>
            <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetUser(null)}>Batal</Button>
            <Button disabled={submitting || newPassword.length < 8} onClick={submitReset}>
              {submitting ? <Loader2Icon className="animate-spin" /> : null}
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
