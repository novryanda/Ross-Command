'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function SelectPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Select' description='Displays a list of options for the user to pick from.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Select>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='Select a fruit' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='apple'>Apple</SelectItem>
              <SelectItem value='banana'>Banana</SelectItem>
              <SelectItem value='orange'>Orange</SelectItem>
              <SelectItem value='grape'>Grape</SelectItem>
            </SelectContent>
          </Select>
        </Showcase>
        <Showcase title='Disabled'>
          <Select disabled>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='Disabled' />
            </SelectTrigger>
          </Select>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
