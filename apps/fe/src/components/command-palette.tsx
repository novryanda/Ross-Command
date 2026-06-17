'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { LaptopIcon, MoonIcon, SearchIcon, SunIcon } from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from '@/components/ui/command'

import type { NavConfig, NavItem } from '@/components/app-shell'

type FlatItem = {
  title: string
  url: string
  group: string
  icon?: NavItem['icon']
}

function flatten(config: NavConfig): FlatItem[] {
  const result: FlatItem[] = []
  for (const group of config.groups) {
    const groupLabel = group.label ?? 'General'
    for (const item of group.items) {
      if (item.items?.length) {
        for (const sub of item.items) {
          result.push({ title: sub.title, url: sub.url, group: groupLabel, icon: item.icon })
        }
      } else if (item.url && item.url !== '#') {
        result.push({ title: item.title, url: item.url, group: groupLabel, icon: item.icon })
      }
    }
  }
  return result
}

export function CommandPalette({ config }: { config: NavConfig }) {
  const router = useRouter()
  const { setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const navigate = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  const apply = (action: () => void) => {
    setOpen(false)
    action()
  }

  const items = flatten(config)
  const groups = Array.from(new Set(items.map((i) => i.group)))

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        aria-label='Open command palette'
        className='border-input bg-background hover:bg-accent text-muted-foreground inline-flex h-8 items-center gap-2 rounded-md border px-2 text-xs transition-colors max-md:size-8 max-md:justify-center max-md:px-0'
      >
        <SearchIcon className='size-3.5' />
        <span className='hidden md:inline'>Search...</span>
        <kbd className='bg-muted text-muted-foreground hidden rounded px-1.5 py-0.5 font-mono text-[10px] md:inline'>
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder='Type a command or search...' />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {groups.map((group) => {
            const groupItems = items.filter((i) => i.group === group)
            return (
              <CommandGroup key={group} heading={group}>
                {groupItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.url}
                      value={`${group} ${item.title}`}
                      onSelect={() => navigate(item.url)}
                    >
                      {Icon ? <Icon /> : null}
                      <span>{item.title}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )
          })}

          <CommandSeparator />

          <CommandGroup heading='Theme'>
            <CommandItem onSelect={() => apply(() => setTheme('light'))}>
              <SunIcon /> <span>Light mode</span>
            </CommandItem>
            <CommandItem onSelect={() => apply(() => setTheme('dark'))}>
              <MoonIcon /> <span>Dark mode</span>
            </CommandItem>
            <CommandItem onSelect={() => apply(() => setTheme('system'))}>
              <LaptopIcon /> <span>System</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
