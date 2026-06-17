import { AspectRatio } from '@/components/ui/aspect-ratio'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function AspectRatioPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Aspect Ratio' description='Displays content within a desired ratio.' />
      <ShowcaseGrid>
        <Showcase title='16:9'>
          <div className='w-full max-w-md'>
            <AspectRatio ratio={16 / 9} className='bg-muted rounded-lg' />
          </div>
        </Showcase>
        <Showcase title='4:3'>
          <div className='w-full max-w-md'>
            <AspectRatio ratio={4 / 3} className='bg-muted rounded-lg' />
          </div>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
