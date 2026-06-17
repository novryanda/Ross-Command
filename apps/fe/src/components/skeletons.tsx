import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

/** Grid of stat/KPI card skeletons. */
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-3 w-24' />
              <Skeleton className='size-7 rounded-md' />
            </div>
            <Skeleton className='h-7 w-20' />
            <Skeleton className='h-3 w-28' />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/** Chart card skeleton with header and plot area. */
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className='space-y-2'>
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-3 w-48' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-64 w-full' />
      </CardContent>
    </Card>
  )
}

/** Table skeleton with configurable rows and columns. */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <Card className='py-0'>
      <Table>
        <TableHeader>
          <TableRow className='hover:bg-transparent'>
            {Array.from({ length: cols }).map((_, i) => (
              <TableHead key={i} className='h-10 first:pl-4'>
                <Skeleton className='h-3 w-16' />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, r) => (
            <TableRow key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <TableCell key={c} className='py-3 first:pl-4'>
                  <Skeleton className={c === 0 ? 'h-4 w-32' : 'h-4 w-20'} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

/** List skeleton with avatar + two lines per item. */
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <Card>
      <CardContent className='divide-border divide-y p-0'>
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className='flex items-center gap-3 p-4'>
            <Skeleton className='size-9 shrink-0 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-3.5 w-1/3' />
              <Skeleton className='h-3 w-2/3' />
            </div>
            <Skeleton className='h-5 w-12 rounded-sm' />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/** Full dashboard skeleton: stats + charts + table. */
export function DashboardSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Skeleton className='h-5 w-40' />
        <Skeleton className='h-3 w-64' />
      </div>
      <StatCardsSkeleton />
      <div className='grid gap-4 lg:grid-cols-3'>
        <ChartSkeleton className='lg:col-span-2' />
        <ChartSkeleton />
      </div>
      <TableSkeleton />
    </div>
  )
}
