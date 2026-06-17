'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function TextareaPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Textarea' description='Multi-line text input.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Textarea className='max-w-md' placeholder='Type your message...' />
        </Showcase>
        <Showcase title='With label'>
          <div className='grid w-full max-w-md gap-2'>
            <Label htmlFor='msg'>Your message</Label>
            <Textarea id='msg' placeholder='Tell us what you think...' rows={5} />
          </div>
        </Showcase>
        <Showcase title='Disabled'>
          <Textarea className='max-w-md' disabled placeholder='Disabled' />
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
