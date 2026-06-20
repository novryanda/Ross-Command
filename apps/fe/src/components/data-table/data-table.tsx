'use client'

import { type ReactNode, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  type Column,
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
import type { PaginationMeta } from '@/lib/api/types'

export type DataTableColumnMeta = {
  label?: string
}

function getColumnLabel<TData>(column: Column<TData, unknown>): string {
  const meta = column.columnDef.meta as DataTableColumnMeta | undefined
  if (meta?.label) {
    return meta.label
  }

  const header = column.columnDef.header
  if (typeof header === 'string') {
    return header
  }

  return column.id
}

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
  showFooter?: boolean
  serverPagination?: PaginationMeta
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
  paginationItemsToDisplay = 5,
  showFooter = true,
  serverPagination
}: DataTableProps<TData>) {
  const router = useRouter()
  const isServerPaginated = Boolean(serverPagination)
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
    ...(isServerPaginated
      ? {
          manualPagination: true,
          pageCount: serverPagination?.totalPages ?? 1
        }
      : {}),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(!isServerPaginated
      ? {
          getPaginationRowModel: getPaginationRowModel()
        }
      : {})
  })

  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const totalCount = serverPagination?.total ?? table.getFilteredRowModel().rows.length
  const currentPage = serverPagination?.page ?? (table.getState().pagination.pageIndex + 1)
  const totalPages = serverPagination?.totalPages ?? (table.getPageCount() || 1)
  const currentPageSize = serverPagination?.limit ?? pagination.pageSize

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay
  })

  function pushPagination(nextPage: number, nextLimit = currentPageSize) {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    params.set('page', String(nextPage))
    params.set('limit', String(nextLimit))
    router.push(`${url.pathname}?${params.toString()}`)
  }

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
                    >
                      {getColumnLabel(column)}
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

      {showFooter ? (
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
                value={String(currentPageSize)}
                onValueChange={(value) => {
                  if (isServerPaginated) {
                    pushPagination(1, Number(value))
                    return
                  }

                  table.setPageSize(Number(value))
                }}
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
              Page {currentPage} of {totalPages}
            </span>

            <Pagination className='mx-0 w-auto justify-end'>
              <PaginationContent>
                <PaginationItem>
                <PaginationPrevious
                  aria-disabled={isServerPaginated ? currentPage <= 1 : !table.getCanPreviousPage()}
                  className={`h-7 px-2 text-xs ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={(e) => {
                    e.preventDefault()
                    if (isServerPaginated) {
                      if (currentPage > 1) pushPagination(currentPage - 1)
                      return
                    }

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
                  const isActive = page === currentPage

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        size='icon'
                        isActive={isActive}
                        className='size-7 text-xs'
                        onClick={(e) => {
                          e.preventDefault()
                          if (isServerPaginated) {
                            pushPagination(page)
                            return
                          }

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
                  aria-disabled={isServerPaginated ? currentPage >= totalPages : !table.getCanNextPage()}
                  className={`h-7 px-2 text-xs ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                  onClick={(e) => {
                    e.preventDefault()
                    if (isServerPaginated) {
                      if (currentPage < totalPages) pushPagination(currentPage + 1)
                      return
                    }

                    if (table.getCanNextPage()) table.nextPage()
                  }}
                />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      ) : null}
    </Card>
  )
}
