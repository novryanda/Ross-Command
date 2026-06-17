"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpDownIcon, EllipsisVerticalIcon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table/data-table";
import type { UserListItem } from "@/lib/api/types";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type MembersTableProps = {
  members: UserListItem[];
};

export function MembersTable({ members }: MembersTableProps) {
  const columns = useMemo<ColumnDef<UserListItem>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-7 px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Anggota <ArrowUpDownIcon className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Avatar className="size-7">
              <AvatarFallback className="text-[10px]">{getInitials(row.original.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="text-foreground/90 truncate text-sm leading-tight">{row.original.fullName}</span>
              <span className="text-muted-foreground truncate text-xs">@{row.original.username}</span>
            </div>
          </div>
        ),
      },
      {
        id: "unit",
        accessorFn: (row) => row.unit?.name ?? "Tanpa satuan",
        header: "Satuan",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">{row.original.unit?.name ?? "Tanpa satuan"}</span>
        ),
      },
      {
        accessorKey: "socialAccountCount",
        header: "Sosmed",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">{row.original.socialAccountCount ?? 0} akun</span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7" aria-label="Aksi anggota">
                <EllipsisVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/members/${row.original.id}`}>Detail</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={members}
      enableGlobalFilter={false}
      enableColumnVisibility
      defaultPageSize={20}
      pageSizeOptions={[10, 20, 50]}
      emptyMessage="Tidak ada anggota ditemukan."
    />
  );
}
