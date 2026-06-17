'use client'

import { useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

import { CheckIcon, ChevronsUpDownIcon, PlusIcon, type LucideIcon } from 'lucide-react'

export type Workspace = {
  id: string
  name: string
  plan?: string
  logo?: LucideIcon
}

type WorkspaceSwitcherProps = {
  workspaces: Workspace[]
  defaultWorkspaceId?: string
  onSelect?: (workspace: Workspace) => void
  onCreate?: () => void
}

export function WorkspaceSwitcher({
  workspaces,
  defaultWorkspaceId,
  onSelect,
  onCreate
}: WorkspaceSwitcherProps) {
  const [active, setActive] = useState<Workspace>(
    workspaces.find((w) => w.id === defaultWorkspaceId) ?? workspaces[0]
  )

  if (!active) return null

  const ActiveLogo = active.logo

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md'>
                {ActiveLogo ? (
                  <ActiveLogo className='size-4' />
                ) : (
                  <span className='text-sm font-semibold'>{active.name.charAt(0)}</span>
                )}
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>{active.name}</span>
                {active.plan ? (
                  <span className='text-muted-foreground truncate text-xs'>{active.plan}</span>
                ) : null}
              </div>
              <ChevronsUpDownIcon className='ml-auto size-4 opacity-60' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='start'
            side='bottom'
            sideOffset={4}
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56'
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>Workspaces</DropdownMenuLabel>
            <DropdownMenuGroup>
              {workspaces.map((workspace, index) => {
                const Logo = workspace.logo
                const isActive = workspace.id === active.id
                return (
                  <DropdownMenuItem
                    key={workspace.id}
                    onSelect={() => {
                      setActive(workspace)
                      onSelect?.(workspace)
                    }}
                    className='gap-2 p-2'
                  >
                    <div className='bg-muted flex size-6 items-center justify-center rounded-sm border'>
                      {Logo ? (
                        <Logo className='size-3.5 shrink-0' />
                      ) : (
                        <span className='text-[10px] font-semibold'>{workspace.name.charAt(0)}</span>
                      )}
                    </div>
                    <span className='flex-1 truncate'>{workspace.name}</span>
                    {isActive ? <CheckIcon className='size-4' /> : null}
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
            {onCreate ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='gap-2 p-2' onSelect={onCreate}>
                  <div className='bg-background flex size-6 items-center justify-center rounded-sm border'>
                    <PlusIcon className='size-4' />
                  </div>
                  <span className='text-muted-foreground'>Add workspace</span>
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
