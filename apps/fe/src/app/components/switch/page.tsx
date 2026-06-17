'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function SwitchPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Switch' description='A control that toggles between on and off states.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <div className='flex items-center gap-3'>
            <Switch id='airplane' />
            <Label htmlFor='airplane'>Airplane mode</Label>
          </div>
        </Showcase>
        <Showcase title='Disabled'>
          <div className='flex items-center gap-3'>
            <Switch id='disabled-switch' disabled />
            <Label htmlFor='disabled-switch'>Disabled</Label>
          </div>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
