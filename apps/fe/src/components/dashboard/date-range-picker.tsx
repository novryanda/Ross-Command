'use client'

import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type Preset = { label: string; days: number }

const presets: Preset[] = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last 12 months', days: 365 }
]

const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

function formatRange(range?: DateRange) {
  if (!range?.from) return 'Pick a date range'
  if (!range.to) return fmt.format(range.from)
  return `${fmt.format(range.from)} – ${fmt.format(range.to)}`
}

export function DateRangePicker({
  value,
  onChange,
  className
}: {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)

  const applyPreset = (days: number) => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - (days - 1))
    onChange?.({ from, to })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={cn('justify-start font-normal', !value?.from && 'text-muted-foreground', className)}
        >
          <CalendarIcon />
          {formatRange(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='flex w-auto flex-col p-0 sm:flex-row'>
        <div className='flex flex-col gap-1 p-3 sm:border-r'>
          {presets.map((preset) => (
            <Button
              key={preset.label}
              variant='ghost'
              size='sm'
              className='justify-start font-normal'
              onClick={() => applyPreset(preset.days)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <Separator className='sm:hidden' />
        <div className='p-2'>
          <Calendar
            mode='range'
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={1}
            className='sm:[--cell-size:2rem]'
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
