'use client'

import { useMemo } from 'react'
import {
  ArrowUpDownIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  Trash2Icon
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

import type { Member, Role } from './data'

type MembersTableProps = {
  members: Member[]
  roleName: Map<string, Role>
  statusVariant: Record<string, string>
}

export function MembersTable({ members, roleName, statusVariant }: MembersTableProps) {
  const columns = useMemo<ColumnDef<Member>[]>(
    () => [
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
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant='ghost'
            size='sm'
            className='-ml-2 h-7 px-2'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Member <ArrowUpDownIcon className='ml-1 size-3' />
          </Button>
        ),
        cell: ({ row }) => (
          <div className='flex items-center gap-2.5'>
            <Avatar className='size-7'>
              {row.original.avatar ? (
                <AvatarImage src={row.original.avatar} alt={row.original.name} />
              ) : null}
              <AvatarFallback className='text-[10px]'>{row.original.fallback}</AvatarFallback>
            </Avatar>
            <div className='flex flex-col'>
              <span className='text-foreground/90 text-sm leading-tight'>{row.getValue('name')}</span>
              <span className='text-muted-foreground text-xs'>{row.original.email}</span>
            </div>
          </div>
        )
      },
      {
        accessorKey: 'roleId',
        header: 'Role',
        cell: ({ row }) => {
          const role = roleName.get(row.getValue('roleId') as string)
          return <span className='text-muted-foreground text-sm'>{role?.name ?? 'Unknown'}</span>
        },
        filterFn: (row, id, value) => {
          if (!value || value === 'all') return true
          return row.getValue(id) === value
        }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as Member['status']
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
        accessorKey: 'lastActive',
        header: 'Last active',
        cell: ({ row }) => (
          <span className='text-muted-foreground text-sm'>{row.getValue('lastActive')}</span>
        )
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
              <DropdownMenuItem>View profile</DropdownMenuItem>
              <DropdownMenuItem>Change role</DropdownMenuItem>
              <DropdownMenuItem>Resend invite</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant='destructive'>Remove member</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false
      }
    ],
    [roleName, statusVariant]
  )

  const roleOptions = useMemo(
    () => Array.from(roleName.values()).map((r) => ({ value: r.id, label: r.name })),
    [roleName]
  )

  return (
    <DataTable
      columns={columns}
      data={members}
      searchPlaceholder='Search member or email...'
      filters={[
        { columnId: 'roleId', label: 'Role', options: roleOptions },
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
              <DropdownMenuItem>Change role</DropdownMenuItem>
              <DropdownMenuItem>Resend invites</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant='destructive'>
                <Trash2Icon /> Remove selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }}
      toolbarActions={
        <Button size='sm' className='h-8'>
          <PlusIcon className='size-3.5' /> Invite member
        </Button>
      }
    />
  )
}
