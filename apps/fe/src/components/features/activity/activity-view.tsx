import Link from 'next/link'
import {
  AlertTriangleIcon,
  ClipboardCheckIcon,
  InboxIcon,
  LogInIcon,
  SendIcon,
  XCircleIcon
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type {
  ActivityCategory,
  ActivityItem,
  ActivityType
} from '@/lib/api/types'
import { cn } from '@/lib/utils'

const typeConfig: Record<ActivityType, { icon: typeof LogInIcon; color: string; label: string }> = {
  login_success: {
    icon: LogInIcon,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    label: 'Login berhasil'
  },
  login_failed: {
    icon: XCircleIcon,
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    label: 'Login gagal'
  },
  order_created: {
    icon: ClipboardCheckIcon,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    label: 'Perintah dibuat'
  },
  order_sent: {
    icon: SendIcon,
    color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    label: 'Perintah dikirim'
  },
  submission_sent: {
    icon: InboxIcon,
    color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
    label: 'Bukti dikirim'
  }
}

const sampleActivities: ActivityItem[] = [
  {
    id: 'sample-1',
    category: 'order',
    type: 'order_created',
    actor: { id: null, name: 'Pimpinan Pusat', username: 'komando_pusat' },
    title: 'Perintah dibuat',
    description: 'Upload Konten Kampanye Juni',
    href: null,
    occurredAt: new Date().toISOString()
  },
  {
    id: 'sample-2',
    category: 'submission',
    type: 'submission_sent',
    actor: { id: null, name: 'Sersan Budi Santoso', username: 'budi_santoso' },
    title: 'Bukti dikirim',
    description: 'Serbu Postingan @target_akun',
    href: null,
    occurredAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  }
]

const categoryLabels: Record<ActivityCategory, string> = {
  auth: 'Autentikasi',
  order: 'Perintah',
  submission: 'Bukti'
}

export function ActivityView({
  activities = sampleActivities,
}: {
  activities?: ActivityItem[]
}) {
  const grouped = [...activities]
    .sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
    )
    .reduce<Record<string, ActivityItem[]>>((acc, activity) => {
    const date = formatDateLabel(activity.occurredAt)
    acc[date] = acc[date] ?? []
    acc[date].push(activity)
    return acc
  }, {})

  return (
    <div className='space-y-6'>
      <div className='space-y-6'>
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} className='space-y-3'>
            <div className='flex items-center gap-3'>
              <h2 className='text-muted-foreground text-xs font-medium uppercase tracking-wider'>{date}</h2>
              <span className='bg-border h-px flex-1' aria-hidden />
            </div>

            <Card>
              <CardContent className='p-0'>
                <ol className='relative'>
                  {items.map((activity, index) => {
                    const { icon: Icon, color } = typeConfig[activity.type]
                    const isLast = index === items.length - 1
                    const content = (
                      <div className='relative flex gap-3 px-4 py-3'>
                        {!isLast ? (
                          <span className='bg-border absolute left-[27px] top-11 h-[calc(100%-1rem)] w-px' aria-hidden />
                        ) : null}
                        <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-full', color)}>
                          <Icon className='size-3.5' />
                        </div>
                        <div className='flex min-w-0 flex-1 items-start justify-between gap-2'>
                          <div className='min-w-0 space-y-1'>
                            <div className='flex flex-wrap items-center gap-2'>
                              <p className='text-sm font-medium'>{activity.title}</p>
                              <Badge variant='secondary' className='h-5 shrink-0 rounded-sm px-1.5 text-[10px] capitalize'>
                                {categoryLabels[activity.category]}
                              </Badge>
                            </div>
                            <p className='text-muted-foreground text-sm'>{activity.description}</p>
                            <div className='flex items-center gap-2'>
                              <Avatar className='size-5'>
                                <AvatarFallback className='text-[9px]'>
                                  {initialsFromName(activity.actor.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className='text-xs font-medium'>{activity.actor.name}</span>
                              {activity.actor.username ? (
                                <span className='text-muted-foreground text-xs'>@{activity.actor.username}</span>
                              ) : null}
                              <span className='text-muted-foreground text-xs'>{formatTime(activity.occurredAt)}</span>
                            </div>
                          </div>
                          {activity.href ? (
                            <span className='border-input bg-background inline-flex h-8 shrink-0 items-center justify-center rounded-md border px-3 text-xs font-medium'>
                              Buka
                            </span>
                          ) : null}
                        </div>
                      </div>
                    )

                    return (
                      <li key={activity.id}>
                        {activity.href ? (
                          <Link href={activity.href} className='block transition-colors hover:bg-accent/40'>
                            {content}
                          </Link>
                        ) : (
                          content
                        )}
                      </li>
                    )
                  })}
                </ol>
              </CardContent>
            </Card>
          </div>
        ))}

        {activities.length === 0 ? (
          <Card>
            <CardContent className='text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm'>
              <AlertTriangleIcon className='size-8 opacity-40' />
              <p>Tidak ada aktivitas untuk filter ini.</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

function formatDateLabel(value: string) {
  const date = new Date(value)
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((startOfToday.getTime() - startOfTarget.getTime()) / 86_400_000)

  if (diffDays === 0) return 'Hari ini'
  if (diffDays === 1) return 'Kemarin'

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function initialsFromName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'AC'
}
