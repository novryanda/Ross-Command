"use client";

import { Button } from "@/components/ui/button";
import { SEED_USER_GROUPS } from "@/config/seed-users";

type QuickLoginButtonsProps = {
  onSelect: (username: string, password: string) => void;
};

export function QuickLoginButtons({ onSelect }: QuickLoginButtonsProps) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="space-y-3 border-t pt-4">
      <p className="text-muted-foreground text-center text-xs font-medium">Akses Cepat (Development)</p>
      {SEED_USER_GROUPS.map((group) => (
        <div key={group.label} className="space-y-1.5">
          <p className="text-muted-foreground text-[11px] font-medium">{group.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {group.users.map((user) => (
              <Button
                key={user.username}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                title={user.name}
                onClick={() => onSelect(user.username, user.password)}
              >
                {user.username}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
