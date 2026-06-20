"use client";

import { useState } from "react";
import { LayoutGridIcon, Loader2Icon, PlusIcon, TableIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { UnitAdminTree } from "@/components/features/admin/unit-admin-tree";
import { UnitDetailSheet } from "@/components/features/admin/unit-detail-sheet";
import { UnitsAdminTable } from "@/components/features/admin/units-admin-table";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { clientApiFetch } from "@/lib/api/client";
import type { UnitNode, UserListItem } from "@/lib/api/types";

function flattenUnits(units: UnitNode[]): UnitNode[] {
  return units.flatMap((unit) => [unit, ...flattenUnits(unit.children ?? [])]);
}

export function UnitAdminManager({ units }: { units: UnitNode[]; users: UserListItem[] }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitNode | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [form, setForm] = useState({
    parentId: "root",
    name: "",
    description: "",
  });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const unitOptions = flattenUnits(units);
  const viewParam = searchParams.get("view");
  const view = viewParam === "card" ? "card" : "table";

  function setView(nextView: "card" | "table") {
    const params = new URLSearchParams(searchParams.toString());
    if (nextView === "table") {
      params.delete("view");
    } else {
      params.set("view", nextView);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function openDetail(unit: UnitNode) {
    setSelectedUnit(unit);
    setDetailOpen(true);
  }

  async function submit() {
    setSubmitting(true);
    try {
      await clientApiFetch("/api/v1/units", {
        method: "POST",
        body: JSON.stringify({
          parentId: form.parentId === "root" ? null : form.parentId,
          name: form.name,
          description: form.description || undefined,
        }),
      });
      toast.success("Satuan ditambahkan");
      setOpen(false);
      setForm({ parentId: "root", name: "", description: "" });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menambah satuan");
    } finally {
      setSubmitting(false);
    }
  }

  const addUnitButton = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8">
          <PlusIcon className="size-3.5" />
          Tambah Satuan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Satuan</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Parent</Label>
            <Select value={form.parentId} onValueChange={(value) => setForm((current) => ({ ...current, parentId: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="root">Root</SelectItem>
                {unitOptions.map((unit) => <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Nama Satuan</Label>
            <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Deskripsi</Label>
            <Textarea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button disabled={submitting || !form.name} onClick={submit}>
            {submitting ? <Loader2Icon className="animate-spin" /> : null}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-4">
      <Tabs value={view} onValueChange={(value) => setView(value as "card" | "table")} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="grid h-auto grid-cols-2 gap-1 p-1">
            <TabsTrigger value="table" className="min-w-24">
              <TableIcon className="size-4" />
              Table
            </TabsTrigger>
            <TabsTrigger value="card" className="min-w-24">
              <LayoutGridIcon className="size-4" />
              Card
            </TabsTrigger>
          </TabsList>
          {units.length ? null : addUnitButton}
        </div>

        <TabsContent value="card" className="space-y-4">
          {units.length ? (
            <>
              <div className="flex justify-end">{addUnitButton}</div>
              <Card>
                <CardContent className="p-4">
                  <UnitAdminTree nodes={units} onSelect={openDetail} />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-muted-foreground p-6 text-center text-sm">
                Belum ada satuan. Tambahkan satuan root untuk memulai struktur organisasi.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="table">
          {units.length ? (
            <UnitsAdminTable units={units} onSelect={openDetail} toolbarActions={addUnitButton} />
          ) : (
            <Card>
              <CardContent className="text-muted-foreground p-6 text-center text-sm">
                Belum ada satuan. Tambahkan satuan root untuk memulai struktur organisasi.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <UnitDetailSheet
        unit={selectedUnit}
        units={units}
        open={detailOpen}
        onOpenChange={(value) => {
          setDetailOpen(value);
          if (!value) setSelectedUnit(null);
        }}
      />
    </div>
  );
}
