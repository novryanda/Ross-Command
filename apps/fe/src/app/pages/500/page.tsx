'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function ServerErrorPage() {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center'>
      <p className='text-muted-foreground text-xs font-medium tracking-widest uppercase'>Error 500</p>
      <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>Something went wrong</h1>
      <p className='text-muted-foreground max-w-md text-sm'>
        Our servers ran into an unexpected issue. Please try again shortly or contact support if the problem persists.
      </p>
      <div className='mt-2 flex gap-3'>
        <Button asChild>
          <Link href='/dashboard'>Back to dashboard</Link>
        </Button>
        <Button variant='outline' onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    </div>
  )
}
