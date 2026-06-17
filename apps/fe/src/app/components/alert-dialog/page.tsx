'use client'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function AlertDialogPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Alert Dialog' description='Modal dialog that interrupts the user with important content.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='destructive'>Delete account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
