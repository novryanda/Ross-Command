"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon, UsersIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UnitDetailSheet({ unit, open, onOpenChange }: UnitDetailSheetProps) {
  const detailQuery = useQuery({
    queryKey: ["units", "detail", unit?.id],
    queryFn: async () => (await clientApiFetch<UnitDetail>(`/api/v1/units/${unit!.id}`)).data,
    enabled: open && Boolean(unit?.id),
  });

  const detail = detailQuery.data;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b p-5 pb-4">
          <SheetTitle>{unit?.name ?? "Detail Satuan"}</SheetTitle>
          <SheetDescription>
            Informasi satuan, komandan, dan daftar anggota aktif.
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
                <h3 className="text-sm font-medium">Informasi Umum</h3>
                <dl className="grid gap-3 text-sm">
                  <InfoRow label="Nama" value={detail.name} />
                  <InfoRow label="Level" value={`Level ${detail.depthLevel}`} />
                  <InfoRow label="Parent" value={detail.parent?.name ?? "Root"} />
                  <InfoRow label="Komandan" value={detail.commander?.fullName ?? "Belum ditetapkan"} />
                  <InfoRow label="Deskripsi" value={detail.description?.trim() || "Tidak ada deskripsi"} />
                </dl>
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
          {detail?.commander?.id ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/users/${detail.commander.id}`}>Profil Komandan</Link>
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
