'use client'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function PopoverPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Popover' description='Rich content in a portal triggered by a button.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline'>Open popover</Button>
            </PopoverTrigger>
            <PopoverContent className='w-72 space-y-2'>
              <p className='text-sm font-medium'>Dimensions</p>
              <div className='grid gap-2'>
                <div className='grid grid-cols-3 items-center gap-2'>
                  <Label>Width</Label>
                  <Input defaultValue='100%' className='col-span-2 h-8' />
                </div>
                <div className='grid grid-cols-3 items-center gap-2'>
                  <Label>Height</Label>
                  <Input defaultValue='25px' className='col-span-2 h-8' />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
