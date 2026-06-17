'use client'

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function ContextMenuPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Context Menu' description='Menu of actions triggered by a right click.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <ContextMenu>
            <ContextMenuTrigger className='border-dashed flex h-32 w-64 items-center justify-center rounded-md border text-sm'>
              Right click here
            </ContextMenuTrigger>
            <ContextMenuContent className='w-52'>
              <ContextMenuLabel>Actions</ContextMenuLabel>
              <ContextMenuSeparator />
              <ContextMenuItem>Back</ContextMenuItem>
              <ContextMenuItem>Forward</ContextMenuItem>
              <ContextMenuItem>Reload</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuCheckboxItem checked>Show bookmarks</ContextMenuCheckboxItem>
            </ContextMenuContent>
          </ContextMenu>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
