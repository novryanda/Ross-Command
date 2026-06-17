'use client'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from '@/components/ui/command'
import {
  CalendarIcon,
  CalculatorIcon,
  CreditCardIcon,
  SettingsIcon,
  SmileIcon,
  UserIcon
} from 'lucide-react'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function CommandPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Command' description='Fast, composable command menu for search and actions.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Command className='w-[340px] rounded-lg border shadow-sm'>
            <CommandInput placeholder='Type a command or search...' />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading='Suggestions'>
                <CommandItem>
                  <CalendarIcon />
                  <span>Calendar</span>
                </CommandItem>
                <CommandItem>
                  <SmileIcon />
                  <span>Search emoji</span>
                </CommandItem>
                <CommandItem>
                  <CalculatorIcon />
                  <span>Calculator</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading='Settings'>
                <CommandItem>
                  <UserIcon />
                  <span>Profile</span>
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <CreditCardIcon />
                  <span>Billing</span>
                  <CommandShortcut>⌘B</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <SettingsIcon />
                  <span>Settings</span>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
