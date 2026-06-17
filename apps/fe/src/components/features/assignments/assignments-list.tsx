"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { AssignmentsTable } from "@/components/features/assignments/assignments-table";
import {
  CommentSentimentBadge,
  DeadlineBadge,
  OrderTypeBadge,
  StatusBadge,
} from "@/components/komando/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Assignment } from "@/lib/api/types";

export function AssignmentsList({ assignments }: { assignments: Assignment[] }) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "card" ? "card" : "table";

  if (view === "table") {
    return <AssignmentsTable assignments={assignments} />;
  }

  return (
    <div className="grid gap-3">
      {assignments.map((assignment) => (
        <Card key={assignment.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0 space-y-1">
              <Link href={`/assignments/${assignment.id}`} className="font-medium hover:underline">
                {assignment.order.title}
              </Link>
              <div className="flex flex-wrap gap-1.5">
                <OrderTypeBadge type={assignment.order.orderType} />
                {assignment.order.orderType === "komentar" && assignment.order.sentiment ? (
                  <CommentSentimentBadge sentiment={assignment.order.sentiment} />
                ) : null}
                <StatusBadge status={assignment.status} />
                <DeadlineBadge deadline={assignment.order.deadline} />
              </div>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href={`/assignments/${assignment.id}`}>Detail</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
