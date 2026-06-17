"use client";

import type { ReactNode } from "react";

import { AutoBreadcrumb } from "@/components/auto-breadcrumb";
import { AppHeader, AppShell, AppSidebar } from "@/components/app-shell";
import { KomandoNotificationPanel } from "@/components/komando/notification-panel";
import { SidebarBrand } from "@/components/komando/sidebar-brand";
import { UserMenu } from "@/components/komando/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { getNavItems } from "@/config/nav";
import type { Me } from "@/lib/api/types";

export function MainShell({ children, user }: { children: ReactNode; user: Me }) {
  const nav = getNavItems(user);

  return (
    <AppShell
      sidebar={<AppSidebar config={nav} header={<SidebarBrand />} />}
      header={
        <AppHeader
          actions={
            <>
              <KomandoNotificationPanel />
              <ThemeToggle />
              <UserMenu user={user} />
            </>
          }
        >
          <AutoBreadcrumb config={nav} />
        </AppHeader>
      }
    >
      {children}
    </AppShell>
  );
}
