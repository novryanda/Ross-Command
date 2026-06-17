'use client'

import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function SonnerPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Sonner' description='An opinionated toast component for React.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Button variant='outline' onClick={() => toast('Event has been created.')}>
            Show toast
          </Button>
        </Showcase>
        <Showcase title='Variants'>
          <Button onClick={() => toast.success('Saved successfully.')}>Success</Button>
          <Button variant='destructive' onClick={() => toast.error('Something went wrong.')}>
            Error
          </Button>
          <Button variant='outline' onClick={() => toast.info('New version is available.')}>
            Info
          </Button>
        </Showcase>
      </ShowcaseGrid>
      <Toaster />
    </div>
  )
}
