 "use client";

import type { LucideIcon } from "lucide-react";
import { AlertCircleIcon, InboxIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PageStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
};

export function PageState({ title, description, icon: Icon = InboxIcon, action }: PageStateProps) {
  return (
    <Card>
      <CardContent className="flex min-h-44 flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="bg-muted flex size-10 items-center justify-center rounded-md">
          <Icon className="text-muted-foreground size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">{title}</p>
          {description ? <p className="text-muted-foreground max-w-md text-xs">{description}</p> : null}
        </div>
        {action}
      </CardContent>
    </Card>
  );
}

export function ErrorState({ message = "Data gagal dimuat" }: { message?: string }) {
  return (
    <PageState
      title={message}
      description="Coba muat ulang halaman. Jika masih terjadi, periksa koneksi backend."
      icon={AlertCircleIcon}
      action={<Button variant="outline" onClick={() => window.location.reload()}>Muat ulang</Button>}
    />
  );
}
