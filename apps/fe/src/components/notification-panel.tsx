'use client'

import { useState } from 'react'
import { BellIcon, CheckCheckIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export type Notification = {
  id: string
  title: string
  description: string
  /** ISO date string */
  timestamp: string
  read?: boolean
}

const initialNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'New comment on your post',
    description: 'Sarah Davis replied to "Q3 launch retrospective".',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: 'n2',
    title: 'Payment received',
    description: 'You received $312.40 from Acme Corp.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'n3',
    title: 'Build completed',
    description: 'Production deploy finished in 1m 24s.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    read: true
  },
  {
    id: 'n4',
    title: 'New team member',
    description: 'Cameron Williamson joined the workspace.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true
  }
]

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationPanel({
  notifications: initial = initialNotifications
}: {
  notifications?: Notification[]
}) {
  const [items, setItems] = useState(initial)
  const unread = items.filter((n) => !n.read).length

  const markAllRead = () => setItems((list) => list.map((n) => ({ ...n, read: true })))
  const markRead = (id: string) =>
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)))

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' aria-label='Notifications' className='relative'>
          <BellIcon />
          {unread > 0 ? (
            <span className='bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-medium'>
              {unread > 9 ? '9+' : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-80 p-0'>
        <div className='flex items-center justify-between p-3'>
          <div>
            <p className='text-sm font-semibold'>Notifications</p>
            <p className='text-muted-foreground text-xs'>
              {unread > 0 ? `${unread} unread` : 'All caught up'}
            </p>
          </div>
          {unread > 0 ? (
            <Button variant='ghost' size='sm' className='h-7 text-xs' onClick={markAllRead}>
              <CheckCheckIcon className='size-3.5' /> Mark all
            </Button>
          ) : null}
        </div>

        <Separator />

        <ScrollArea className='max-h-80'>
          {items.length === 0 ? (
            <p className='text-muted-foreground py-8 text-center text-xs'>No notifications</p>
          ) : (
            <ul className='divide-border divide-y'>
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type='button'
                    onClick={() => markRead(item.id)}
                    className='hover:bg-accent flex w-full items-start gap-3 p-3 text-left transition-colors'
                  >
                    <span
                      className={cn(
                        'mt-1.5 size-1.5 shrink-0 rounded-full',
                        item.read ? 'bg-transparent' : 'bg-primary'
                      )}
                      aria-hidden
                    />
                    <div className='min-w-0 flex-1 space-y-0.5'>
                      <p
                        className={cn(
                          'truncate text-sm',
                          item.read ? 'text-muted-foreground' : 'font-medium'
                        )}
                      >
                        {item.title}
                      </p>
                      <p className='text-muted-foreground line-clamp-2 text-xs'>{item.description}</p>
                      <p className='text-muted-foreground text-[10px]'>{formatRelative(item.timestamp)}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        <Separator />

        <div className='p-2'>
          <Button variant='ghost' size='sm' className='w-full text-xs'>
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
