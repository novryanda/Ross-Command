'use client'

import { BoldIcon, ItalicIcon, UnderlineIcon } from 'lucide-react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function ToggleGroupPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Toggle Group' description='A set of two-state buttons that can be toggled on or off.' />
      <ShowcaseGrid>
        <Showcase title='Single'>
          <ToggleGroup type='single' defaultValue='bold'>
            <ToggleGroupItem value='bold' aria-label='Bold'>
              <BoldIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value='italic' aria-label='Italic'>
              <ItalicIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value='underline' aria-label='Underline'>
              <UnderlineIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </Showcase>
        <Showcase title='Multiple'>
          <ToggleGroup type='multiple'>
            <ToggleGroupItem value='bold'>Bold</ToggleGroupItem>
            <ToggleGroupItem value='italic'>Italic</ToggleGroupItem>
            <ToggleGroupItem value='underline'>Underline</ToggleGroupItem>
          </ToggleGroup>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
