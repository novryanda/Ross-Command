'use client'

import { useMemo, useState } from 'react'
import {
  ArchiveIcon,
  FileEditIcon,
  InboxIcon,
  PencilIcon,
  SearchIcon,
  SendIcon,
  StarIcon,
  Trash2Icon
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { EmailDetail, EmailListItem } from './components'
import { ComposePanel, type ComposeMode } from './compose-panel'
import { type Email, initialEmails } from './data'

const folders: Array<{ id: Email['folder']; label: string; icon: typeof InboxIcon }> = [
  { id: 'inbox', label: 'Inbox', icon: InboxIcon },
  { id: 'starred', label: 'Starred', icon: StarIcon },
  { id: 'sent', label: 'Sent', icon: SendIcon },
  { id: 'drafts', label: 'Drafts', icon: FileEditIcon },
  { id: 'trash', label: 'Trash', icon: Trash2Icon }
]

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>(initialEmails)
  const [folder, setFolder] = useState<Email['folder']>('inbox')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(initialEmails[0]?.id ?? null)
  const [composeMode, setComposeMode] = useState<ComposeMode | null>(null)
  const [composeSource, setComposeSource] = useState<Email | null>(null)

  const filtered = useMemo(() => {
    return emails
      .filter((e) => (folder === 'starred' ? e.starred : e.folder === folder))
      .filter((e) => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
          e.subject.toLowerCase().includes(q) ||
          e.from.name.toLowerCase().includes(q) ||
          e.preview.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
  }, [emails, folder, search])

  const selected = filtered.find((e) => e.id === selectedId) ?? null

  const counts = useMemo(() => {
    return {
      inbox: emails.filter((e) => e.folder === 'inbox' && !e.read).length,
      starred: emails.filter((e) => e.starred).length,
      sent: emails.filter((e) => e.folder === 'sent').length,
      drafts: emails.filter((e) => e.folder === 'drafts').length,
      trash: emails.filter((e) => e.folder === 'trash').length
    }
  }, [emails])

  const handleSelect = (email: Email) => {
    setSelectedId(email.id)
    if (!email.read) {
      setEmails((current) => current.map((e) => (e.id === email.id ? { ...e, read: true } : e)))
    }
  }

  const toggleStar = (id: string) => {
    setEmails((current) => current.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e)))
  }

  const archive = (id: string) => {
    setEmails((current) => current.filter((e) => e.id !== id))
    setSelectedId(null)
    toast.success('Email archived')
  }

  const remove = (id: string) => {
    setEmails((current) => current.map((e) => (e.id === id ? { ...e, folder: 'trash' as const } : e)))
    setSelectedId(null)
    toast.success('Moved to trash')
  }

  const openCompose = (mode: ComposeMode, src: Email | null = null) => {
    setComposeSource(src)
    setComposeMode(mode)
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-lg font-semibold tracking-tight'>Inbox</h1>
          <p className='text-muted-foreground text-xs'>Manage your emails and conversations.</p>
        </div>
        <Button size='sm' className='h-8' onClick={() => openCompose('new')}>
          <PencilIcon className='size-3.5' /> Compose
        </Button>
      </div>

      <Card className='gap-0 overflow-hidden p-0'>
        <div className='grid h-[calc(100svh-13rem)] min-h-96 grid-cols-1 md:grid-cols-[160px_320px_1fr]'>
          <aside className='hidden border-r p-2 md:block'>
            <nav className='space-y-0.5'>
              {folders.map((f) => {
                const Icon = f.icon
                const active = folder === f.id
                const count = counts[f.id]
                return (
                  <button
                    key={f.id}
                    type='button'
                    onClick={() => {
                      setFolder(f.id)
                      setSelectedId(null)
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                      active ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent/50'
                    )}
                  >
                    <Icon className='size-3.5 shrink-0' />
                    <span className='flex-1 text-left'>{f.label}</span>
                    {count > 0 ? (
                      <span className='text-muted-foreground text-[10px]'>{count}</span>
                    ) : null}
                  </button>
                )
              })}
            </nav>
            <Separator className='my-3' />
            <p className='text-muted-foreground px-2 text-[10px] font-medium uppercase tracking-wider'>
              Labels
            </p>
            <div className='mt-1 space-y-0.5'>
              {[
                { name: 'Work', color: 'bg-blue-500' },
                { name: 'Personal', color: 'bg-violet-500' },
                { name: 'Important', color: 'bg-rose-500' },
                { name: 'Billing', color: 'bg-amber-500' }
              ].map((label) => (
                <button
                  key={label.name}
                  type='button'
                  className='hover:bg-accent/50 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors'
                >
                  <span className={cn('size-2 rounded-full', label.color)} aria-hidden />
                  <span>{label.name}</span>
                </button>
              ))}
            </div>
          </aside>

          <div className={cn('flex h-full min-h-0 flex-col border-r', selectedId && 'max-md:hidden')}>
            <div className='border-b p-2'>
              <div className='relative'>
                <SearchIcon className='text-muted-foreground absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2' />
                <Input
                  placeholder='Search emails...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='h-8 pl-8 text-sm'
                />
              </div>
            </div>
            <div className='min-h-0 flex-1 overflow-y-auto'>
              {filtered.length === 0 ? (
                <div className='text-muted-foreground flex flex-col items-center gap-2 p-8 text-center text-xs'>
                  <ArchiveIcon className='size-6 opacity-40' />
                  <p>No emails in {folder}</p>
                </div>
              ) : (
                <ul className='divide-border divide-y'>
                  {filtered.map((email) => (
                    <li key={email.id}>
                      <EmailListItem
                        email={email}
                        selected={email.id === selectedId}
                        onSelect={() => handleSelect(email)}
                        onToggleStar={() => toggleStar(email.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className={cn('h-full min-h-0', !selectedId && !composeMode && 'max-md:hidden')}>
            {composeMode ? (
              <ComposePanel
                mode={composeMode}
                source={composeSource}
                onClose={() => setComposeMode(null)}
              />
            ) : (
              <EmailDetail
                email={selected}
                onBack={() => setSelectedId(null)}
                onArchive={() => selected && archive(selected.id)}
                onDelete={() => selected && remove(selected.id)}
                onToggleStar={() => selected && toggleStar(selected.id)}
                onReply={() => selected && openCompose('reply', selected)}
                onForward={() => selected && openCompose('forward', selected)}
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
