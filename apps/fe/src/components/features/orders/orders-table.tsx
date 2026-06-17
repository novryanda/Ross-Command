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
import { Progress } from "@/components/ui/progress";
import type { Order } from "@/lib/api/types";

type OrdersTableProps = {
  orders: Order[];
};

export function OrdersTable({ orders }: OrdersTableProps) {
  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "title",
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
          <Link href={`/orders/${row.original.id}`} className="text-sm font-medium hover:underline">
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: "orderType",
        header: "Jenis",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            <OrderTypeBadge type={row.original.orderType} />
            {row.original.orderType === "komentar" && row.original.sentiment ? (
              <CommentSentimentBadge sentiment={row.original.sentiment} />
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
        accessorKey: "deadline",
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
        cell: ({ row }) => <DeadlineBadge deadline={row.original.deadline} />,
        sortingFn: (a, b) => new Date(a.original.deadline).getTime() - new Date(b.original.deadline).getTime(),
      },
      {
        id: "progress",
        accessorFn: (row) => row.progress.percentageComplete,
        header: "Progress",
        cell: ({ row }) => (
          <div className="min-w-[8rem] space-y-1">
            <div className="text-muted-foreground flex justify-between text-[10px]">
              <span>
                {row.original.progress.totalSubmitted}/{row.original.progress.totalAssigned}
              </span>
              <span>{row.original.progress.percentageComplete}%</span>
            </div>
            <Progress value={row.original.progress.percentageComplete} className="h-1.5" />
          </div>
        ),
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
                <Link href={`/orders/${row.original.id}`}>Detail</Link>
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
      data={orders}
      enableGlobalFilter={false}
      enableColumnVisibility
      defaultPageSize={20}
      pageSizeOptions={[10, 20, 50]}
      emptyMessage="Tidak ada perintah ditemukan."
    />
  );
}
