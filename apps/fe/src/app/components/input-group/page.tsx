'use client'

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { MailIcon, SearchIcon } from 'lucide-react'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function InputGroupPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Input Group' description='An input with leading or trailing addons, text, and buttons.' />
      <ShowcaseGrid>
        <Showcase title='Icon addon'>
          <InputGroup className='w-[320px]'>
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder='Search...' />
          </InputGroup>
        </Showcase>
        <Showcase title='Text addon'>
          <InputGroup className='w-[320px]'>
            <InputGroupAddon>
              <InputGroupText>https://</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder='moccilabs.com' />
          </InputGroup>
        </Showcase>
        <Showcase title='Button addon'>
          <InputGroup className='w-[320px]'>
            <InputGroupAddon>
              <MailIcon />
            </InputGroupAddon>
            <InputGroupInput type='email' placeholder='you@moccilabs.com' />
            <InputGroupAddon align='inline-end'>
              <InputGroupButton variant='default' size='sm'>
                Subscribe
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
