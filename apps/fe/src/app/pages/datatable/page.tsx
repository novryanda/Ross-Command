'use client'

import {
  ArrowUpDownIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  Trash2Icon
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/data-table/data-table'
import { PageHeader } from '@/components/showcase'

import { type User, users } from './data'

const statusVariant: Record<User['status'], string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  invited: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  suspended: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
}

const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <span className='text-muted-foreground text-xs'>{row.getValue('id')}</span>
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant='ghost'
        size='sm'
        className='-ml-2 h-7 px-2'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Name <ArrowUpDownIcon className='ml-1 size-3' />
      </Button>
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='text-foreground/90 text-sm'>{row.getValue('name')}</span>
        <span className='text-muted-foreground text-xs'>{row.original.email}</span>
      </div>
    )
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => <span className='text-muted-foreground text-sm'>{row.getValue('role')}</span>,
    filterFn: (row, id, value) => {
      if (!value || value === 'all') return true
      return row.getValue(id) === value
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as User['status']
      return (
        <Badge className={`${statusVariant[status]} h-5 rounded-sm px-1.5 text-xs capitalize`}>
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      if (!value || value === 'all') return true
      return row.getValue(id) === value
    }
  },
  {
    accessorKey: 'joinedAt',
    header: ({ column }) => (
      <Button
        variant='ghost'
        size='sm'
        className='-ml-2 h-7 px-2'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Joined <ArrowUpDownIcon className='ml-1 size-3' />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('joinedAt') as string)
      return (
        <span className='text-muted-foreground text-sm'>
          {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
        </span>
      )
    }
  },
  {
    id: 'actions',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='size-7' aria-label='Row actions'>
            <EllipsisVerticalIcon className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem>View</DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive'>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false
  }
]

export default function DataTablePage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Data Table' description='Searchable, sortable, filterable table with row selection.' />

      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder='Search name or email...'
        filters={[
          {
            columnId: 'role',
            label: 'Role',
            options: [
              { value: 'Admin', label: 'Admin' },
              { value: 'Editor', label: 'Editor' },
              { value: 'Viewer', label: 'Viewer' }
            ]
          },
          {
            columnId: 'status',
            label: 'Status',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'invited', label: 'Invited' },
              { value: 'suspended', label: 'Suspended' }
            ]
          }
        ]}
        bulkActions={(table) => {
          const count = table.getFilteredSelectedRowModel().rows.length
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='h-8'>
                  {count} selected
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-44'>
                <DropdownMenuLabel>Bulk actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Export selected</DropdownMenuItem>
                <DropdownMenuItem>Mark as active</DropdownMenuItem>
                <DropdownMenuItem>Mark as suspended</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant='destructive'>
                  <Trash2Icon /> Delete selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }}
        toolbarActions={
          <Button size='sm' className='h-8'>
            <PlusIcon className='size-3.5' /> Add user
          </Button>
        }
      />
    </div>
  )
}
