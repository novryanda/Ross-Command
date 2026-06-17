import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function KbdPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Kbd' description='Display textual user input from keyboard.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Kbd>⌘</Kbd>
          <Kbd>Enter</Kbd>
          <Kbd>Esc</Kbd>
        </Showcase>
        <Showcase title='Group'>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
