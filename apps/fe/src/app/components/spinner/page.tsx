'use client'

import { Loader2Icon } from 'lucide-react'

import { Spinner } from '@/components/ui/spinner'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function SpinnerPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Spinner' description='Indicator showing a loading state.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Spinner />
        </Showcase>
        <Showcase title='Custom icon'>
          <Spinner>
            <Loader2Icon />
          </Spinner>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
