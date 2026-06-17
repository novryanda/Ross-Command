'use client'

import { BoldIcon, ItalicIcon, UnderlineIcon } from 'lucide-react'

import { Toggle } from '@/components/ui/toggle'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function TogglePage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Toggle' description='A two-state button that can be either on or off.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Toggle aria-label='Toggle bold'>
            <BoldIcon />
          </Toggle>
          <Toggle aria-label='Toggle italic'>
            <ItalicIcon />
          </Toggle>
          <Toggle aria-label='Toggle underline'>
            <UnderlineIcon />
          </Toggle>
        </Showcase>
        <Showcase title='With text'>
          <Toggle aria-label='Bold'>
            <BoldIcon /> Bold
          </Toggle>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
