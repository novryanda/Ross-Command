"use client";

import { LogInIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <Tabs defaultValue={SEED_USER_GROUPS[0]?.label} className="gap-3">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-4">
          {SEED_USER_GROUPS.map((group) => (
            <TabsTrigger
              key={group.label}
              value={group.label}
              className="min-h-8 px-2 text-[11px] leading-tight whitespace-normal"
            >
              {group.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {SEED_USER_GROUPS.map((group) => (
          <TabsContent key={group.label} value={group.label}>
            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
              <p className="text-muted-foreground text-[11px] font-medium">
                {group.users.length} akun tersedia
              </p>
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
