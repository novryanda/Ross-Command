"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { OrdersTable } from "@/components/features/orders/orders-table";
import {
  CommentSentimentBadge,
  DeadlineBadge,
  OrderTypeBadge,
  StatusBadge,
} from "@/components/komando/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Order, PaginationMeta } from "@/lib/api/types";

export function OrdersList({ orders, pagination }: { orders: Order[]; pagination?: PaginationMeta }) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "card" ? "card" : "table";

  if (view === "table") {
    return <OrdersTable orders={orders} pagination={pagination} />;
  }

  return (
    <div className="grid gap-3">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <Link href={`/orders/${order.id}`} className="font-medium hover:underline">
                  {order.title}
                </Link>
                <div className="flex flex-wrap gap-1.5">
                  <OrderTypeBadge type={order.orderType} />
                  {order.orderType === "komentar" && order.sentiment ? (
                    <CommentSentimentBadge sentiment={order.sentiment} />
                  ) : null}
                  <StatusBadge status={order.status} />
                  <DeadlineBadge deadline={order.deadline} />
                </div>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/orders/${order.id}`}>Detail</Link>
              </Button>
            </div>
            <div className="space-y-1.5">
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>
                  {order.progress.totalSubmitted}/{order.progress.totalAssigned} submit
                </span>
                <span>{order.progress.percentageComplete}%</span>
              </div>
              <Progress value={order.progress.percentageComplete} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
