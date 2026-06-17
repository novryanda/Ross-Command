'use client'

import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function HoverCardPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Hover Card' description='Preview content available behind a link.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant='link'>@nextjs</Button>
            </HoverCardTrigger>
            <HoverCardContent className='w-72'>
              <div className='space-y-1'>
                <h4 className='text-sm font-semibold'>@nextjs</h4>
                <p className='text-muted-foreground text-sm'>The React framework for production. Built by Vercel.</p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
