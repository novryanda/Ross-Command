import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className='space-y-1 border-b pb-3'>
      <h1 className='text-lg font-semibold tracking-tight'>{title}</h1>
      {description ? <p className='text-muted-foreground text-xs'>{description}</p> : null}
    </div>
  )
}

type ShowcaseProps = {
  title: string
  description?: string
  children: ReactNode
  code?: string
}

export function Showcase({ title, description, children }: ShowcaseProps) {
  return (
    <section className='space-y-3'>
      <div className='space-y-0.5'>
        <h2 className='text-sm font-semibold'>{title}</h2>
        {description ? <p className='text-muted-foreground text-xs'>{description}</p> : null}
      </div>
      <div className='bg-card flex min-h-32 flex-wrap items-center justify-center gap-3 rounded-lg border p-6'>
        {children}
      </div>
    </section>
  )
}

export function ShowcaseGrid({ children }: { children: ReactNode }) {
  return <div className='grid gap-4'>{children}</div>
}
