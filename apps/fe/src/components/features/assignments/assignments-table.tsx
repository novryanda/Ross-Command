"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpDownIcon, EllipsisVerticalIcon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import {
  CommentSentimentBadge,
  DeadlineBadge,
  OrderTypeBadge,
  StatusBadge,
} from "@/components/komando/badges";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Assignment } from "@/lib/api/types";

type AssignmentsTableProps = {
  assignments: Assignment[];
};

export function AssignmentsTable({ assignments }: AssignmentsTableProps) {
  const columns = useMemo<ColumnDef<Assignment>[]>(
    () => [
      {
        id: "title",
        accessorFn: (row) => row.order.title,
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-7 px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Judul <ArrowUpDownIcon className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <Link href={`/assignments/${row.original.id}`} className="text-sm font-medium hover:underline">
            {row.original.order.title}
          </Link>
        ),
      },
      {
        id: "orderType",
        accessorFn: (row) => row.order.orderType,
        header: "Jenis",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            <OrderTypeBadge type={row.original.order.orderType} />
            {row.original.order.orderType === "komentar" && row.original.order.sentiment ? (
              <CommentSentimentBadge sentiment={row.original.order.sentiment} />
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "deadline",
        accessorFn: (row) => row.order.deadline,
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-7 px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Deadline <ArrowUpDownIcon className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => <DeadlineBadge deadline={row.original.order.deadline} />,
        sortingFn: (a, b) =>
          new Date(a.original.order.deadline).getTime() - new Date(b.original.order.deadline).getTime(),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7" aria-label="Aksi perintah">
                <EllipsisVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/assignments/${row.original.id}`}>Detail</Link>
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
      data={assignments}
      enableGlobalFilter={false}
      enableColumnVisibility
      defaultPageSize={20}
      pageSizeOptions={[10, 20, 50]}
      emptyMessage="Tidak ada perintah ditemukan."
    />
  );
}
