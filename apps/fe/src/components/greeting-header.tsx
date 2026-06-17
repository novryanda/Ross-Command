'use client'

import { useSyncExternalStore } from 'react'

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric'
})

// Stable client snapshot so the value is read once and doesn't loop renders.
let cachedNow: number | null = null

function subscribe() {
  return () => {}
}

function getClientSnapshot() {
  if (cachedNow === null) cachedNow = Date.now()
  return cachedNow
}

function getServerSnapshot() {
  return null
}

export function GreetingHeader({ name = 'there' }: { name?: string }) {
  const timestamp = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
  const now = timestamp !== null ? new Date(timestamp) : null

  const greeting = now ? getGreeting(now.getHours()) : 'Welcome back'
  const dateLabel = now ? dateFormatter.format(now) : ''

  return (
    <div className='space-y-1'>
      <h1 className='text-2xl font-semibold tracking-tight'>
        {greeting}, {name}
      </h1>
      <p className='text-muted-foreground text-sm'>
        {dateLabel ? `${dateLabel} · ` : ''}Here&apos;s what&apos;s happening with your store today.
      </p>
    </div>
  )
}
