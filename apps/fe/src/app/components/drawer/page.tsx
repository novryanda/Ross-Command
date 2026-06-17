'use client'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function DrawerPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Drawer' description='A drawer component for React.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant='outline'>Open drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className='mx-auto w-full max-w-sm'>
                <DrawerHeader>
                  <DrawerTitle>Move goal</DrawerTitle>
                  <DrawerDescription>Set your daily activity goal.</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Button>Submit</Button>
                  <DrawerClose asChild>
                    <Button variant='outline'>Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
