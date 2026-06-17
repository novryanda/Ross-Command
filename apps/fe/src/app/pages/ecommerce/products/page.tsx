'use client'

import { useState } from 'react'
import {
  BoxesIcon,
  CircleCheckIcon,
  CircleSlashIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/data-table/data-table'
import { PageHeader } from '@/components/showcase'

import { type Product, currency, products } from '../data'
import { StatCards } from '../stat-card'
import { ProductFormSheet } from './product-form-sheet'

const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)
const stats = [
  { label: 'Total products', value: String(products.length), icon: BoxesIcon },
  {
    label: 'Active',
    value: String(products.filter((p) => p.status === 'active').length),
    icon: CircleCheckIcon
  },
  {
    label: 'Out of stock',
    value: String(products.filter((p) => p.status === 'out_of_stock').length),
    icon: CircleSlashIcon
  },
  { label: 'Inventory value', value: currency(inventoryValue), icon: BoxesIcon }
]

const statusVariant: Record<Product['status'], string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  draft: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  out_of_stock: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
}

const statusLabel: Record<Product['status'], string> = {
  active: 'Active',
  draft: 'Draft',
  out_of_stock: 'Out of stock'
}

const createColumns = (onEdit: (product: Product) => void): ColumnDef<Product>[] => [
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='text-foreground/90 text-sm'>{row.getValue('name')}</span>
        <span className='text-muted-foreground text-xs'>{row.original.id}</span>
      </div>
    )
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => <span className='text-muted-foreground text-sm'>{row.getValue('category')}</span>,
    filterFn: (row, id, value) => {
      if (!value || value === 'all') return true
      return row.getValue(id) === value
    }
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => <span className='text-sm'>{currency(row.getValue('price'))}</span>
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }) => <span className='text-muted-foreground text-sm'>{row.getValue('stock')}</span>
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Product['status']
      return (
        <Badge className={`${statusVariant[status]} h-5 rounded-sm px-1.5 text-xs`}>
          {statusLabel[status]}
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
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='size-7' aria-label='Row actions'>
            <EllipsisVerticalIcon className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => onEdit(row.original)}>
            <PencilIcon className='size-3.5' /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive'>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false
  }
]

export default function ProductsPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const handleAdd = () => {
    setEditing(null)
    setSheetOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditing(product)
    setSheetOpen(true)
  }

  const handleSave = () => {
    // Demo only: persistence would go here.
  }

  const columns = createColumns(handleEdit)

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <PageHeader title='Products' description='Manage your product catalog, pricing, and stock.' />
        <Button size='sm' className='h-8' onClick={handleAdd}>
          <PlusIcon className='size-3.5' /> Add product
        </Button>
      </div>

      <StatCards stats={stats} />

      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder='Search products...'
        filters={[
          {
            columnId: 'category',
            label: 'Category',
            options: [
              { value: 'Audio', label: 'Audio' },
              { value: 'Accessories', label: 'Accessories' },
              { value: 'Video', label: 'Video' },
              { value: 'Storage', label: 'Storage' },
              { value: 'Office', label: 'Office' }
            ]
          },
          {
            columnId: 'status',
            label: 'Status',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'draft', label: 'Draft' },
              { value: 'out_of_stock', label: 'Out of stock' }
            ]
          }
        ]}
      />

      <ProductFormSheet
        product={editing}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={handleSave}
      />
    </div>
  )
}
