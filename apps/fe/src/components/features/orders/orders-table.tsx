"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CloudUploadIcon,
  EllipsisVerticalIcon,
  FlagIcon,
  HeartIcon,
  MessageSquareIcon,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

import {
  DeadlineBadge,
  OrderTypeBadge,
  StatusBadge,
} from "@/components/komando/badges";
import { DataTable } from "@/components/data-table/data-table";
import { ExpandableText } from "@/components/komando/expandable-text";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToneProgressBar } from "@/components/komando/tone-progress-bar";
import type { Order, OrderType, PaginationMeta } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type OrdersTableProps = {
  orders: Order[];
  pagination?: PaginationMeta;
};

const orderTypeVisual: Record<OrderType, { icon: LucideIcon; className: string }> = {
  posting: { icon: CloudUploadIcon, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  engagement: { icon: HeartIcon, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  blasting: { icon: HeartIcon, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  counter: { icon: MessageSquareIcon, className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  report_akun: { icon: FlagIcon, className: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
};

function formatOrderDateTime(value: string) {
  const date = new Date(value);
  return {
    date: new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  };
}

function OrderDateCell({ value, emphasizePast }: { value: string; emphasizePast?: boolean }) {
  const formatted = formatOrderDateTime(value);
  const isPast = emphasizePast && new Date(value).getTime() < Date.now();

  return (
    <div className="min-w-28">
      <p className={cn("text-sm leading-tight", isPast && "text-red-600 dark:text-red-400")}>{formatted.date}</p>
      <p className={cn("text-muted-foreground text-xs", isPast && "text-red-500/80 dark:text-red-400/80")}>
        {formatted.time}
      </p>
    </div>
  );
}

function ServerSortHeader({
  label,
  sortKey,
  activeSortBy,
  activeSortOrder,
}: {
  label: string;
  sortKey: "sentAt" | "deadline";
  activeSortBy?: string | null;
  activeSortOrder?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isActive = activeSortBy === sortKey;
  const sortOrder = isActive && activeSortOrder === "asc" ? "asc" : isActive ? "desc" : undefined;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-7 px-2"
      onClick={() => {
        const params = new URLSearchParams(searchParams.toString());
        const nextOrder = isActive && activeSortOrder === "asc" ? "desc" : "asc";
        params.set("sortBy", sortKey);
        params.set("sortOrder", nextOrder);
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      {label}
      {sortOrder === "asc" ? (
        <ArrowUpIcon className="ml-1 size-3" />
      ) : sortOrder === "desc" ? (
        <ArrowDownIcon className="ml-1 size-3" />
      ) : (
        <ArrowUpDownIcon className="ml-1 size-3 opacity-50" />
      )}
    </Button>
  );
}

export function OrdersTable({ orders, pagination }: OrdersTableProps) {
  const searchParams = useSearchParams();
  const activeSortBy = searchParams.get("sortBy");
  const activeSortOrder = searchParams.get("sortOrder");

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        id: "perintah",
        meta: { label: "Tugas" },
        accessorFn: (row) => row.title,
        header: "Tugas",
        cell: ({ row }) => {
          const order = row.original;
          const visual = orderTypeVisual[order.orderType];
          const Icon = visual.icon;

          return (
            <div className="flex min-w-[16rem] items-start gap-3 py-1">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg",
                  visual.className,
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <Link href={`/orders/${order.id}`} className="line-clamp-1 text-sm font-semibold hover:underline">
                  {order.title}
                </Link>
                <ExpandableText
                  lines={2}
                  textClassName="text-muted-foreground text-xs leading-relaxed"
                >
                  {order.description}
                </ExpandableText>
                <div className="flex flex-wrap gap-1">
                  <StatusBadge status={order.status} />
                  <DeadlineBadge deadline={order.deadline} />
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "jenis",
        meta: { label: "Jenis" },
        accessorFn: (row) => row.orderType,
        header: "Jenis",
        cell: ({ row }) => <OrderTypeBadge type={row.original.orderType} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "progress",
        accessorFn: (row) => row.progress.percentageComplete,
        header: "Progress",
        cell: ({ row }) => (
          <div className="min-w-36 space-y-1.5">
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>
                {row.original.progress.totalSubmitted}/{row.original.progress.totalAssigned} terlaksana
              </span>
              <span>{row.original.progress.percentageComplete}%</span>
            </div>
            <ToneProgressBar value={row.original.progress.percentageComplete} />
          </div>
        ),
      },
      {
        id: "submit",
        meta: { label: "Terlaksana" },
        accessorFn: (row) => row.sentAt ?? row.createdAt,
        enableSorting: false,
        header: () => (
          <ServerSortHeader
            label="Terlaksana"
            sortKey="sentAt"
            activeSortBy={activeSortBy}
            activeSortOrder={activeSortOrder}
          />
        ),
        cell: ({ row }) => (
          <OrderDateCell value={row.original.sentAt ?? row.original.createdAt} />
        ),
      },
      {
        accessorKey: "deadline",
        meta: { label: "Deadline" },
        enableSorting: false,
        header: () => (
          <ServerSortHeader
            label="Deadline"
            sortKey="deadline"
            activeSortBy={activeSortBy}
            activeSortOrder={activeSortOrder}
          />
        ),
        cell: ({ row }) => <OrderDateCell value={row.original.deadline} emphasizePast />,
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" aria-label="Aksi tugas">
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
    [activeSortBy, activeSortOrder],
  );

  return (
    <DataTable
      columns={columns}
      data={orders}
      enableGlobalFilter={false}
      enableColumnVisibility
      defaultPageSize={20}
      pageSizeOptions={[10, 20, 50]}
      serverPagination={pagination}
      emptyMessage="Tidak ada tugas ditemukan."
    />
  );
}
