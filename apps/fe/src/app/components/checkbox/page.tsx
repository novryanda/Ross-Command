'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function CheckboxPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Checkbox'
        description='A control that allows the user to toggle between checked and not checked.'
      />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <div className='flex items-center gap-2'>
            <Checkbox id='terms' />
            <Label htmlFor='terms'>Accept terms and conditions</Label>
          </div>
        </Showcase>
        <Showcase title='Disabled'>
          <div className='flex items-center gap-2'>
            <Checkbox id='disabled' disabled />
            <Label htmlFor='disabled'>Disabled checkbox</Label>
          </div>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
