'use client'

import { useEffect } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to your error reporting service here.
    console.error(error)
  }, [error])

  return (
    <div className='bg-background flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center'>
      <p className='text-muted-foreground text-xs font-medium tracking-widest uppercase'>Error 500</p>
      <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>Something went wrong</h1>
      <p className='text-muted-foreground max-w-md text-sm'>
        An unexpected error occurred. You can try again, or head back to the dashboard.
      </p>
      {error.digest ? (
        <p className='text-muted-foreground/70 font-mono text-xs'>Error ID: {error.digest}</p>
      ) : null}
      <div className='mt-2 flex gap-3'>
        <Button onClick={reset}>Try again</Button>
        <Button variant='outline' asChild>
          <Link href='/dashboard'>Back to dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
