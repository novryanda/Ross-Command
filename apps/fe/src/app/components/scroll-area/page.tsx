import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

const tags = Array.from({ length: 30 }, (_, i) => `Tag ${i + 1}`)

export default function ScrollAreaPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Scroll Area' description='Custom cross-browser styled scroll.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <ScrollArea className='h-60 w-full max-w-xs rounded-md border p-4'>
            <h4 className='mb-3 text-sm font-medium'>Tags</h4>
            {tags.map((tag) => (
              <div key={tag}>
                <div className='text-sm'>{tag}</div>
                <Separator className='my-2' />
              </div>
            ))}
          </ScrollArea>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
