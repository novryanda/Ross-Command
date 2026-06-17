'use client'

import { type ReactNode, useState } from 'react'

import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table as TableInstance,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { ChevronDownIcon, Settings2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { usePagination } from '@/hooks/use-pagination'

export type DataTableFilterOption = {
  value: string
  label: string
}

export type DataTableFilter = {
  columnId: string
  label: string
  options: DataTableFilterOption[]
  width?: string
}

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  searchPlaceholder?: string
  enableGlobalFilter?: boolean
  enableColumnVisibility?: boolean
  filters?: DataTableFilter[]
  toolbarActions?: ReactNode
  bulkActions?: (table: TableInstance<TData>) => ReactNode
  pageSizeOptions?: number[]
  defaultPageSize?: number
  emptyMessage?: string
  paginationItemsToDisplay?: number
}

export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  enableGlobalFilter = true,
  enableColumnVisibility = true,
  filters = [],
  toolbarActions,
  bulkActions,
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 10,
  emptyMessage = 'No results.',
  paginationItemsToDisplay = 5
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize
  })

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const totalCount = table.getFilteredRowModel().rows.length

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount() || 1,
    paginationItemsToDisplay
  })

  return (
    <Card className='gap-0 py-0'>
      <div className='flex flex-wrap items-center gap-2 border-b p-3'>
        {enableGlobalFilter && (
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className='h-8 w-full max-w-xs text-sm'
          />
        )}

        {filters.map((filter) => {
          const value = (table.getColumn(filter.columnId)?.getFilterValue() as string) ?? 'all'
          return (
            <Select
              key={filter.columnId}
              value={value}
              onValueChange={(next) =>
                table.getColumn(filter.columnId)?.setFilterValue(next === 'all' ? undefined : next)
              }
            >
              <SelectTrigger size='sm' className={`text-sm ${filter.width ?? 'w-32'}`}>
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All {filter.label.toLowerCase()}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value} className='capitalize'>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        })}

        <div className='ml-auto flex items-center gap-2'>
          {selectedCount > 0 && bulkActions ? bulkActions(table) : null}

          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='h-8'>
                  <Settings2Icon className='size-3.5' /> Columns <ChevronDownIcon className='size-3.5' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-40'>
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(checked) => column.toggleVisibility(!!checked)}
                      className='capitalize'
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {toolbarActions}
        </div>
      </div>

      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='hover:bg-transparent'>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className='text-muted-foreground h-10 text-xs first:pl-4'>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='py-2.5 first:pl-4'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center text-sm'>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3 border-t px-3 py-3'>
        <p className='text-muted-foreground text-xs'>
          {selectedCount > 0
            ? `${selectedCount} of ${totalCount} row(s) selected`
            : `${totalCount} row(s) total`}
        </p>

        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <span className='text-muted-foreground text-xs'>Rows</span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger size='sm' className='h-7 w-16 text-xs'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <span className='text-muted-foreground hidden text-xs sm:inline'>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>

          <Pagination className='mx-0 w-auto justify-end'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  aria-disabled={!table.getCanPreviousPage()}
                  className={`h-7 px-2 text-xs ${!table.getCanPreviousPage() ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={(e) => {
                    e.preventDefault()
                    if (table.getCanPreviousPage()) table.previousPage()
                  }}
                />
              </PaginationItem>

              {showLeftEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis className='size-7' />
                </PaginationItem>
              )}

              {pages.map((page) => {
                const isActive = page === table.getState().pagination.pageIndex + 1

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      size='icon'
                      isActive={isActive}
                      className='size-7 text-xs'
                      onClick={(e) => {
                        e.preventDefault()
                        table.setPageIndex(page - 1)
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              {showRightEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis className='size-7' />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  aria-disabled={!table.getCanNextPage()}
                  className={`h-7 px-2 text-xs ${!table.getCanNextPage() ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={(e) => {
                    e.preventDefault()
                    if (table.getCanNextPage()) table.nextPage()
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </Card>
  )
}
