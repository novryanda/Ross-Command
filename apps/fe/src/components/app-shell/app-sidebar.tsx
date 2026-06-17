'use client'

import { ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar'

import type { NavConfig, NavItem } from './types'

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  config: NavConfig
  header?: React.ReactNode
  footer?: React.ReactNode
  isActive?: (url: string) => boolean
}

export function AppSidebar({ config, header, footer, isActive, collapsible = 'icon', ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const matchActive =
    isActive ??
    ((url: string) => {
      if (!url || url === '#') return false
      if (url === '/') return pathname === '/'
      return pathname === url || pathname.startsWith(`${url}/`)
    })

  return (
    <Sidebar collapsible={collapsible} {...props}>
      {header ? <SidebarHeader>{header}</SidebarHeader> : null}
      <SidebarContent>
        {config.groups.map((group, groupIndex) => (
          <SidebarGroup key={group.label ?? `group-${groupIndex}`}>
            {group.label ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <NavMenuItem key={item.title} item={item} isActive={matchActive} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      {footer ? <SidebarFooter>{footer}</SidebarFooter> : null}
    </Sidebar>
  )
}

function NavMenuItem({ item, isActive }: { item: NavItem; isActive: (url: string) => boolean }) {
  const hasChildren = item.items && item.items.length > 0

  if (hasChildren) {
    const defaultOpen = item.items?.some((sub) => isActive(sub.url)) ?? false

    return (
      <Collapsible asChild defaultOpen={defaultOpen} className='group/collapsible'>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.title}>
              {item.icon ? <item.icon /> : null}
              <span>{item.title}</span>
              <ChevronRightIcon className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items!.map((sub) => (
                <SidebarMenuSubItem key={sub.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isActive(sub.url)}
                    aria-disabled={sub.disabled || undefined}
                  >
                    <Link
                      href={sub.url}
                      target={sub.external ? '_blank' : undefined}
                      rel={sub.external ? 'noreferrer' : undefined}
                    >
                      <span>{sub.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                  {sub.badge !== undefined ? (
                    <SidebarMenuBadge className='bg-primary/10 rounded-full'>{sub.badge}</SidebarMenuBadge>
                  ) : null}
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={item.title}
        isActive={isActive(item.url)}
        aria-disabled={item.disabled || undefined}
      >
        <Link
          href={item.url}
          target={item.external ? '_blank' : undefined}
          rel={item.external ? 'noreferrer' : undefined}
        >
          {item.icon ? <item.icon /> : null}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
      {item.badge !== undefined ? (
        <SidebarMenuBadge className='bg-primary/10 top-1/2 right-2 -translate-y-1/2 rounded-full'>
          {item.badge}
        </SidebarMenuBadge>
      ) : null}
    </SidebarMenuItem>
  )
}
