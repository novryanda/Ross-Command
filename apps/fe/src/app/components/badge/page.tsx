import { Badge } from '@/components/ui/badge'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function BadgePage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Badge' description='Displays a badge or a component that looks like a badge.' />
      <ShowcaseGrid>
        <Showcase title='Variants'>
          <Badge>Default</Badge>
          <Badge variant='secondary'>Secondary</Badge>
          <Badge variant='outline'>Outline</Badge>
          <Badge variant='destructive'>Destructive</Badge>
        </Showcase>
        <Showcase title='With dot'>
          <Badge className='bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'>
            <span className='mr-1.5 size-1.5 rounded-full bg-emerald-500' /> Active
          </Badge>
          <Badge className='bg-amber-500/15 text-amber-700 dark:text-amber-400'>
            <span className='mr-1.5 size-1.5 rounded-full bg-amber-500' /> Pending
          </Badge>
          <Badge className='bg-rose-500/15 text-rose-700 dark:text-rose-400'>
            <span className='mr-1.5 size-1.5 rounded-full bg-rose-500' /> Failed
          </Badge>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
