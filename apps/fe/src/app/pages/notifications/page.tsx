'use client'

import { useMemo, useState } from 'react'
import { BellIcon, CheckCheckIcon, Trash2Icon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { PageHeader } from '@/components/showcase'
import { cn } from '@/lib/utils'

import { categoryMeta, notifications as seed, type NotificationEntry } from './data'

type Filter = 'all' | 'unread' | NotificationEntry['category']

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationEntry[]>(seed)
  const [filter, setFilter] = useState<Filter>('all')

  const unreadCount = items.filter((n) => !n.read).length

  const filtered = useMemo(() => {
    if (filter === 'all') return items
    if (filter === 'unread') return items.filter((n) => !n.read)
    return items.filter((n) => n.category === filter)
  }, [items, filter])

  const markAllRead = () => setItems((list) => list.map((n) => ({ ...n, read: true })))
  const clearAll = () => setItems([])
  const toggleRead = (id: string) =>
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: !n.read } : n)))
  const remove = (id: string) => setItems((list) => list.filter((n) => n.id !== id))

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <PageHeader
          title='Notifications'
          description='Stay on top of activity across your workspace.'
        />
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheckIcon /> Mark all read
          </Button>
          <Button variant='outline' size='sm' onClick={clearAll} disabled={items.length === 0}>
            <Trash2Icon /> Clear all
          </Button>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className='flex-wrap'>
          <TabsTrigger value='all'>All</TabsTrigger>
          <TabsTrigger value='unread'>
            Unread
            {unreadCount > 0 ? (
              <Badge variant='secondary' className='ml-1.5'>
                {unreadCount}
              </Badge>
            ) : null}
          </TabsTrigger>
          {Object.entries(categoryMeta).map(([key, meta]) => (
            <TabsTrigger key={key} value={key}>
              {meta.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <Card className='py-0'>
          <Empty className='py-16'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <BellIcon />
              </EmptyMedia>
              <EmptyTitle>No notifications</EmptyTitle>
              <EmptyDescription>
                {filter === 'all'
                  ? "You're all caught up. New activity will show up here."
                  : 'Nothing matches this filter right now.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </Card>
      ) : (
        <Card className='divide-border divide-y py-0'>
          {filtered.map((item) => {
            const meta = categoryMeta[item.category]
            const Icon = meta.icon
            return (
              <div
                key={item.id}
                className={cn(
                  'group flex items-start gap-4 p-4 transition-colors',
                  !item.read && 'bg-accent/30'
                )}
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full',
                    meta.className
                  )}
                >
                  <Icon className='size-4' />
                </span>
                <div className='min-w-0 flex-1 space-y-0.5'>
                  <div className='flex items-center gap-2'>
                    <p className={cn('truncate text-sm', !item.read && 'font-medium')}>{item.title}</p>
                    {!item.read ? <span className='bg-primary size-1.5 shrink-0 rounded-full' aria-hidden /> : null}
                  </div>
                  <p className='text-muted-foreground text-sm'>{item.description}</p>
                  <p className='text-muted-foreground text-xs'>{formatRelative(item.timestamp)}</p>
                </div>
                <div className='flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 text-xs'
                    onClick={() => toggleRead(item.id)}
                  >
                    {item.read ? 'Mark unread' : 'Mark read'}
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    aria-label='Remove notification'
                    onClick={() => remove(item.id)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            )
          })}
        </Card>
      )}
    </div>
  )
}
