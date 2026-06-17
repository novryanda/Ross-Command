'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function InputPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Input' description='A text input component for forms and user data entry.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Input className='max-w-sm' placeholder='Email' />
        </Showcase>
        <Showcase title='With label'>
          <div className='grid w-full max-w-sm gap-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' type='email' placeholder='you@example.com' />
          </div>
        </Showcase>
        <Showcase title='Disabled'>
          <Input className='max-w-sm' disabled placeholder='Disabled input' />
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
