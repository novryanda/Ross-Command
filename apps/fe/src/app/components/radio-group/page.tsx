'use client'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function RadioGroupPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Radio Group' description='Set of checkable buttons where only one can be checked.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <RadioGroup defaultValue='comfortable' className='gap-3'>
            <div className='flex items-center gap-2'>
              <RadioGroupItem value='default' id='r1' />
              <Label htmlFor='r1'>Default</Label>
            </div>
            <div className='flex items-center gap-2'>
              <RadioGroupItem value='comfortable' id='r2' />
              <Label htmlFor='r2'>Comfortable</Label>
            </div>
            <div className='flex items-center gap-2'>
              <RadioGroupItem value='compact' id='r3' />
              <Label htmlFor='r3'>Compact</Label>
            </div>
          </RadioGroup>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
