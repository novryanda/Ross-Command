"use client";

import { useState } from "react";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { UnitCombobox } from "@/components/features/admin/unit-combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clientApiFetch } from "@/lib/api/client";
import type { EmploymentType, Gender, Religion, Role, UnitNode } from "@/lib/api/types";
import {
  employmentTypeOptions,
  genderOptions,
  getIdentityNumberLabel,
  getRankOrGradeLabel,
  religionOptions,
} from "@/lib/user-identity";

type UserCreateFormState = {
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

const emptyForm: UserCreateFormState = {
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

export function UserCreateForm({ units }: { units: UnitNode[] }) {
  const [form, setForm] = useState<UserCreateFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const isTni = form.employmentType === "tni";
  const requiredRankOrGrade = isTni ? form.rank.trim() : form.grade.trim();
  const canSubmit =
    form.fullName.trim() &&
    form.username.trim() &&
    form.password.length >= 8 &&
    form.identityNumber.trim() &&
    requiredRankOrGrade;

  function update<K extends keyof UserCreateFormState>(key: K, value: UserCreateFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    setSubmitting(true);
    try {
      await clientApiFetch("/api/v1/users", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName,
          username: form.username,
          password: form.password,
          gender: form.gender,
          employmentType: form.employmentType,
          identityNumber: form.identityNumber,
          rank: isTni ? form.rank : null,
          grade: isTni ? null : form.grade,
          religion: form.religion === "none" ? null : form.religion,
          phoneNumber: form.phoneNumber.trim() || null,
          role: form.role,
          unitId: form.unitId === "none" ? null : form.unitId,
        }),
      });
      toast.success("User ditambahkan");
      router.push("/admin/users");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menambahkan user");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Informasi User</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nama Lengkap" value={form.fullName} onChange={(value) => update("fullName", value)} />
          <Field label="Username" value={form.username} onChange={(value) => update("username", value)} />
          <Field label="Password" type="password" value={form.password} onChange={(value) => update("password", value)} />
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(value) => update("role", value as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Jenis Kelamin</Label>
            <RadioGroup
              value={form.gender}
              onValueChange={(value) => update("gender", value as Gender)}
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {employmentTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Field
            label={getIdentityNumberLabel(form.employmentType)}
            value={form.identityNumber}
            onChange={(value) => update("identityNumber", value)}
          />
          <Field
            label={getRankOrGradeLabel(form.employmentType)}
            value={isTni ? form.rank : form.grade}
            onChange={(value) => update(isTni ? "rank" : "grade", value)}
          />
          <div className="grid gap-2">
            <Label>Agama</Label>
            <Select value={form.religion} onValueChange={(value) => update("religion", value as Religion | "none")}>
              <SelectTrigger>
                <SelectValue placeholder="Opsional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak diisi</SelectItem>
                {religionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Field label="Nomor HP" value={form.phoneNumber} onChange={(value) => update("phoneNumber", value)} placeholder="Opsional" />
          <div className="grid gap-2 md:col-span-2">
            <Label>Satuan</Label>
            <UnitCombobox units={units} value={form.unitId} onValueChange={(value) => update("unitId", value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
            Batal
          </Button>
          <Button type="button" disabled={submitting || !canSubmit} onClick={submit}>
            {submitting ? <Loader2Icon className="animate-spin" /> : <SaveIcon className="size-4" />}
            Simpan
          </Button>
        </div>
      </CardContent>
    </Card>
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
