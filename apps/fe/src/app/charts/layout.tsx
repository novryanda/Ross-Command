'use client'

import type { ReactNode } from 'react'

import { AppFooter, AppHeader, AppShell, AppSidebar, WorkspaceSwitcher } from '@/components/app-shell'
import { AutoBreadcrumb } from '@/components/auto-breadcrumb'
import { dashboardNav } from '@/config/nav'
import { workspaces } from '@/config/workspaces'

export default function ChartsLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      sidebar={
        <AppSidebar
          config={dashboardNav}
          isActive={(url) => url === '/charts'}
          header={<WorkspaceSwitcher workspaces={workspaces} />}
        />
      }
      header={
        <AppHeader>
          <AutoBreadcrumb config={dashboardNav} />
        </AppHeader>
      }
      footer={<AppFooter />}
    >
      <div className='space-y-6'>{children}</div>
    </AppShell>
  )
}
