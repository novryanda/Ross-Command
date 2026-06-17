'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis
} from 'recharts'
import {
  CircleDollarSignIcon,
  PackageIcon,
  ShoppingCartIcon,
  TrendingUpIcon
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Progress } from '@/components/ui/progress'
import { PageHeader } from '@/components/showcase'

import { currency, orders } from '../data'
import { StatCards } from '../stat-card'

const stats = [
  {
    label: 'Total revenue',
    value: '$48,290',
    change: 12.4,
    trend: 'up' as const,
    icon: CircleDollarSignIcon
  },
  {
    label: 'Orders',
    value: '2,451',
    change: 8.2,
    trend: 'up' as const,
    icon: ShoppingCartIcon
  },
  {
    label: 'Avg order value',
    value: '$197',
    change: 3.1,
    trend: 'up' as const,
    icon: TrendingUpIcon
  },
  {
    label: 'Products sold',
    value: '8,914',
    change: 2.4,
    trend: 'down' as const,
    icon: PackageIcon
  }
]

const salesData = [
  { month: 'Jan', revenue: 28000, orders: 1420 },
  { month: 'Feb', revenue: 31000, orders: 1610 },
  { month: 'Mar', revenue: 33500, orders: 1580 },
  { month: 'Apr', revenue: 36200, orders: 1840 },
  { month: 'May', revenue: 39800, orders: 1960 },
  { month: 'Jun', revenue: 42100, orders: 1890 },
  { month: 'Jul', revenue: 45300, orders: 2120 },
  { month: 'Aug', revenue: 48290, orders: 2451 }
]

const salesConfig = {
  revenue: { label: 'Revenue', color: 'var(--primary)' }
} satisfies ChartConfig

const categoryData = [
  { category: 'Audio', sales: 18400 },
  { category: 'Accessories', sales: 12900 },
  { category: 'Video', sales: 7600 },
  { category: 'Storage', sales: 5800 },
  { category: 'Office', sales: 3590 }
]

const categoryConfig = {
  sales: { label: 'Sales', color: 'var(--primary)' }
} satisfies ChartConfig

const topProducts = [
  { name: 'Wireless Headphones', sold: 1240, revenue: 159960, percent: 100 },
  { name: 'Gaming Headset Pro', sold: 980, revenue: 146020, percent: 79 },
  { name: 'Mechanical Keyboard', sold: 870, revenue: 77430, percent: 70 },
  { name: 'Portable SSD 1TB', sold: 640, revenue: 76160, percent: 52 },
  { name: '4K Webcam', sold: 410, revenue: 65190, percent: 33 }
]

const statusVariant: Record<string, string> = {
  paid: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  refunded: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  cancelled: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
}

export default function EcommerceDashboard() {
  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <PageHeader title='E-Commerce Dashboard' description='Sales, orders, and product performance at a glance.' />
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' className='h-8'>
            Last 30 days
          </Button>
          <Button size='sm' className='h-8'>
            Export report
          </Button>
        </div>
      </div>

      <StatCards stats={stats} />

      <div className='grid gap-4 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='text-base'>Sales over time</CardTitle>
            <CardDescription className='text-xs'>Revenue across the last 8 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={salesConfig} className='h-72 w-full'>
              <AreaChart data={salesData} margin={{ left: 12, right: 12 }}>
                <defs>
                  <linearGradient id='salesGradient' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='var(--color-revenue)' stopOpacity={0.4} />
                    <stop offset='95%' stopColor='var(--color-revenue)' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='dot' />} />
                <Area
                  dataKey='revenue'
                  type='monotone'
                  fill='url(#salesGradient)'
                  stroke='var(--color-revenue)'
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Sales by category</CardTitle>
            <CardDescription className='text-xs'>Top performing categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={categoryConfig} className='h-72 w-full'>
              <BarChart data={categoryData} layout='vertical' margin={{ left: 12, right: 12 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type='number' hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='dashed' />} />
                <Bar dataKey='sales' fill='var(--color-sales)' radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader className='flex-row items-center justify-between'>
            <div>
              <CardTitle className='text-base'>Top products</CardTitle>
              <CardDescription className='text-xs'>Best sellers by revenue.</CardDescription>
            </div>
            <Button variant='ghost' size='sm' className='h-7 text-xs'>
              View all
            </Button>
          </CardHeader>
          <CardContent className='space-y-3'>
            {topProducts.map((product) => (
              <div key={product.name} className='space-y-1.5'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='font-medium'>{product.name}</span>
                  <span className='text-muted-foreground'>
                    {product.sold.toLocaleString('en-US')} sold · {currency(product.revenue)}
                  </span>
                </div>
                <Progress value={product.percent} className='h-1.5' />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex-row items-center justify-between'>
            <div>
              <CardTitle className='text-base'>Recent orders</CardTitle>
              <CardDescription className='text-xs'>Latest activity.</CardDescription>
            </div>
            <Button variant='ghost' size='sm' className='h-7 text-xs'>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <ul className='divide-border divide-y'>
              {orders.slice(0, 5).map((order) => (
                <li key={order.id} className='flex items-center gap-3 py-2.5 first:pt-0 last:pb-0'>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>{order.customer}</p>
                    <p className='text-muted-foreground truncate text-xs'>{order.id}</p>
                  </div>
                  <div className='flex flex-col items-end gap-1'>
                    <span className='text-sm'>{currency(order.total)}</span>
                    <Badge className={`${statusVariant[order.status]} h-4 rounded-sm px-1 text-[10px] capitalize`}>
                      {order.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
