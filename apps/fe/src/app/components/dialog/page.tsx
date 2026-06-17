'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function DialogPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className='space-y-8'>
      <PageHeader title='Dialog' description='A modal window overlaid on the primary screen.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='outline'>Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>Make changes to your profile here.</DialogDescription>
              </DialogHeader>
              <div className='grid gap-3 py-2'>
                <div className='grid gap-1.5'>
                  <Label htmlFor='name'>Name</Label>
                  <Input id='name' defaultValue='John Doe' />
                </div>
                <div className='grid gap-1.5'>
                  <Label htmlFor='username'>Username</Label>
                  <Input id='username' defaultValue='@johndoe' />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant='outline'>Cancel</Button>
                </DialogClose>
                <Button>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Showcase>
        <Showcase title='Controlled'>
          <div className='flex flex-col items-center gap-3'>
            <Button onClick={() => setOpen(true)}>Open controlled</Button>
            <p className='text-muted-foreground text-xs'>Open: {open ? 'true' : 'false'}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Controlled dialog</DialogTitle>
                <DialogDescription>This dialog is controlled by component state.</DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
