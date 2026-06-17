'use client'

import { DollarSignIcon, EllipsisVerticalIcon, UserPlusIcon, UsersIcon } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/data-table/data-table'
import { PageHeader } from '@/components/showcase'

import { type Customer, currency, customers } from '../data'
import { StatCards } from '../stat-card'

const totalSpent = customers.reduce((sum, c) => sum + c.spent, 0)
const stats = [
  { label: 'Total customers', value: String(customers.length), icon: UsersIcon },
  {
    label: 'New this period',
    value: String(customers.filter((c) => c.status === 'new').length),
    change: 4.1,
    trend: 'up' as const,
    icon: UserPlusIcon
  },
  {
    label: 'Active',
    value: String(customers.filter((c) => c.status === 'active').length),
    icon: UsersIcon
  },
  { label: 'Lifetime value', value: currency(totalSpent), icon: DollarSignIcon }
]

const statusVariant: Record<Customer['status'], string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  new: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  churned: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
}

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'name',
    header: 'Customer',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <Avatar className='size-7'>
          <AvatarFallback className='text-xs'>{initials(row.getValue('name'))}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col'>
          <span className='text-foreground/90 text-sm'>{row.getValue('name')}</span>
          <span className='text-muted-foreground text-xs'>{row.original.email}</span>
        </div>
      </div>
    )
  },
  {
    accessorKey: 'orders',
    header: 'Orders',
    cell: ({ row }) => <span className='text-muted-foreground text-sm'>{row.getValue('orders')}</span>
  },
  {
    accessorKey: 'spent',
    header: 'Total spent',
    cell: ({ row }) => <span className='text-sm'>{currency(row.getValue('spent'))}</span>
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Customer['status']
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
          <DropdownMenuItem>View orders</DropdownMenuItem>
          <DropdownMenuItem>Send email</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false
  }
]

export default function CustomersPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Customers' description='View customer accounts, orders, and lifetime value.' />

      <StatCards stats={stats} />

      <DataTable
        columns={columns}
        data={customers}
        searchPlaceholder='Search customers...'
        filters={[
          {
            columnId: 'status',
            label: 'Status',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'new', label: 'New' },
              { value: 'churned', label: 'Churned' }
            ]
          }
        ]}
      />
    </div>
  )
}
