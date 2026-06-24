"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ExpandedState,
} from "@tanstack/react-table";
import { ChevronRightIcon, EllipsisVerticalIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UnitNode } from "@/lib/api/types";
import { cn } from "@/lib/utils";

function buildParentMap(nodes: UnitNode[], parentName = "—"): Map<string, string> {
  const map = new Map<string, string>();

  for (const node of nodes) {
    map.set(node.id, parentName);
    const childMap = buildParentMap(node.children ?? [], node.name);
    childMap.forEach((value, key) => map.set(key, value));
  }

  return map;
}

function buildDefaultExpanded(nodes: UnitNode[]): ExpandedState {
  const expanded: Record<string, boolean> = {};

  function walk(items: UnitNode[]) {
    for (const node of items) {
      if (node.children?.length && node.depthLevel < 1) {
        expanded[node.id] = true;
      }
      walk(node.children ?? []);
    }
  }

  walk(nodes);
  return expanded;
}

type UnitsAdminTableProps = {
  units: UnitNode[];
  toolbarActions?: ReactNode;
  onSelect: (unit: UnitNode) => void;
};

export function UnitsAdminTable({ units, toolbarActions, onSelect }: UnitsAdminTableProps) {
  const [expanded, setExpanded] = useState<ExpandedState>(() => buildDefaultExpanded(units));
  const [globalFilter, setGlobalFilter] = useState("");
  const parentMap = useMemo(() => buildParentMap(units), [units]);

  const columns = useMemo<ColumnDef<UnitNode>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Satuan",
        cell: ({ row }) => (
          <div
            className="flex min-w-0 items-center gap-1"
            style={{ paddingLeft: `${row.depth * 16}px` }}
          >
            {row.getCanExpand() ? (
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                aria-label={row.getIsExpanded() ? "Tutup sub-satuan" : "Buka sub-satuan"}
                onClick={row.getToggleExpandedHandler()}
              >
                <ChevronRightIcon
                  className={cn("size-4 transition-transform", row.getIsExpanded() && "rotate-90")}
                />
              </Button>
            ) : (
              <span className="size-7 shrink-0" />
            )}
            <button
              type="button"
              className="min-w-0 text-left"
              onClick={() => onSelect(row.original)}
            >
              <span className="block truncate text-sm font-medium">{row.original.name}</span>
              <span className="text-muted-foreground flex flex-wrap items-center gap-1 text-xs">
                Level {row.original.depthLevel}
                {row.original.leaderOnlyAssignments ? (
                  <Badge variant="secondary" className="h-4 rounded-sm px-1 text-[10px]">
                    Pimpinan saja
                  </Badge>
                ) : null}
              </span>
            </button>
          </div>
        ),
      },
      {
        id: "parentName",
        header: "Parent",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">{parentMap.get(row.original.id) ?? "—"}</span>
        ),
      },
      {
        id: "commanderName",
        header: "Pimpinan",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.commander?.fullName ?? "—"}
          </span>
        ),
      },
      {
        id: "memberCount",
        header: "Anggota",
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-muted-foreground text-sm">{row.original.directMembers?.length ?? 0}</span>
            {row.original.leaderOnlyAssignments ? (
              <Badge variant="outline" className="h-5 rounded-sm px-1.5 text-[10px]">
                Pimpinan saja
              </Badge>
            ) : null}
          </div>
        ),
      },
      {
        id: "childCount",
        header: "Sub-satuan",
        cell: ({ row }) => (
          <Badge variant="secondary" className="h-5 rounded-sm px-1.5 text-xs">
            {row.original.children?.length ?? 0}
          </Badge>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7" aria-label="Aksi satuan">
                <EllipsisVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSelect(row.original)}>Lihat detail</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
      },
    ],
    [onSelect, parentMap],
  );

  const table = useReactTable({
    data: units,
    columns,
    state: { expanded, globalFilter },
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    getSubRows: (row) => row.children ?? [],
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    filterFromLeafRows: true,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue).toLowerCase().trim();
      if (!query) return true;

      const name = row.original.name.toLowerCase();
      const commander = row.original.commander?.fullName?.toLowerCase() ?? "";
      const parent = (parentMap.get(row.original.id) ?? "").toLowerCase();

      return name.includes(query) || commander.includes(query) || parent.includes(query);
    },
  });

  const visibleRows = table.getRowModel().rows;

  return (
    <Card className="gap-0 py-0">
      <div className="flex flex-wrap items-center gap-2 border-b p-3">
        <Input
          placeholder="Cari satuan atau pimpinan..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="h-8 w-full max-w-xs text-sm"
        />
        <div className="ml-auto flex items-center gap-2">{toolbarActions}</div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-muted-foreground h-10 text-xs first:pl-4">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {visibleRows.length ? (
              visibleRows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5 first:pl-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm">
                  Tidak ada satuan ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-muted-foreground border-t px-3 py-3 text-xs">
        {visibleRows.length} satuan ditampilkan
      </div>
    </Card>
  );
}
