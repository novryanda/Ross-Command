import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function SkeletonPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Skeleton' description='Placeholder while content is loading.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <div className='flex w-full max-w-sm items-center gap-3'>
            <Skeleton className='size-10 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-3 w-3/5' />
              <Skeleton className='h-3 w-4/5' />
            </div>
          </div>
        </Showcase>
        <Showcase title='Card'>
          <div className='w-full max-w-sm space-y-3'>
            <Skeleton className='h-32 w-full rounded-lg' />
            <Skeleton className='h-3 w-2/3' />
            <Skeleton className='h-3 w-1/2' />
          </div>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
