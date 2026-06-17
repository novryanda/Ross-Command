import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function PageHero({ eyebrow, title, description, actions, children, className }: PageHeroProps) {
  return (
    <section
      className={cn(
        "border-border/70 bg-card/95 overflow-hidden rounded-lg border shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-2">
          {eyebrow ? (
            <p className="text-primary text-xs font-semibold uppercase tracking-normal">{eyebrow}</p>
          ) : null}
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-normal md:text-2xl">{title}</h1>
            {description ? <p className="text-muted-foreground max-w-3xl text-sm">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="border-t bg-muted/30 px-5 py-3">{children}</div> : null}
    </section>
  );
}
