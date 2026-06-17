import { Separator } from '@/components/ui/separator'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function SeparatorPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Separator' description='Visually or semantically separates content.' />
      <ShowcaseGrid>
        <Showcase title='Horizontal'>
          <div className='w-full max-w-sm'>
            <p className='text-sm font-medium'>Radix Primitives</p>
            <p className='text-muted-foreground text-sm'>An open-source UI component library.</p>
            <Separator className='my-4' />
            <div className='text-muted-foreground flex h-5 items-center gap-4 text-sm'>
              <span>Blog</span>
              <Separator orientation='vertical' />
              <span>Docs</span>
              <Separator orientation='vertical' />
              <span>Source</span>
            </div>
          </div>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
