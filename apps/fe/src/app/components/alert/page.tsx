'use client'

import { AlertCircleIcon, CheckCircle2Icon, InfoIcon, TerminalIcon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function AlertPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Alert'
        description='Displays a callout for user attention.'
      />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Alert>
            <TerminalIcon />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>You can add components to your app using the cli.</AlertDescription>
          </Alert>
        </Showcase>
        <Showcase title='Destructive'>
          <Alert variant='destructive'>
            <AlertCircleIcon />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
          </Alert>
        </Showcase>
        <Showcase title='With icons'>
          <div className='grid w-full gap-3'>
            <Alert>
              <InfoIcon />
              <AlertTitle>Info</AlertTitle>
              <AlertDescription>This is an informational message.</AlertDescription>
            </Alert>
            <Alert>
              <CheckCircle2Icon />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Your changes have been saved.</AlertDescription>
            </Alert>
          </div>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
