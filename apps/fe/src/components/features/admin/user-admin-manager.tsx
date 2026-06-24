"use client";

import { useState } from "react";
import { Loader2Icon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { UnitCombobox } from "@/components/features/admin/unit-combobox";
import { UsersAdminTable } from "@/components/features/admin/users-admin-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clientApiFetch } from "@/lib/api/client";
import type { EmploymentType, Gender, PaginationMeta, Religion, Role, UnitNode, UserListItem } from "@/lib/api/types";
import {
  employmentTypeOptions,
  genderOptions,
  getIdentityNumberLabel,
  getRankOrGradeLabel,
  religionOptions,
} from "@/lib/user-identity";

type UserFormState = {
  id?: string;
  fullName: string;
  username: string;
  password: string;
  gender: Gender;
  employmentType: EmploymentType;
  identityNumber: string;
  rank: string;
  grade: string;
  religion: Religion | "none";
  phoneNumber: string;
  role: Role;
  unitId: string;
};

const emptyForm: UserFormState = {
  fullName: "",
  username: "",
  password: "",
  gender: "pria",
  employmentType: "tni",
  identityNumber: "",
  rank: "",
  grade: "",
  religion: "none",
  phoneNumber: "",
  role: "member",
  unitId: "none",
};

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
  const isTni = form.employmentType === "tni";

  function edit(user: UserListItem) {
    setForm({
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      password: "",
      gender: user.gender ?? "pria",
      employmentType: user.employmentType ?? "tni",
      identityNumber: user.identityNumber ?? "",
      rank: user.rank ?? "",
      grade: user.grade ?? "",
      religion: user.religion ?? "none",
      phoneNumber: user.phoneNumber ?? "",
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
        gender: form.gender,
        employmentType: form.employmentType,
        identityNumber: form.identityNumber || null,
        rank: form.employmentType === "tni" ? form.rank : null,
        grade: form.employmentType === "tni" ? null : form.grade,
        religion: form.religion === "none" ? null : form.religion,
        phoneNumber: form.phoneNumber.trim() || null,
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
          <Button asChild size="sm" className="h-8">
            <Link href="/admin/users/new">
              <PlusIcon className="size-3.5" />
              Tambah User
            </Link>
          </Button>
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nama Lengkap" value={form.fullName} onChange={(value) => setForm((current) => ({ ...current, fullName: value }))} />
                <Field label="Username" value={form.username} onChange={(value) => setForm((current) => ({ ...current, username: value }))} />
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
                  <Label>Jenis Kelamin</Label>
                  <RadioGroup
                    value={form.gender}
                    onValueChange={(value) => setForm((current) => ({ ...current, gender: value as Gender }))}
                    className="flex flex-wrap gap-4 rounded-md border px-3 py-2"
                  >
                    {genderOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value={option.value} />
                        {option.label}
                      </label>
                    ))}
                  </RadioGroup>
                </div>
                <div className="grid gap-2">
                  <Label>Jenis Pekerjaan</Label>
                  <Select
                    value={form.employmentType}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        employmentType: value as EmploymentType,
                        rank: value === "tni" ? current.rank : "",
                        grade: value === "tni" ? "" : current.grade,
                      }))
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {employmentTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Field label={getIdentityNumberLabel(form.employmentType)} value={form.identityNumber} onChange={(value) => setForm((current) => ({ ...current, identityNumber: value }))} />
                <Field label={getRankOrGradeLabel(form.employmentType)} value={isTni ? form.rank : form.grade} onChange={(value) => setForm((current) => ({ ...current, [isTni ? "rank" : "grade"]: value }))} />
                <div className="grid gap-2">
                  <Label>Agama</Label>
                  <Select value={form.religion} onValueChange={(value) => setForm((current) => ({ ...current, religion: value as Religion | "none" }))}>
                    <SelectTrigger><SelectValue placeholder="Opsional" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak diisi</SelectItem>
                      {religionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Field label="Nomor HP" value={form.phoneNumber} placeholder="Opsional" onChange={(value) => setForm((current) => ({ ...current, phoneNumber: value }))} />
                <div className="grid gap-2 md:col-span-2">
                  <Label>Satuan</Label>
                  <UnitCombobox units={units} value={form.unitId} onValueChange={(value) => setForm((current) => ({ ...current, unitId: value }))} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button disabled={submitting || !form.fullName || !form.username || !form.identityNumber || (isTni ? !form.rank : !form.grade)} onClick={submit}>
                  {submitting ? <Loader2Icon className="animate-spin" /> : null}
                  Simpan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
