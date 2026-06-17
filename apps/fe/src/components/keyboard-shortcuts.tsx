'use client'

import { useEffect, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

type Shortcut = {
  keys: string[]
  description: string
}

type ShortcutGroup = {
  title: string
  shortcuts: Shortcut[]
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const mod = isMac ? '⌘' : 'Ctrl'

const groups: ShortcutGroup[] = [
  {
    title: 'General',
    shortcuts: [
      { keys: [mod, 'K'], description: 'Open command palette' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: [mod, 'B'], description: 'Toggle sidebar' },
      { keys: ['Esc'], description: 'Close dialog or menu' }
    ]
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['G', 'D'], description: 'Go to dashboard' },
      { keys: ['G', 'I'], description: 'Go to inbox' },
      { keys: ['G', 'C'], description: 'Go to chat' },
      { keys: ['G', 'S'], description: 'Go to settings' }
    ]
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: [mod, 'N'], description: 'Create new item' },
      { keys: [mod, 'S'], description: 'Save changes' },
      { keys: [mod, 'Enter'], description: 'Submit form' },
      { keys: [mod, '/'], description: 'Focus search' }
    ]
  },
  {
    title: 'Inbox',
    shortcuts: [
      { keys: ['R'], description: 'Reply to email' },
      { keys: ['F'], description: 'Forward email' },
      { keys: ['E'], description: 'Archive email' },
      { keys: ['Del'], description: 'Move to trash' }
    ]
  }
]

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className='bg-muted text-muted-foreground inline-flex h-5 min-w-5 items-center justify-center rounded border px-1.5 font-mono text-[10px] font-medium'>
      {children}
    </kbd>
  )
}

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in an input, textarea, or contenteditable.
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      const typing =
        tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable
      if (typing) return

      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription className='text-xs'>
            Press <Kbd>?</Kbd> anytime to open this panel.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-x-8 gap-y-5 sm:grid-cols-2'>
          {groups.map((group) => (
            <div key={group.title} className='space-y-2'>
              <p className='text-muted-foreground text-[11px] font-medium uppercase tracking-wider'>
                {group.title}
              </p>
              <ul className='space-y-1.5'>
                {group.shortcuts.map((shortcut) => (
                  <li key={shortcut.description} className='flex items-center justify-between gap-4'>
                    <span className='text-sm'>{shortcut.description}</span>
                    <span className='flex shrink-0 items-center gap-1'>
                      {shortcut.keys.map((key, i) => (
                        <span key={i} className='flex items-center gap-1'>
                          <Kbd>{key}</Kbd>
                          {i < shortcut.keys.length - 1 ? (
                            <span className='text-muted-foreground text-[10px]'>+</span>
                          ) : null}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
