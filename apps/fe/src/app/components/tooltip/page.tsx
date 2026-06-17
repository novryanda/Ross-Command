'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function TooltipPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Tooltip' description='Popup with extra information on hover or focus.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='outline'>Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>Add to library</TooltipContent>
          </Tooltip>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
