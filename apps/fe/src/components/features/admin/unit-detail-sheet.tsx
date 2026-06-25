"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon, PencilIcon, UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { clientApiFetch } from "@/lib/api/client";
import type { UnitDetail, UnitNode } from "@/lib/api/types";

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

type UnitDetailSheetProps = {
  unit: UnitNode | null;
  units: UnitNode[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function flattenUnits(units: UnitNode[]): UnitNode[] {
  return units.flatMap((item) => [item, ...flattenUnits(item.children ?? [])]);
}

export function UnitDetailSheet({ unit, units, open, onOpenChange }: UnitDetailSheetProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    parentId: "root",
    description: "",
    commanderId: "none",
    leaderOnlyAssignments: false,
  });
  const detailQuery = useQuery({
    queryKey: ["units", "detail", unit?.id],
    queryFn: async () => (await clientApiFetch<UnitDetail>(`/api/v1/units/${unit!.id}`)).data,
    enabled: open && Boolean(unit?.id),
  });

  const detail = detailQuery.data;
  const unitOptions = flattenUnits(units).filter(
    (item) => item.id !== detail?.id && !item.path.startsWith(detail?.path ?? "__"),
  );

  useEffect(() => {
    if (!detail) return;
    setForm({
      name: detail.name,
      parentId: detail.parent?.id ?? "root",
      description: detail.description ?? "",
      commanderId: detail.commander?.id ?? "none",
      leaderOnlyAssignments: detail.leaderOnlyAssignments,
    });
  }, [detail]);

  async function save() {
    if (!detail) return;
    setSaving(true);
    try {
      await clientApiFetch(`/api/v1/units/${detail.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name,
          parentId: form.parentId === "root" ? null : form.parentId,
          description: form.description || null,
          commanderId: form.commanderId === "none" ? null : form.commanderId,
          leaderOnlyAssignments: form.leaderOnlyAssignments,
        }),
      });
      toast.success("Satuan berhasil diperbarui");
      setEditing(false);
      await detailQuery.refetch();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui satuan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b p-5 pb-4">
          <SheetTitle>{unit?.name ?? "Detail Satuan"}</SheetTitle>
          <SheetDescription>
            Informasi satuan, pimpinan, dan daftar anggota aktif.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5">
          {detailQuery.isLoading ? (
            <div className="text-muted-foreground flex min-h-40 items-center justify-center gap-2 text-sm">
              <Loader2Icon className="size-4 animate-spin" />
              Memuat detail satuan...
            </div>
          ) : detailQuery.isError ? (
            <p className="text-destructive text-sm">Gagal memuat detail satuan.</p>
          ) : detail ? (
            <div className="space-y-6">
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium">Informasi Umum</h3>
                  <Button size="sm" variant="outline" onClick={() => setEditing((value) => !value)}>
                    <PencilIcon className="size-3.5" />
                    {editing ? "Batal Edit" : "Edit"}
                  </Button>
                </div>
                {editing ? (
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="unit-name">Nama Satuan</Label>
                      <Input
                        id="unit-name"
                        value={form.name}
                        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Parent</Label>
                      <Select value={form.parentId} onValueChange={(value) => setForm((current) => ({ ...current, parentId: value }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="root">Root</SelectItem>
                          {unitOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.depthLevel > 0 ? `${"- ".repeat(option.depthLevel)}${option.name}` : option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Deskripsi</Label>
                      <Textarea
                        rows={3}
                        value={form.description}
                        onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Pimpinan</Label>
                      <Select
                        value={form.commanderId}
                        onValueChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            commanderId: value,
                            leaderOnlyAssignments:
                              value === "none" ? false : current.leaderOnlyAssignments,
                          }))
                        }
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Tanpa Pimpinan</SelectItem>
                          {detail.members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                      <div className="grid gap-1">
                        <Label htmlFor="leader-only-assignments">
                          Tugas hanya diberikan ke pimpinan.</Label>
                        <p className="text-muted-foreground text-xs">
                          Jika diaktifkan, hanya pimpinan satuan ini yang dapat menerima tugas dari atasan.
                        </p>
                      </div>
                      <Switch
                        id="leader-only-assignments"
                        checked={form.leaderOnlyAssignments}
                        disabled={form.commanderId === "none"}
                        onCheckedChange={(checked) =>
                          setForm((current) => ({
                            ...current,
                            leaderOnlyAssignments: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <dl className="grid gap-3 text-sm">
                    <InfoRow label="Nama" value={detail.name} />
                    <InfoRow label="Level" value={`Level ${detail.depthLevel}`} />
                    <InfoRow label="Parent" value={detail.parent?.name ?? "Root"} />
                    <InfoRow label="Pimpinan" value={detail.commander?.fullName ?? "Belum ditetapkan"} />
                    <div className="grid gap-1">
                      <dt className="text-muted-foreground text-xs">Distribusi Tugas</dt>
                      <dd>
                        {detail.leaderOnlyAssignments ? (
                          <Badge variant="secondary" className="rounded-sm">
                            Pimpinan saja
                          </Badge>
                        ) : (
                          <span className="text-sm">Seluruh anggota</span>
                        )}
                      </dd>
                    </div>
                    <InfoRow label="Deskripsi" value={detail.description?.trim() || "Tidak ada deskripsi"} />
                  </dl>
                )}
              </section>

              <Separator />

              <section className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium">Anggota Aktif</h3>
                  <Badge variant="secondary" className="gap-1 rounded-sm">
                    <UsersIcon className="size-3" />
                    {detail.members.length}
                  </Badge>
                </div>

                {detail.members.length ? (
                  <ul className="divide-border divide-y rounded-md border">
                    {detail.members.map((member) => (
                      <li key={member.id} className="flex items-center justify-between gap-3 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{member.fullName}</p>
                          <p className="text-muted-foreground truncate text-xs">@{member.username}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="h-5 rounded-sm px-1.5 text-[10px] capitalize">
                            {member.role ?? "member"}
                          </Badge>
                          <p className="text-muted-foreground mt-1 text-[10px]">
                            Bergabung {formatDate(member.joinedAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">Belum ada anggota di satuan ini.</p>
                )}
              </section>

              <Separator />

              <section className="space-y-2">
                <h3 className="text-sm font-medium">Metadata</h3>
                <dl className="grid gap-2 text-sm">
                  <InfoRow label="Dibuat" value={formatDate(detail.createdAt)} />
                  <InfoRow label="Diperbarui" value={formatDate(detail.updatedAt)} />
                </dl>
              </section>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t p-3">
          {editing ? (
            <Button size="sm" disabled={saving || !form.name.trim()} onClick={save}>
              {saving ? <Loader2Icon className="animate-spin" /> : null}
              Simpan
            </Button>
          ) : null}
          {detail?.commander?.id ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/users/${detail.commander.id}`}>Profil Pimpinan</Link>
            </Button>
          ) : null}
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}
