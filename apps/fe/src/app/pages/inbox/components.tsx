'use client'

import { ArchiveIcon, ArrowLeftIcon, StarIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import type { Email } from './data'

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const labelColors: Record<string, string> = {
  Work: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Personal: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  Important: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  Billing: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
}

type EmailListItemProps = {
  email: Email
  selected: boolean
  onSelect: () => void
  onToggleStar: () => void
}

export function EmailListItem({ email, selected, onSelect, onToggleStar }: EmailListItemProps) {
  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        'group relative flex w-full cursor-pointer gap-3 border-l-2 p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected
          ? 'bg-accent border-l-primary'
          : 'hover:bg-accent/50 border-l-transparent',
        !email.read && 'font-medium'
      )}
    >
      <Avatar className='size-9 shrink-0'>
        {email.from.avatar ? <AvatarImage src={email.from.avatar} alt={email.from.name} /> : null}
        <AvatarFallback className='text-xs'>{email.from.fallback}</AvatarFallback>
      </Avatar>

      <div className='min-w-0 flex-1 space-y-0.5'>
        <div className='flex items-center justify-between gap-2'>
          <span className={cn('truncate text-sm', !email.read && 'font-semibold')}>{email.from.name}</span>
          <span className='text-muted-foreground shrink-0 text-[10px]'>
            {formatRelative(email.receivedAt)}
          </span>
        </div>
        <p className={cn('truncate text-xs', !email.read ? 'text-foreground' : 'text-muted-foreground')}>
          {email.subject}
        </p>
        <p className='text-muted-foreground line-clamp-1 text-xs'>{email.preview}</p>
        {email.labels.length > 0 ? (
          <div className='flex flex-wrap gap-1 pt-1'>
            {email.labels.map((label) => (
              <Badge
                key={label}
                className={cn('h-4 rounded-sm px-1 text-[10px] font-normal', labelColors[label] ?? 'bg-muted')}
              >
                {label}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation()
          onToggleStar()
        }}
        className='shrink-0'
        aria-label={email.starred ? 'Unstar' : 'Star'}
      >
        <StarIcon
          className={cn(
            'size-3.5 transition-colors',
            email.starred ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground hover:text-foreground'
          )}
        />
      </button>

      {!email.read ? (
        <span className='bg-primary absolute right-3 top-3 size-1.5 rounded-full' aria-hidden />
      ) : null}
    </div>
  )
}

type EmailDetailProps = {
  email: Email | null
  onArchive: () => void
  onDelete: () => void
  onToggleStar: () => void
  onBack?: () => void
  onReply?: () => void
  onForward?: () => void
}

export function EmailDetail({ email, onArchive, onDelete, onToggleStar, onBack, onReply, onForward }: EmailDetailProps) {
  if (!email) {
    return (
      <div className='text-muted-foreground flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-sm'>
        <div className='bg-muted flex size-12 items-center justify-center rounded-full'>
          <ArchiveIcon className='size-5' />
        </div>
        <p>Select an email to read</p>
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col'>
      <div className='flex items-center justify-between gap-2 border-b p-3'>
        <div className='flex items-center gap-1'>
          {onBack ? (
            <Button variant='ghost' size='icon' className='size-7 md:hidden' onClick={onBack} aria-label='Back'>
              <ArrowLeftIcon className='size-4' />
            </Button>
          ) : null}
          <Button variant='ghost' size='icon' className='size-7' onClick={onArchive} aria-label='Archive'>
            <ArchiveIcon className='size-3.5' />
          </Button>
          <Button variant='ghost' size='icon' className='size-7' onClick={onDelete} aria-label='Delete'>
            <Trash2Icon className='size-3.5' />
          </Button>
        </div>
        <Button variant='ghost' size='icon' className='size-7' onClick={onToggleStar} aria-label='Star'>
          <StarIcon
            className={cn(
              'size-3.5',
              email.starred ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'
            )}
          />
        </Button>
      </div>

      <div className='flex-1 space-y-4 overflow-y-auto p-5'>
        <div className='space-y-1'>
          <h2 className='text-lg font-semibold leading-tight'>{email.subject}</h2>
          {email.labels.length > 0 ? (
            <div className='flex flex-wrap gap-1'>
              {email.labels.map((label) => (
                <Badge
                  key={label}
                  className={cn('h-4 rounded-sm px-1 text-[10px] font-normal', labelColors[label] ?? 'bg-muted')}
                >
                  {label}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        <Separator />

        <div className='flex items-center gap-3'>
          <Avatar className='size-10'>
            {email.from.avatar ? <AvatarImage src={email.from.avatar} alt={email.from.name} /> : null}
            <AvatarFallback className='text-xs'>{email.from.fallback}</AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-semibold'>{email.from.name}</p>
            <p className='text-muted-foreground truncate text-xs'>{email.from.email}</p>
          </div>
          <p className='text-muted-foreground shrink-0 text-xs'>
            {new Date(email.receivedAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div
          className='prose prose-sm dark:prose-invert max-w-none text-sm [&_li]:my-0 [&_p]:my-2 [&_ul]:my-2'
          dangerouslySetInnerHTML={{ __html: email.body }}
        />
      </div>

      <div className='border-t p-3'>
        <div className='flex gap-2'>
          <Button size='sm' className='flex-1' onClick={onReply}>
            Reply
          </Button>
          <Button variant='outline' size='sm' className='flex-1' onClick={onForward}>
            Forward
          </Button>
        </div>
      </div>
    </div>
  )
}
