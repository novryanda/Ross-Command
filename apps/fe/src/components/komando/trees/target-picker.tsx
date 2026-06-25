"use client";

import { useEffect, useMemo, useState } from "react";

import { usePagination } from "@/hooks/use-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { OrderTargetAudience, UnitNode } from "@/lib/api/types";

export type OrderTargetInput = {
  targetType: "unit" | "individual";
  targetAudience?: Exclude<OrderTargetAudience, "direct_user">;
  unitId?: string;
  userId?: string;
};

const audienceLabel: Record<Exclude<OrderTargetAudience, "direct_user">, string> = {
  all_members: "Seluruh Satuan",
  unit_leaders: "Pimpinan Satuan",
};

type FlatUnitRow = {
  id: string;
  name: string;
  depthLevel: number;
  parentName: string | null;
  memberCount: number;
  leaderOnlyAssignments: boolean;
};

type LeaderRow = {
  unitId: string;
  userId: string;
  fullName: string;
  username: string;
  unitName: string;
  depthLevel: number;
  directMemberCount: number;
};

export function TargetPicker({
  units,
  currentUserId,
  value,
  onChange,
  targetAudience,
  onTargetAudienceChange,
}: {
  units: UnitNode[];
  currentUserId: string;
  value: OrderTargetInput[];
  onChange: (value: OrderTargetInput[]) => void;
  targetAudience: Exclude<OrderTargetAudience, "direct_user">;
  onTargetAudienceChange: (value: Exclude<OrderTargetAudience, "direct_user">) => void;
}) {
  const rows = useMemo(() => flattenUnits(units), [units]);
  const leaderRows = useMemo(
    () => flattenLeaders(units).filter((row) => row.userId !== currentUserId),
    [currentUserId, units],
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const selectedAllMemberUnitIds = useMemo(
    () =>
      value
        .filter(
          (item) =>
            item.targetType === "unit" &&
            item.targetAudience === "all_members" &&
            item.unitId,
        )
        .map((item) => item.unitId as string),
    [value],
  );
  const selectedLeaderUnitIds = useMemo(
    () =>
      value
        .filter(
          (item) =>
            item.targetType === "unit" &&
            item.targetAudience === "unit_leaders" &&
            item.unitId,
        )
        .map((item) => item.unitId as string),
    [value],
  );
  const activeSelectedUnitIds =
    targetAudience === "all_members"
      ? selectedAllMemberUnitIds
      : selectedLeaderUnitIds;
  const normalizedSearch = search.trim().toLowerCase();
  const filteredUnitRows = useMemo(
    () =>
      rows.filter((row) =>
        [row.name, row.parentName ?? ""].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        ),
      ),
    [normalizedSearch, rows],
  );
  const filteredLeaderRows = useMemo(
    () =>
      leaderRows.filter((row) =>
        [row.fullName, row.username, row.unitName].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        ),
      ),
    [leaderRows, normalizedSearch],
  );
  const activeRows =
    targetAudience === "all_members"
      ? filteredUnitRows.length
      : filteredLeaderRows.length;
  const selectedCount =
    targetAudience === "all_members"
      ? filteredUnitRows.filter((row) => selectedAllMemberUnitIds.includes(row.id)).length
      : filteredLeaderRows.filter((row) => selectedLeaderUnitIds.includes(row.unitId)).length;
  const allSelected = activeRows > 0 && selectedCount === activeRows;
  const partiallySelected = selectedCount > 0 && selectedCount < activeRows;
  const totalPages = Math.max(1, Math.ceil(activeRows / pageSize));
  const pagedUnitRows = useMemo(
    () => filteredUnitRows.slice((page - 1) * pageSize, page * pageSize),
    [filteredUnitRows, page, pageSize],
  );
  const pagedLeaderRows = useMemo(
    () => filteredLeaderRows.slice((page - 1) * pageSize, page * pageSize),
    [filteredLeaderRows, page, pageSize],
  );
  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: page,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  useEffect(() => {
    setPage(1);
  }, [pageSize, search, targetAudience]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function toggleUnit(unitId: string) {
    const exists = value.some(
      (item) =>
        item.targetType === "unit" &&
        item.targetAudience === "all_members" &&
        item.unitId === unitId,
    );
    if (exists) {
      onChange(
        value.filter(
          (item) =>
            !(
              item.targetType === "unit" &&
              item.targetAudience === "all_members" &&
              item.unitId === unitId
            ),
        ),
      );
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

  function toggleLeader(userId: string) {
    const leader = leaderRows.find((item) => item.userId === userId);
    if (!leader) {
      return;
    }

    const exists = value.some(
      (item) =>
        item.targetType === "unit" &&
        item.unitId === leader.unitId &&
        item.targetAudience === "unit_leaders",
    );
    if (exists) {
      onChange(
        value.filter(
          (item) =>
            !(
              item.targetType === "unit" &&
              item.unitId === leader.unitId &&
              item.targetAudience === "unit_leaders"
            ),
        ),
      );
      return;
    }

    onChange([
      ...value,
      {
        targetType: "unit",
        unitId: leader.unitId,
        targetAudience: "unit_leaders",
      },
    ]);
  }

  function toggleAll(checked: boolean) {
    const otherTargets = value.filter(
      (item) =>
        !(
          item.targetType === "unit" &&
          item.targetAudience === targetAudience
        ),
    );

    if (!checked) {
      onChange(otherTargets);
      return;
    }

    if (targetAudience === "all_members") {
      onChange(
        dedupeTargets([
          ...otherTargets,
          ...filteredUnitRows.map((row) => ({
            targetType: "unit" as const,
            unitId: row.id,
            targetAudience: "all_members" as const,
          })),
        ]),
      );
      return;
    }

    onChange(
      dedupeTargets([
        ...otherTargets,
        ...filteredLeaderRows.map((row) => ({
          targetType: "unit" as const,
          unitId: row.unitId,
          targetAudience: "unit_leaders" as const,
        })),
      ]),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={targetAudience === "all_members" ? "default" : "outline"}
          onClick={() => onTargetAudienceChange("all_members")}
        >
          Seluruh Satuan
        </Button>
        <Button
          type="button"
          size="sm"
          variant={targetAudience === "unit_leaders" ? "default" : "outline"}
          onClick={() => onTargetAudienceChange("unit_leaders")}
        >
          Pimpinan Satuan
        </Button>
        <Badge variant="secondary" className="ml-auto rounded-sm">
          {value.length} target
        </Badge>
      </div>

      <div className="rounded-lg border bg-muted/20 p-3 text-sm">
        <p className="font-medium">{audienceLabel[targetAudience]}</p>
        <p className="text-muted-foreground text-xs">
          {targetAudience === "all_members"
            ? "Tugas dikirim ke seluruh anggota aktif, kecuali satuan bertanda Pimpinan saja yang diwakili pimpinannya."
            : "Pilih user pimpinan satuan yang akan menerima tugas dan mewakili anggota langsungnya."}
        </p>
      </div>

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={
          targetAudience === "all_members"
            ? "Cari nama satuan atau parent..."
            : "Cari nama pimpinan, username, atau satuan..."
        }
        className="max-w-md"
      />

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
              {targetAudience === "all_members" ? (
                <>
                  <TableHead>Satuan</TableHead>
                  <TableHead className="w-28">Level</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead className="w-28 text-right">Anggota</TableHead>
                </>
              ) : (
                <>
                  <TableHead>Pimpinan</TableHead>
                  <TableHead className="w-44">Username</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead className="w-28">Level</TableHead>
                  <TableHead className="w-28 text-right">Anggota</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeRows === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={targetAudience === "all_members" ? 5 : 6}
                  className="h-24 text-center text-sm"
                >
                  Tidak ada data yang cocok.
                </TableCell>
              </TableRow>
            ) : targetAudience === "all_members"
              ? pagedUnitRows.map((row) => {
                  const selected = activeSelectedUnitIds.includes(row.id);

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
              : pagedLeaderRows.map((row) => {
                  const selected = value.some(
                    (item) =>
                      item.targetType === "unit" &&
                      item.unitId === row.unitId &&
                      item.targetAudience === "unit_leaders",
                  );

                  return (
                    <TableRow
                      key={row.userId}
                      data-state={selected ? "selected" : undefined}
                      className="cursor-pointer"
                      onClick={() => toggleLeader(row.userId)}
                    >
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleLeader(row.userId)}
                          aria-label={`Pilih ${row.fullName}`}
                        />
                      </TableCell>
                      <TableCell>
                        <p className="truncate font-medium">{row.fullName}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">@{row.username}</TableCell>
                      <TableCell>{row.unitName}</TableCell>
                      <TableCell>Level {row.depthLevel}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.directMemberCount}</TableCell>
                    </TableRow>
                  );
                })}
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

function flattenLeaders(nodes: UnitNode[]): LeaderRow[] {
  return nodes.flatMap((node) => [
    ...(node.commander
      ? [
          {
            unitId: node.id,
            userId: node.commander.id,
            fullName: node.commander.fullName,
            username: node.commander.username,
            unitName: node.name,
            depthLevel: node.depthLevel,
            directMemberCount: node.directMembers?.length ?? 0,
          },
        ]
      : []),
    ...flattenLeaders(node.children),
  ]);
}

function dedupeTargets(targets: OrderTargetInput[]) {
  const map = new Map<string, OrderTargetInput>();
  for (const target of targets) {
    map.set(
      [
        target.targetType,
        target.targetAudience ?? "",
        target.unitId ?? "",
        target.userId ?? "",
      ].join(":"),
      target,
    );
  }
  return Array.from(map.values());
}
