'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DatePickerPage() {
  const [date, setDate] = useState<Date>()

  return (
    <div className='space-y-8'>
      <PageHeader title='Date Picker' description='A date picker built using Calendar and Popover.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' className={cn('w-[260px] justify-start font-normal', !date && 'text-muted-foreground')}>
                <CalendarIcon /> {date ? date.toLocaleDateString() : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
              <Calendar mode='single' selected={date} onSelect={setDate} />
            </PopoverContent>
          </Popover>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
