'use client'

import { DownloadIcon, MailIcon, PrinterIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { PageHeader } from '@/components/showcase'

const items = [
  { description: 'Pro plan subscription (Annual)', quantity: 1, rate: 288.0 },
  { description: 'Additional team seats', quantity: 5, rate: 24.0 },
  { description: 'Priority support add-on', quantity: 1, rate: 99.0 },
  { description: 'Custom domain setup', quantity: 1, rate: 49.0 }
]

const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
const tax = subtotal * 0.1
const total = subtotal + tax

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export default function InvoicePage() {
  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <PageHeader title='Invoice' description='Detail view of a single invoice with summary and actions.' />
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' className='h-8'>
            <PrinterIcon className='size-3.5' /> Print
          </Button>
          <Button variant='outline' size='sm' className='h-8'>
            <MailIcon className='size-3.5' /> Send
          </Button>
          <Button size='sm' className='h-8'>
            <DownloadIcon className='size-3.5' /> Download
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className='space-y-6'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='space-y-1'>
              <p className='text-muted-foreground text-xs uppercase tracking-wider'>Invoice</p>
              <h2 className='text-xl font-semibold'>#INV-2025-0421</h2>
              <Badge className='bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-1 h-5 rounded-sm px-1.5 text-xs'>
                Paid
              </Badge>
            </div>
            <div className='text-right text-sm'>
              <p className='font-semibold'>Moccilabs Studio</p>
              <p className='text-muted-foreground text-xs'>123 Market Street</p>
              <p className='text-muted-foreground text-xs'>San Francisco, CA 94102</p>
              <p className='text-muted-foreground text-xs'>billing@mocci.dev</p>
            </div>
          </div>

          <Separator />

          <div className='grid gap-6 sm:grid-cols-3 text-sm'>
            <div className='space-y-1'>
              <p className='text-muted-foreground text-xs'>Bill to</p>
              <p className='font-medium'>Acme Corporation</p>
              <p className='text-muted-foreground text-xs'>456 Innovation Way</p>
              <p className='text-muted-foreground text-xs'>Austin, TX 78701</p>
              <p className='text-muted-foreground text-xs'>jane@acme.com</p>
            </div>
            <div className='space-y-1'>
              <p className='text-muted-foreground text-xs'>Invoice date</p>
              <p className='font-medium'>April 21, 2025</p>
              <p className='text-muted-foreground mt-2 text-xs'>Due date</p>
              <p className='font-medium'>May 21, 2025</p>
            </div>
            <div className='space-y-1'>
              <p className='text-muted-foreground text-xs'>Payment method</p>
              <p className='font-medium'>Visa ending in 4242</p>
              <p className='text-muted-foreground mt-2 text-xs'>Reference</p>
              <p className='font-medium'>txn_3PaQRSk2L9</p>
            </div>
          </div>

          <Separator />

          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='hover:bg-transparent'>
                  <TableHead className='text-muted-foreground h-10 text-xs'>Description</TableHead>
                  <TableHead className='text-muted-foreground h-10 text-right text-xs'>Qty</TableHead>
                  <TableHead className='text-muted-foreground h-10 text-right text-xs'>Rate</TableHead>
                  <TableHead className='text-muted-foreground h-10 text-right text-xs'>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.description}>
                    <TableCell className='py-2.5 text-sm'>{item.description}</TableCell>
                    <TableCell className='py-2.5 text-right text-sm'>{item.quantity}</TableCell>
                    <TableCell className='py-2.5 text-right text-sm'>{currency(item.rate)}</TableCell>
                    <TableCell className='py-2.5 text-right text-sm font-medium'>
                      {currency(item.quantity * item.rate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className='flex justify-end'>
            <div className='w-full max-w-xs space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Subtotal</span>
                <span>{currency(subtotal)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Tax (10%)</span>
                <span>{currency(tax)}</span>
              </div>
              <Separator />
              <div className='flex justify-between text-base font-semibold'>
                <span>Total</span>
                <span>{currency(total)}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className='space-y-2'>
            <p className='text-sm font-medium'>Notes</p>
            <p className='text-muted-foreground text-xs'>
              Thank you for your business. Payment was processed automatically. For questions about this invoice,
              contact billing@mocci.dev.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
