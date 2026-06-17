'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

import { ME, type Message, type Participant } from './data'

const statusDot: Record<Participant['status'], string> = {
  online: 'bg-emerald-500',
  away: 'bg-amber-500',
  offline: 'bg-muted-foreground'
}

export function StatusAvatar({
  participant,
  size = 'md'
}: {
  participant: Participant
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClass = size === 'sm' ? 'size-7' : size === 'lg' ? 'size-10' : 'size-9'
  const dotSize = size === 'sm' ? 'size-2' : 'size-2.5'

  return (
    <div className='relative shrink-0'>
      <Avatar className={sizeClass}>
        <AvatarImage src={participant.avatar} alt={participant.name} />
        <AvatarFallback className='text-xs'>{participant.fallback}</AvatarFallback>
      </Avatar>
      <span
        className={cn(
          'border-card absolute bottom-0 right-0 rounded-full border-2',
          dotSize,
          statusDot[participant.status]
        )}
        aria-label={participant.status}
      />
    </div>
  )
}

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ConversationItem({
  participant,
  lastMessage,
  unread,
  active,
  pinned,
  onClick
}: {
  participant: Participant
  lastMessage?: Message
  unread: number
  active: boolean
  pinned?: boolean
  onClick: () => void
}) {
  const preview = lastMessage
    ? lastMessage.authorId === ME
      ? `You: ${lastMessage.body}`
      : lastMessage.body
    : 'No messages yet'

  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors',
        active ? 'bg-accent' : 'hover:bg-accent/50'
      )}
    >
      <StatusAvatar participant={participant} />
      <div className='min-w-0 flex-1 space-y-0.5'>
        <div className='flex items-center justify-between gap-2'>
          <span className={cn('truncate text-sm', unread > 0 && 'font-semibold')}>{participant.name}</span>
          {lastMessage ? (
            <span className='text-muted-foreground shrink-0 text-[10px]'>
              {formatTime(lastMessage.sentAt)}
            </span>
          ) : null}
        </div>
        <p
          className={cn(
            'line-clamp-1 text-xs',
            unread > 0 ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {preview}
        </p>
      </div>
      <div className='flex flex-col items-end gap-1'>
        {pinned ? <span className='text-muted-foreground text-[10px]'>📌</span> : null}
        {unread > 0 ? (
          <span className='bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full text-[10px] font-medium'>
            {unread}
          </span>
        ) : null}
      </div>
    </button>
  )
}

export function MessageBubble({
  message,
  participant,
  showAvatar
}: {
  message: Message
  participant: Participant
  showAvatar: boolean
}) {
  const mine = message.authorId === ME

  return (
    <div className={cn('flex items-end gap-2', mine && 'flex-row-reverse')}>
      <div className='size-7 shrink-0'>
        {showAvatar ? (
          <Avatar className='size-7'>
            <AvatarImage src={participant.avatar} alt={participant.name} />
            <AvatarFallback className='text-[10px]'>{participant.fallback}</AvatarFallback>
          </Avatar>
        ) : null}
      </div>
      <div
        className={cn(
          'max-w-[75%] space-y-1',
          mine ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-3 py-2 text-sm',
            mine
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted rounded-bl-sm'
          )}
        >
          {message.body}
        </div>
        {showAvatar ? (
          <p className={cn('text-muted-foreground text-[10px]', mine && 'text-right')}>
            {new Date(message.sentAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
        ) : null}
      </div>
    </div>
  )
}
