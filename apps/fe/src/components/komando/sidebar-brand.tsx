import { ShieldCheckIcon } from "lucide-react";

export function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 px-2 py-1">
      <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
        <ShieldCheckIcon className="size-4" />
      </div>
      <div className="grid min-w-0 text-left text-sm leading-tight">
        <span className="truncate font-semibold">Komando Center</span>
        <span className="text-muted-foreground truncate text-xs">Social Command</span>
      </div>
    </div>
  );
}
