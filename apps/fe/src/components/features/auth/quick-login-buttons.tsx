"use client";

import { LogInIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SEED_USER_GROUPS, type SeedUser } from "@/config/seed-users";

const ENABLE_QUICK_LOGIN = process.env.NEXT_PUBLIC_ENABLE_QUICK_LOGIN !== "false";

type QuickLoginButtonsProps = {
  disabled?: boolean;
  onSelect: (user: SeedUser) => void;
};

export function QuickLoginButtons({ disabled = false, onSelect }: QuickLoginButtonsProps) {
  if (!ENABLE_QUICK_LOGIN) return null;

  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs font-medium">Akses cepat seed</p>
        <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-medium">
          sekali klik login
        </span>
      </div>
      <div className="max-h-48 space-y-3 overflow-y-auto pr-1">
        {SEED_USER_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <p className="text-muted-foreground text-[11px] font-medium">{group.label}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {group.users.map((user) => (
                <Button
                  key={user.username}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 justify-start overflow-hidden px-2 text-xs"
                  disabled={disabled}
                  title={`${user.name} - ${user.username}`}
                  onClick={() => onSelect(user)}
                >
                  <LogInIcon className="size-3.5" />
                  <span className="truncate">{user.username}</span>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
