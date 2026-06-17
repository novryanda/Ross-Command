'use client'

import {
  AlertCircleIcon,
  CreditCardIcon,
  DownloadIcon,
  SparklesIcon
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { PageHeader } from '@/components/showcase'
import { cn } from '@/lib/utils'

import {
  currentPlan,
  invoices,
  paymentMethod,
  usageMetrics,
  type Invoice
} from './data'

const statusStyles: Record<Invoice['status'], string> = {
  paid: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  failed: 'bg-red-500/10 text-red-600 dark:text-red-400'
}

function formatCompact(n: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export default function BillingPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Billing' description='Manage your plan, payment method, and invoices.' />

      <div className='grid gap-4 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <div className='flex items-start justify-between gap-4'>
              <div className='space-y-1'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <SparklesIcon className='text-primary size-4' />
                  {currentPlan.name} plan
                  <Badge variant='secondary' className='capitalize'>
                    {currentPlan.status}
                  </Badge>
                </CardTitle>
                <CardDescription className='text-xs'>
                  {currentPlan.price} / {currentPlan.interval} · renews on {currentPlan.renewsOn}
                </CardDescription>
              </div>
              <div className='flex shrink-0 gap-2'>
                <Button variant='outline' size='sm'>
                  Change plan
                </Button>
                <Button variant='ghost' size='sm' className='text-destructive hover:text-destructive'>
                  Cancel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>Seats used</span>
              <span className='font-medium'>
                {currentPlan.seats} of {currentPlan.seatLimit}
              </span>
            </div>
            <Progress value={(currentPlan.seats / currentPlan.seatLimit) * 100} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Payment method</CardTitle>
            <CardDescription className='text-xs'>Used for recurring charges.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-3 rounded-lg border p-3'>
              <span className='bg-muted flex size-9 items-center justify-center rounded-md'>
                <CreditCardIcon className='size-4' />
              </span>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-medium'>
                  {paymentMethod.brand} ·· {paymentMethod.last4}
                </p>
                <p className='text-muted-foreground text-xs'>Expires {paymentMethod.expiry}</p>
              </div>
            </div>
            <Button variant='outline' size='sm' className='w-full'>
              Update payment method
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Usage this cycle</CardTitle>
          <CardDescription className='text-xs'>Resets on {currentPlan.renewsOn}.</CardDescription>
        </CardHeader>
        <CardContent className='grid gap-6 sm:grid-cols-2'>
          {usageMetrics.map((metric) => {
            const pct = Math.min((metric.used / metric.limit) * 100, 100)
            const nearLimit = pct >= 80
            return (
              <div key={metric.label} className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='font-medium'>{metric.label}</span>
                  <span className={cn('text-muted-foreground', nearLimit && 'text-amber-600 dark:text-amber-400')}>
                    {formatCompact(metric.used)} / {formatCompact(metric.limit)} {metric.unit}
                  </span>
                </div>
                <Progress value={pct} />
                {nearLimit ? (
                  <p className='flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400'>
                    <AlertCircleIcon className='size-3' />
                    Approaching your limit
                  </p>
                ) : null}
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className='py-0'>
        <CardHeader className='flex flex-row items-center justify-between gap-4 border-b py-4'>
          <div className='space-y-1'>
            <CardTitle className='text-base'>Invoices</CardTitle>
            <CardDescription className='text-xs'>Download past invoices and receipts.</CardDescription>
          </div>
          <Button variant='outline' size='sm'>
            <DownloadIcon /> Export all
          </Button>
        </CardHeader>
        <CardContent className='px-0'>
          <Table>
            <TableHeader>
              <TableRow className='hover:bg-transparent'>
                <TableHead className='pl-6'>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Amount</TableHead>
                <TableHead className='pr-6 text-right'>Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className='pl-6 font-medium'>{invoice.id}</TableCell>
                  <TableCell className='text-muted-foreground'>{invoice.date}</TableCell>
                  <TableCell className='text-muted-foreground'>{invoice.plan}</TableCell>
                  <TableCell>
                    <Badge variant='secondary' className={cn('capitalize', statusStyles[invoice.status])}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>{invoice.amount}</TableCell>
                  <TableCell className='pr-6 text-right'>
                    <Button variant='ghost' size='icon-sm' aria-label={`Download ${invoice.id}`}>
                      <DownloadIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
