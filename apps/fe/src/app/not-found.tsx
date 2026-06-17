import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className='bg-background flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center'>
      <p className='text-muted-foreground text-xs font-medium tracking-widest uppercase'>Error 404</p>
      <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>Page not found</h1>
      <p className='text-muted-foreground max-w-md text-sm'>
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have been moved or deleted.
      </p>
      <div className='mt-2 flex gap-3'>
        <Button asChild>
          <Link href='/dashboard'>Back to dashboard</Link>
        </Button>
        <Button variant='outline' asChild>
          <Link href='/'>Go home</Link>
        </Button>
      </div>
    </div>
  )
}
