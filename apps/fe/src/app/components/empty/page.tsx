import { InboxIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function EmptyPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Empty' description='Display an empty state.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Empty className='w-full max-w-md'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>No messages</EmptyTitle>
              <EmptyDescription>You have no new messages. Start a conversation now.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button>New message</Button>
            </EmptyContent>
          </Empty>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
