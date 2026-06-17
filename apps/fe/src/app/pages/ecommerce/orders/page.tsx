'use client'

import { CircleDollarSignIcon, ClockIcon, EllipsisVerticalIcon, ShoppingBagIcon } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

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

import { type Order, currency, orders } from '../data'
import { StatCards } from '../stat-card'

const revenue = orders.filter((o) => o.status === 'paid').reduce((sum, o) => sum + o.total, 0)
const stats = [
  { label: 'Total orders', value: String(orders.length), icon: ShoppingBagIcon },
  {
    label: 'Pending',
    value: String(orders.filter((o) => o.status === 'pending').length),
    icon: ClockIcon
  },
  {
    label: 'Paid revenue',
    value: currency(revenue),
    change: 9.3,
    trend: 'up' as const,
    icon: CircleDollarSignIcon
  },
  {
    label: 'Avg order value',
    value: currency(orders.reduce((sum, o) => sum + o.total, 0) / orders.length),
    icon: CircleDollarSignIcon
  }
]

const statusVariant: Record<Order['status'], string> = {
  paid: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  refunded: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  cancelled: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
}

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'id',
    header: 'Order',
    cell: ({ row }) => <span className='text-sm font-medium'>{row.getValue('id')}</span>
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='text-foreground/90 text-sm'>{row.getValue('customer')}</span>
        <span className='text-muted-foreground text-xs'>{row.original.email}</span>
      </div>
    )
  },
  {
    accessorKey: 'items',
    header: 'Items',
    cell: ({ row }) => <span className='text-muted-foreground text-sm'>{row.getValue('items')}</span>
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => <span className='text-sm'>{currency(row.getValue('total'))}</span>
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Order['status']
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
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.getValue('date') as string)
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
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuItem>Mark as paid</DropdownMenuItem>
          <DropdownMenuItem>Issue refund</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false
  }
]

export default function OrdersPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Orders' description='Track and manage customer orders and fulfillment.' />

      <StatCards stats={stats} />

      <DataTable
        columns={columns}
        data={orders}
        searchPlaceholder='Search by order or customer...'
        filters={[
          {
            columnId: 'status',
            label: 'Status',
            options: [
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
              { value: 'refunded', label: 'Refunded' },
              { value: 'cancelled', label: 'Cancelled' }
            ]
          }
        ]}
      />
    </div>
  )
}
