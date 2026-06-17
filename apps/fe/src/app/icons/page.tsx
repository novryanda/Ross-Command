'use client'

import { useState, useMemo } from 'react'
import * as LucideIcons from 'lucide-react'

import { iconNames } from '@/config/icon-names'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/showcase'

const PER_PAGE = 120

export default function IconsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const list = q ? iconNames.filter((name) => name.toLowerCase().includes(q)) : iconNames
    return [...new Set(list)]
  }, [search])

  const paged = filtered.slice(0, page * PER_PAGE + PER_PAGE)
  const hasMore = paged.length < filtered.length

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Icons'
        description={`${filtered.length} Lucide icons available. Click to copy the import.`}
      />

      <div className='sticky top-0 z-10 bg-background pb-3'>
        <Input
          placeholder='Search icons...'
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          className='max-w-sm'
        />
      </div>

      <div className='grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'>
        {paged.map((name) => {
          const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name]
          if (!Icon) return null
          return (
            <button
              key={name}
              type='button'
              className='hover:bg-accent flex flex-col items-center gap-1.5 rounded-md border p-3 text-center transition'
              title={`Copy import for ${name}`}
              onClick={() => {
                const imp = `import { ${name} } from 'lucide-react'`
                navigator.clipboard.writeText(imp)
              }}
            >
              <Icon className='size-5 shrink-0' />
              <span className='text-muted-foreground w-full truncate text-[10px] leading-tight'>
                {name}
              </span>
            </button>
          )
        })}
      </div>

      {hasMore ? (
        <div className='flex justify-center pt-2'>
          <button
            type='button'
            className='text-muted-foreground hover:text-foreground text-sm underline underline-offset-4 transition'
            onClick={() => setPage((p) => p + 1)}
          >
            Load more ({filtered.length - paged.length} remaining)
          </button>
        </div>
      ) : null}
    </div>
  )
}
