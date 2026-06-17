'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function LabelPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Label' description='Accessible label associated with controls.' />
      <ShowcaseGrid>
        <Showcase title='With input'>
          <div className='grid w-full max-w-sm gap-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' type='email' placeholder='you@example.com' />
          </div>
        </Showcase>
        <Showcase title='With checkbox'>
          <div className='flex items-center gap-2'>
            <Checkbox id='accept' />
            <Label htmlFor='accept'>Accept terms</Label>
          </div>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
