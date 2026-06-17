'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function DropdownMenuPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Dropdown Menu' description='Menu of actions triggered by a button.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>Open menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='w-48'>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant='destructive'>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
