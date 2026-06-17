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
      <SidebarInset>
        {header ? (
          <header className='bg-card sticky top-0 z-40 border-b'>
            <div className='flex w-full items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8'>{header}</div>
          </header>
        ) : null}
        <main className='flex-1 px-4 py-6 sm:px-6 lg:px-8'>
          <div className='mx-auto w-full max-w-screen-2xl'>{children}</div>
        </main>
        {footer ? <footer className='border-t'>{footer}</footer> : null}
      </SidebarInset>
    </SidebarProvider>
  )
}
