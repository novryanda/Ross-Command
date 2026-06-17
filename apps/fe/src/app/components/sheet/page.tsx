'use client'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function SheetPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Sheet' description='Side dialog panel that slides in from the edge of the screen.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='outline'>Open sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Edit profile</SheetTitle>
                <SheetDescription>Make changes to your profile here.</SheetDescription>
              </SheetHeader>
              <SheetFooter>
                <Button>Save</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
