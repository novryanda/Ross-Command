import { Progress } from '@/components/ui/progress'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function ProgressPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Progress' description='Indicator showing the completion progress of a task.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Progress value={33} className='w-full max-w-sm' />
        </Showcase>
        <Showcase title='Variants'>
          <div className='w-full max-w-sm space-y-3'>
            <Progress value={20} />
            <Progress value={50} />
            <Progress value={80} />
          </div>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
