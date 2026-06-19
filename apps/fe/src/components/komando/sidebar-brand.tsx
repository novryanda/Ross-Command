import { AppLogo } from "@/components/komando/app-logo";

export function SidebarBrand() {
  return (
    <div className="flex items-center gap-4 px-2 py-1.5">
      <AppLogo variant="sidebar" />
      <div className="grid min-w-0 text-left text-sm leading-tight">
        <span className="truncate font-semibold">Command Center</span>
        <span className="text-muted-foreground truncate text-xs">Social Command</span>
      </div>
    </div>
  );
}
