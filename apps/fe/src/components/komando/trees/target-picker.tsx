"use client";

import { useEffect, useMemo, useState } from "react";

import { usePagination } from "@/hooks/use-pagination";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UnitNode } from "@/lib/api/types";

export type OrderTargetInput = {
  targetType: "unit" | "individual";
  targetAudience?: "all_members";
  unitId?: string;
  userId?: string;
};

type FlatUnitRow = {
  id: string;
  name: string;
  depthLevel: number;
  parentName: string | null;
  memberCount: number;
  leaderOnlyAssignments: boolean;
};

export function TargetPicker({
  units,
  value,
  onChange,
}: {
  units: UnitNode[];
  value: OrderTargetInput[];
  onChange: (value: OrderTargetInput[]) => void;
}) {
  const rows = useMemo(() => flattenUnits(units), [units]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const selectedUnitIds = useMemo(
    () =>
      value
        .filter((item) => item.targetType === "unit" && item.unitId)
        .map((item) => item.unitId as string),
    [value],
  );
  const normalizedSearch = search.trim().toLowerCase();
  const filteredUnitRows = useMemo(
    () =>
      rows.filter((row) =>
        [row.name, row.parentName ?? ""].some((item) =>
          item.toLowerCase().includes(normalizedSearch),
        ),
      ),
    [normalizedSearch, rows],
  );
  const activeRows = filteredUnitRows.length;
  const selectedCount = filteredUnitRows.filter((row) =>
    selectedUnitIds.includes(row.id),
  ).length;
  const allSelected = activeRows > 0 && selectedCount === activeRows;
  const partiallySelected = selectedCount > 0 && selectedCount < activeRows;
  const totalPages = Math.max(1, Math.ceil(activeRows / pageSize));
  const pagedUnitRows = useMemo(
    () => filteredUnitRows.slice((page - 1) * pageSize, page * pageSize),
    [filteredUnitRows, page, pageSize],
  );
  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: page,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  useEffect(() => {
    setPage(1);
  }, [pageSize, search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function toggleUnit(unitId: string) {
    const exists = value.some(
      (item) => item.targetType === "unit" && item.unitId === unitId,
    );
    if (exists) {
      onChange(value.filter((item) => !(item.targetType === "unit" && item.unitId === unitId)));
      return;
    }

    onChange([
      ...value,
      {
        targetType: "unit",
        unitId,
        targetAudience: "all_members",
      },
    ]);
  }

  function toggleAll(checked: boolean) {
    if (!checked) {
      onChange([]);
      return;
    }

    onChange(
      filteredUnitRows.map((row) => ({
        targetType: "unit" as const,
        unitId: row.id,
        targetAudience: "all_members" as const,
      })),
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/20 p-3 text-sm">
        <p className="font-medium">Pilih satuan target</p>
        <p className="text-muted-foreground text-xs">
          Distribusi tugas per satuan diatur di Manajemen Organisasi. Satuan bertanda
          &quot;Pimpinan saja&quot; akan menerima tugas melalui pimpinan satuan.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nama satuan atau parent..."
          className="max-w-md"
        />
        <Badge variant="secondary" className="ml-auto rounded-sm">
          {value.length} target
        </Badge>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected ? true : partiallySelected ? "indeterminate" : false}
                  onCheckedChange={(checked) => toggleAll(Boolean(checked))}
                  aria-label="Pilih semua satuan"
                />
              </TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead className="w-28">Level</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead className="w-28 text-right">Anggota</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeRows === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-sm">
                  Tidak ada data yang cocok.
                </TableCell>
              </TableRow>
            ) : (
              pagedUnitRows.map((row) => {
                const selected = selectedUnitIds.includes(row.id);

                return (
                  <TableRow
                    key={row.id}
                    data-state={selected ? "selected" : undefined}
                    className="cursor-pointer"
                    onClick={() => toggleUnit(row.id)}
                  >
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => toggleUnit(row.id)}
                        aria-label={`Pilih ${row.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div
                        className="min-w-0"
                        style={{ paddingLeft: `${row.depthLevel * 16}px` }}
                      >
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                          <p className="truncate font-medium">{row.name}</p>
                          {row.leaderOnlyAssignments ? (
                            <Badge variant="secondary" className="h-5 rounded-sm px-1.5 text-[10px]">
                              Pimpinan saja
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>Level {row.depthLevel}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.parentName ?? "-"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.leaderOnlyAssignments ? "Pimpinan" : row.memberCount}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-3 py-3">
          <p className="text-muted-foreground text-xs">
            {selectedCount > 0
              ? `${selectedCount} of ${activeRows} row(s) selected`
              : `${activeRows} row(s) total`}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">Rows</span>
              <Select
                value={String(pageSize)}
                onValueChange={(nextValue) => setPageSize(Number(nextValue))}
              >
                <SelectTrigger size="sm" className="h-7 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <span className="text-muted-foreground hidden text-xs sm:inline">
              Page {page} of {totalPages}
            </span>

            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    aria-disabled={page <= 1}
                    className={`h-7 px-2 text-xs ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
                    onClick={(event) => {
                      event.preventDefault();
                      if (page > 1) setPage((current) => current - 1);
                    }}
                  />
                </PaginationItem>

                {showLeftEllipsis ? (
                  <PaginationItem>
                    <PaginationEllipsis className="size-7" />
                  </PaginationItem>
                ) : null}

                {pages.map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      size="icon"
                      isActive={pageNumber === page}
                      className="size-7 text-xs"
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {showRightEllipsis ? (
                  <PaginationItem>
                    <PaginationEllipsis className="size-7" />
                  </PaginationItem>
                ) : null}

                <PaginationItem>
                  <PaginationNext
                    aria-disabled={page >= totalPages}
                    className={`h-7 px-2 text-xs ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
                    onClick={(event) => {
                      event.preventDefault();
                      if (page < totalPages) setPage((current) => current + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}

function flattenUnits(
  nodes: UnitNode[],
  parentName: string | null = null,
): FlatUnitRow[] {
  return nodes.flatMap((node) => [
    {
      id: node.id,
      name: node.name,
      depthLevel: node.depthLevel,
      parentName,
      memberCount: node.directMembers?.length ?? 0,
      leaderOnlyAssignments: node.leaderOnlyAssignments,
    },
    ...flattenUnits(node.children, node.name),
  ]);
}
