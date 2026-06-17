'use client'

import { useState } from 'react'
import {
  CheckCircle2Icon,
  CreditCardIcon,
  FileTextIcon,
  GitPullRequestIcon,
  LogInIcon,
  MessageSquareIcon,
  SettingsIcon,
  TrashIcon,
  UserPlusIcon
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { PageHeader } from '@/components/showcase'
import { cn } from '@/lib/utils'

type ActivityType = 'auth' | 'comment' | 'payment' | 'member' | 'file' | 'settings' | 'deploy' | 'delete'

type Activity = {
  id: string
  type: ActivityType
  actor: { name: string; avatar: string; fallback: string }
  action: string
  target?: string
  timestamp: string
  date: string
}

const typeConfig: Record<ActivityType, { icon: typeof LogInIcon; color: string }> = {
  auth: { icon: LogInIcon, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  comment: { icon: MessageSquareIcon, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  payment: { icon: CreditCardIcon, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  member: { icon: UserPlusIcon, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  file: { icon: FileTextIcon, color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  settings: { icon: SettingsIcon, color: 'bg-muted text-muted-foreground' },
  deploy: { icon: GitPullRequestIcon, color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  delete: { icon: TrashIcon, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' }
}

import { avatarSrc as avatar } from '@/lib/assets'

const activities: Activity[] = [
  { id: 'a1', type: 'deploy', actor: { name: 'Cameron Williamson', avatar: avatar(1), fallback: 'CW' }, action: 'merged pull request', target: '#142 datatable refactor', timestamp: '10:42 AM', date: 'Today' },
  { id: 'a2', type: 'comment', actor: { name: 'Sarah Davis', avatar: avatar(2), fallback: 'SD' }, action: 'commented on', target: 'Q3 launch retro', timestamp: '9:18 AM', date: 'Today' },
  { id: 'a3', type: 'payment', actor: { name: 'System', avatar: avatar(3), fallback: 'SY' }, action: 'processed payment of', target: '$1,876.00 from Acme Corp', timestamp: '8:05 AM', date: 'Today' },
  { id: 'a4', type: 'member', actor: { name: 'Emma Chen', avatar: avatar(4), fallback: 'EC' }, action: 'invited', target: 'marcus@startup.com', timestamp: '4:30 PM', date: 'Yesterday' },
  { id: 'a5', type: 'auth', actor: { name: 'Diego Ramirez', avatar: avatar(5), fallback: 'DR' }, action: 'signed in from', target: 'San Francisco, CA', timestamp: '2:15 PM', date: 'Yesterday' },
  { id: 'a6', type: 'file', actor: { name: 'Olivia Park', avatar: avatar(6), fallback: 'OP' }, action: 'uploaded', target: 'brand-guidelines.pdf', timestamp: '11:50 AM', date: 'Yesterday' },
  { id: 'a7', type: 'settings', actor: { name: 'Robert Fox', avatar: avatar(7), fallback: 'RF' }, action: 'updated workspace settings', timestamp: '10:20 AM', date: 'Yesterday' },
  { id: 'a8', type: 'delete', actor: { name: 'Jennifer Cole', avatar: avatar(8), fallback: 'JC' }, action: 'deleted', target: 'old-campaign-assets folder', timestamp: '5:45 PM', date: 'May 27' },
  { id: 'a9', type: 'deploy', actor: { name: 'Cameron Williamson', avatar: avatar(1), fallback: 'CW' }, action: 'deployed to production', target: 'v2.4.1', timestamp: '3:10 PM', date: 'May 27' },
  { id: 'a10', type: 'member', actor: { name: 'Sarah Davis', avatar: avatar(2), fallback: 'SD' }, action: 'changed role of', target: 'Diego to Admin', timestamp: '1:00 PM', date: 'May 27' }
]

const filterOptions: Array<{ value: ActivityType | 'all'; label: string }> = [
  { value: 'all', label: 'All activity' },
  { value: 'deploy', label: 'Deployments' },
  { value: 'payment', label: 'Payments' },
  { value: 'member', label: 'Members' },
  { value: 'auth', label: 'Sign-ins' },
  { value: 'file', label: 'Files' }
]

export default function ActivityPage() {
  const [filter, setFilter] = useState<ActivityType | 'all'>('all')

  const filtered = activities.filter((a) => filter === 'all' || a.type === filter)
  const grouped = filtered.reduce<Record<string, Activity[]>>((acc, activity) => {
    acc[activity.date] = acc[activity.date] ?? []
    acc[activity.date].push(activity)
    return acc
  }, {})

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <PageHeader title='Activity' description='A timeline of everything happening in your workspace.' />
        <Select value={filter} onValueChange={(value) => setFilter(value as ActivityType | 'all')}>
          <SelectTrigger size='sm' className='w-40 text-sm'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
                    return (
                      <li key={activity.id} className='relative flex gap-3 px-4 py-3'>
                        {!isLast ? (
                          <span className='bg-border absolute left-[27px] top-11 h-[calc(100%-1rem)] w-px' aria-hidden />
                        ) : null}
                        <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-full', color)}>
                          <Icon className='size-3.5' />
                        </div>
                        <div className='flex min-w-0 flex-1 items-start justify-between gap-2'>
                          <div className='min-w-0 space-y-0.5'>
                            <p className='text-sm'>
                              <span className='font-medium'>{activity.actor.name}</span>{' '}
                              <span className='text-muted-foreground'>{activity.action}</span>{' '}
                              {activity.target ? <span className='font-medium'>{activity.target}</span> : null}
                            </p>
                            <div className='flex items-center gap-2'>
                              <Avatar className='size-4'>
                                <AvatarImage src={activity.actor.avatar} alt={activity.actor.name} />
                                <AvatarFallback className='text-[8px]'>{activity.actor.fallback}</AvatarFallback>
                              </Avatar>
                              <span className='text-muted-foreground text-xs'>{activity.timestamp}</span>
                            </div>
                          </div>
                          <Badge variant='secondary' className='h-5 shrink-0 rounded-sm px-1.5 text-[10px] capitalize'>
                            {activity.type}
                          </Badge>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </CardContent>
            </Card>
          </div>
        ))}

        {filtered.length === 0 ? (
          <Card>
            <CardContent className='text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm'>
              <CheckCircle2Icon className='size-8 opacity-40' />
              <p>No activity for this filter.</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
