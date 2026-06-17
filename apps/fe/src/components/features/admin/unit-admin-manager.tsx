"use client";

import { useState } from "react";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
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

export function UnitAdminManager({ units, users }: { units: UnitNode[]; users: UserListItem[] }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitNode | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [form, setForm] = useState({
    parentId: "root",
    name: "",
    description: "",
    commanderId: "none",
  });
  const router = useRouter();
  const unitOptions = flattenUnits(units);

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
          commanderId: form.commanderId === "none" ? null : form.commanderId,
        }),
      });
      toast.success("Satuan ditambahkan");
      setOpen(false);
      setForm({ parentId: "root", name: "", description: "", commanderId: "none" });
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
          <div className="grid gap-2">
            <Label>Komandan</Label>
            <Select value={form.commanderId} onValueChange={(value) => setForm((current) => ({ ...current, commanderId: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tanpa Komandan</SelectItem>
                {users.map((user) => <SelectItem key={user.id} value={user.id}>{user.fullName}</SelectItem>)}
              </SelectContent>
            </Select>
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
      <Tabs defaultValue="tree" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="tree">Tree</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
          {units.length ? null : addUnitButton}
        </div>

        <TabsContent value="tree" className="space-y-4">
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
        open={detailOpen}
        onOpenChange={(value) => {
          setDetailOpen(value);
          if (!value) setSelectedUnit(null);
        }}
      />
    </div>
  );
}
