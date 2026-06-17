'use client'

import { useState } from 'react'
import { CalendarIcon, ClockIcon, MapPinIcon, PlusIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/showcase'
import { cn } from '@/lib/utils'

type Event = {
  id: string
  title: string
  date: string
  time: string
  location?: string
  category: 'meeting' | 'review' | 'social' | 'deadline'
}

const today = new Date()
const offset = (days: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

const events: Event[] = [
  {
    id: 'e1',
    title: 'Design system review',
    date: offset(0),
    time: '10:00 - 11:00',
    location: 'Meeting Room 2',
    category: 'review'
  },
  {
    id: 'e2',
    title: '1:1 with Sarah',
    date: offset(0),
    time: '14:30 - 15:00',
    location: 'Zoom',
    category: 'meeting'
  },
  {
    id: 'e3',
    title: 'Sprint planning',
    date: offset(1),
    time: '09:00 - 10:30',
    location: 'Main conference room',
    category: 'meeting'
  },
  {
    id: 'e4',
    title: 'Q3 roadmap deadline',
    date: offset(2),
    time: 'All day',
    category: 'deadline'
  },
  {
    id: 'e5',
    title: 'Team lunch',
    date: offset(3),
    time: '12:00 - 13:30',
    location: 'Sushi place',
    category: 'social'
  },
  {
    id: 'e6',
    title: 'Quarterly review',
    date: offset(5),
    time: '15:00 - 16:00',
    location: 'Meeting Room 1',
    category: 'review'
  },
  {
    id: 'e7',
    title: 'Product sync',
    date: offset(7),
    time: '11:00 - 12:00',
    location: 'Zoom',
    category: 'meeting'
  }
]

const categoryStyles: Record<Event['category'], string> = {
  meeting: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  review: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  social: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  deadline: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
}

const categoryDot: Record<Event['category'], string> = {
  meeting: 'bg-blue-500',
  review: 'bg-violet-500',
  social: 'bg-emerald-500',
  deadline: 'bg-rose-500'
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
}

export default function CalendarPage() {
  const [selected, setSelected] = useState<Date | undefined>(today)

  const selectedKey = selected?.toISOString().split('T')[0]
  const dayEvents = events.filter((e) => e.date === selectedKey)
  const upcoming = events
    .filter((e) => new Date(e.date) >= today)
    .slice(0, 5)

  const eventDates = events.map((e) => new Date(e.date))

  return (
    <div className='space-y-6'>
      <PageHeader title='Calendar' description='View your schedule and upcoming events.' />

      <div className='grid gap-4 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader className='flex-row items-center justify-between'>
            <CardTitle className='text-base'>Schedule</CardTitle>
            <Button size='sm' className='h-8'>
              <PlusIcon className='size-3.5' /> New event
            </Button>
          </CardHeader>
          <CardContent className='pb-6'>
            <Calendar
              mode='single'
              selected={selected}
              onSelect={setSelected}
              modifiers={{ hasEvent: eventDates }}
              modifiersClassNames={{
                hasEvent: 'font-semibold underline decoration-primary decoration-2 underline-offset-4'
              }}
              className='w-full [--cell-size:--spacing(11)]'
              classNames={{
                root: 'w-full',
                months: 'relative flex w-full flex-col gap-4',
                month: 'flex w-full flex-col gap-4',
                table: 'w-full border-collapse',
                week: 'mt-2 flex w-full',
                weekdays: 'flex w-full',
                day: 'group/day relative aspect-square h-full w-full flex-1 p-0 text-center select-none'
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>
              {selected ? formatDate(selected) : 'Select a date'}
            </CardTitle>
            <p className='text-muted-foreground text-xs'>
              {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
            </p>
          </CardHeader>
          <CardContent className='space-y-3'>
            {dayEvents.length === 0 ? (
              <div className='text-muted-foreground flex flex-col items-center gap-2 py-8 text-center text-xs'>
                <CalendarIcon className='size-8 opacity-40' />
                <p>No events scheduled</p>
                <Button variant='outline' size='sm' className='mt-2 h-7 text-xs'>
                  <PlusIcon className='size-3' /> Add event
                </Button>
              </div>
            ) : (
              dayEvents.map((event) => (
                <div key={event.id} className='hover:bg-accent rounded-md border p-3 transition-colors'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex items-start gap-2'>
                      <span
                        className={cn('mt-1 size-2 shrink-0 rounded-full', categoryDot[event.category])}
                        aria-hidden
                      />
                      <p className='text-sm font-medium'>{event.title}</p>
                    </div>
                    <Badge className={cn('h-5 rounded-sm px-1.5 text-[10px] capitalize', categoryStyles[event.category])}>
                      {event.category}
                    </Badge>
                  </div>
                  <div className='text-muted-foreground mt-2 space-y-1 pl-4 text-xs'>
                    <p className='flex items-center gap-1.5'>
                      <ClockIcon className='size-3' /> {event.time}
                    </p>
                    {event.location ? (
                      <p className='flex items-center gap-1.5'>
                        <MapPinIcon className='size-3' /> {event.location}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Upcoming</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className='divide-border divide-y'>
            {upcoming.map((event) => {
              const date = new Date(event.date)
              return (
                <li key={event.id} className='flex items-center gap-4 py-3 first:pt-0 last:pb-0'>
                  <div className='bg-muted flex size-10 flex-col items-center justify-center rounded-md'>
                    <span className='text-muted-foreground text-[10px] uppercase'>
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className='text-sm font-semibold leading-none'>{date.getDate()}</span>
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>{event.title}</p>
                    <p className='text-muted-foreground text-xs'>
                      {event.time}
                      {event.location ? ` · ${event.location}` : ''}
                    </p>
                  </div>
                  <Badge className={cn('h-5 rounded-sm px-1.5 text-[10px] capitalize', categoryStyles[event.category])}>
                    {event.category}
                  </Badge>
                </li>
              )
            })}
          </ul>
          <Separator className='my-3' />
          <Button variant='ghost' size='sm' className='w-full text-xs'>
            View all events
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
