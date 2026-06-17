'use client'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function ResizablePage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Resizable' description='Accessible resizable panel groups and layouts.' />
      <ShowcaseGrid>
        <Showcase title='Horizontal'>
          <ResizablePanelGroup direction='horizontal' className='h-48 w-full max-w-md rounded-md border'>
            <ResizablePanel defaultSize={30}>
              <div className='flex h-full items-center justify-center p-6 text-sm'>One</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={70}>
              <ResizablePanelGroup direction='vertical'>
                <ResizablePanel defaultSize={50}>
                  <div className='flex h-full items-center justify-center p-6 text-sm'>Two</div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50}>
                  <div className='flex h-full items-center justify-center p-6 text-sm'>Three</div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
