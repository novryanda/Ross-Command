'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronsUpDownIcon } from 'lucide-react'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function CollapsiblePage() {
  const [open, setOpen] = useState(false)

  return (
    <div className='space-y-8'>
      <PageHeader title='Collapsible' description='An interactive component that expands and collapses content.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Collapsible open={open} onOpenChange={setOpen} className='w-[320px] space-y-2'>
            <div className='flex items-center justify-between gap-4 rounded-md border px-4 py-2'>
              <span className='text-sm font-medium'>@moccilabs starred 3 repositories</span>
              <CollapsibleTrigger asChild>
                <Button variant='ghost' size='icon-sm'>
                  <ChevronsUpDownIcon />
                  <span className='sr-only'>Toggle</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <div className='rounded-md border px-4 py-2 font-mono text-sm'>@radix-ui/primitives</div>
            <CollapsibleContent className='space-y-2'>
              <div className='rounded-md border px-4 py-2 font-mono text-sm'>@radix-ui/colors</div>
              <div className='rounded-md border px-4 py-2 font-mono text-sm'>@stitches/react</div>
            </CollapsibleContent>
          </Collapsible>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
