"use client";

import { LogInIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SEED_USER_GROUPS, type SeedUser } from "@/config/seed-users";

const ENABLE_QUICK_LOGIN = process.env.NEXT_PUBLIC_ENABLE_QUICK_LOGIN !== "false";

const SUPERADMIN = SEED_USER_GROUPS[0]?.users[0];

type QuickLoginButtonsProps = {
  disabled?: boolean;
  onSelect: (user: SeedUser) => void;
};

export function QuickLoginButtons({ disabled = false, onSelect }: QuickLoginButtonsProps) {
  if (!ENABLE_QUICK_LOGIN || !SUPERADMIN) return null;

  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs font-medium">Akses cepat seed</p>
        <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-medium">
          sekali klik login
        </span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 w-full justify-start px-3 text-xs"
        disabled={disabled}
        title={`${SUPERADMIN.name} - ${SUPERADMIN.username}`}
        onClick={() => onSelect(SUPERADMIN)}
      >
        <LogInIcon className="size-3.5" />
        <span className="truncate">{SUPERADMIN.username}</span>
      </Button>
    </div>
  );
}
