'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

const frameworks = [
  { value: 'next', label: 'Next.js' },
  { value: 'svelte', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' }
]

export default function ComboboxPage() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  return (
    <div className='space-y-8'>
      <PageHeader title='Combobox' description='Autocomplete input with a list of suggestions.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant='outline' role='combobox' className='w-[220px] justify-between'>
                {value ? frameworks.find((f) => f.value === value)?.label : 'Select framework...'}
                <ChevronsUpDownIcon className='opacity-50' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[220px] p-0'>
              <Command>
                <CommandInput placeholder='Search framework...' />
                <CommandList>
                  <CommandEmpty>No framework found.</CommandEmpty>
                  <CommandGroup>
                    {frameworks.map((f) => (
                      <CommandItem
                        key={f.value}
                        value={f.value}
                        onSelect={(v) => {
                          setValue(v === value ? '' : v)
                          setOpen(false)
                        }}
                      >
                        <CheckIcon className={cn('mr-2', value === f.value ? 'opacity-100' : 'opacity-0')} />
                        {f.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
