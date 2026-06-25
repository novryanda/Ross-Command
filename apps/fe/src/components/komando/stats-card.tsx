import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  className?: string;
};

export function StatsCard({ title, value, icon: Icon, className }: StatsCardProps) {
  return (
    <Card className={cn("group overflow-hidden border-border/70 shadow-sm transition-colors hover:border-primary/35", className)}>
      <CardContent className="relative flex items-center justify-between gap-4 p-5">
        <span className="bg-primary/70 absolute inset-x-0 top-0 h-0.5 opacity-70 transition-opacity group-hover:opacity-100" />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-muted-foreground text-base font-medium">{title}</p>
          <p className="text-4xl font-semibold tabular-nums">{value}</p>
        </div>
        {Icon ? (
          <div className="bg-primary/10 text-primary ring-primary/10 flex size-10 items-center justify-center rounded-md ring-1">
            <Icon className="size-5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
