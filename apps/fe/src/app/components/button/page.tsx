'use client'

import { ArrowRightIcon, MailIcon, Trash2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function ButtonPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Button' description='Displays a button or a component that looks like a button.' />
      <ShowcaseGrid>
        <Showcase title='Variants'>
          <Button>Default</Button>
          <Button variant='secondary'>Secondary</Button>
          <Button variant='outline'>Outline</Button>
          <Button variant='ghost'>Ghost</Button>
          <Button variant='link'>Link</Button>
          <Button variant='destructive'>Destructive</Button>
        </Showcase>
        <Showcase title='Sizes'>
          <Button size='sm'>Small</Button>
          <Button>Default</Button>
          <Button size='lg'>Large</Button>
          <Button size='icon' aria-label='Send'>
            <MailIcon />
          </Button>
        </Showcase>
        <Showcase title='With icons'>
          <Button>
            <MailIcon /> Login with Email
          </Button>
          <Button variant='outline'>
            Continue <ArrowRightIcon />
          </Button>
          <Button variant='destructive'>
            <Trash2Icon /> Delete
          </Button>
        </Showcase>
        <Showcase title='States'>
          <Button disabled>Disabled</Button>
          <Button variant='outline' disabled>
            Disabled outline
          </Button>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
