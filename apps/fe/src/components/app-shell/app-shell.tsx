'use client'

import type { ReactNode } from 'react'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

type AppShellProps = {
  sidebar: ReactNode
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
  defaultSidebarOpen?: boolean
}

export function AppShell({ sidebar, header, footer, children, defaultSidebarOpen = true }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      {sidebar}
      <SidebarInset className='min-w-0 overflow-x-hidden'>
        {header ? (
          <header className='bg-card sticky top-0 z-40 border-b'>
            <div className='flex min-w-0 w-full items-center justify-between gap-4 overflow-x-hidden px-4 py-2 sm:px-6 lg:px-8'>
              {header}
            </div>
          </header>
        ) : null}
        <main className='min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8'>
          <div className='mx-auto min-w-0 w-full max-w-screen-2xl'>{children}</div>
        </main>
        {footer ? <footer className='border-t'>{footer}</footer> : null}
      </SidebarInset>
    </SidebarProvider>
  )
}
