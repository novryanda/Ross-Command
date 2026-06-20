"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpDownIcon,
  EllipsisVerticalIcon,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table/data-table";
import type { PaginationMeta, UserListItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const roleLabel: Record<string, string> = {
  super_admin: "Super Admin",
  member: "Member",
};

const roleVariant: Record<string, string> = {
  super_admin: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  member: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatLastLogin(value?: string | null) {
  if (!value) return "Belum pernah";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

type UsersAdminTableProps = {
  users: UserListItem[];
  toolbarActions?: ReactNode;
  pagination?: PaginationMeta;
  onEdit: (user: UserListItem) => void;
  onResetPassword: (user: UserListItem) => void;
  onUnlock: (user: UserListItem) => void;
  onDeactivate: (user: UserListItem) => void;
};

export function UsersAdminTable({
  users,
  toolbarActions,
  pagination,
  onEdit,
  onResetPassword,
  onUnlock,
  onDeactivate,
}: UsersAdminTableProps) {
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
            Nama <ArrowUpDownIcon className="ml-1 size-3" />
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
        accessorKey: "nip",
        header: "NIP",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">{row.original.nip ?? "—"}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = row.original.role ?? "member";
          return (
            <Badge className={cn("h-5 rounded-sm px-1.5 text-xs", roleVariant[role])}>
              {roleLabel[role] ?? role}
            </Badge>
          );
        },
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
        id: "status",
        accessorFn: (row) => (row.isLocked ? "locked" : "active"),
        header: "Status",
        cell: ({ row }) =>
          row.original.isLocked ? (
            <Badge className="h-5 rounded-sm bg-red-500/10 px-1.5 text-xs text-red-700 dark:text-red-300">
              Terkunci
            </Badge>
          ) : (
            <Badge className="h-5 rounded-sm bg-emerald-500/10 px-1.5 text-xs text-emerald-700 dark:text-emerald-300">
              Aktif
            </Badge>
          ),
      },
      {
        accessorKey: "lastLoginAt",
        header: "Login Terakhir",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">{formatLastLogin(row.original.lastLoginAt)}</span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7" aria-label="Aksi user">
                  <EllipsisVerticalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/users/${user.id}`}>Detail</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(user)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onResetPassword(user)}>Reset Password</DropdownMenuItem>
                {user.isLocked ? (
                  <DropdownMenuItem onClick={() => onUnlock(user)}>Unlock</DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => onDeactivate(user)}>
                  Nonaktifkan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [onDeactivate, onEdit, onResetPassword, onUnlock],
  );

  return (
    <DataTable
      columns={columns}
      data={users}
      enableGlobalFilter={false}
      enableColumnVisibility
      defaultPageSize={20}
      pageSizeOptions={[10, 20, 50]}
      serverPagination={pagination}
      emptyMessage="Tidak ada user ditemukan."
      toolbarActions={toolbarActions}
    />
  );
}
