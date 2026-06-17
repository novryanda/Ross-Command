'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis
} from 'recharts'
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  ClockIcon,
  EyeIcon,
  MousePointerClickIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  UsersIcon
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

/* ── KPI cards ── */
const kpis = [
  { label: 'Page views', value: '142,847', change: 14.2, trend: 'up' as const, icon: EyeIcon },
  { label: 'Unique visitors', value: '38,291', change: 8.7, trend: 'up' as const, icon: UsersIcon },
  { label: 'Bounce rate', value: '34.2%', change: 2.1, trend: 'down' as const, icon: MousePointerClickIcon },
  { label: 'Avg. session', value: '4m 32s', change: 6.5, trend: 'up' as const, icon: ClockIcon }
]

/* ── Traffic over time (area) ── */
const trafficData = [
  { date: 'Jan', visitors: 24800, pageViews: 68400 },
  { date: 'Feb', visitors: 28100, pageViews: 74200 },
  { date: 'Mar', visitors: 26400, pageViews: 71800 },
  { date: 'Apr', visitors: 31200, pageViews: 86500 },
  { date: 'May', visitors: 34600, pageViews: 92100 },
  { date: 'Jun', visitors: 32100, pageViews: 89700 },
  { date: 'Jul', visitors: 36800, pageViews: 98400 },
  { date: 'Aug', visitors: 38291, pageViews: 102847 }
]

const trafficConfig = {
  visitors: { label: 'Visitors', color: 'var(--primary)' },
  pageViews: {
    label: 'Page views',
    color: 'color-mix(in oklab, var(--primary) 40%, transparent)'
  }
} satisfies ChartConfig

/* ── Top pages (horizontal bar) ── */
const topPages = [
  { page: '/pricing', views: 12840 },
  { page: '/features', views: 9620 },
  { page: '/blog/launch', views: 8310 },
  { page: '/docs/getting-started', views: 6780 },
  { page: '/changelog', views: 5240 }
]

const topPagesConfig = {
  views: { label: 'Views', color: 'var(--primary)' }
} satisfies ChartConfig

/* ── Device breakdown (pie) ── */
const deviceData = [
  { device: 'Desktop', sessions: 21840, fill: 'var(--primary)' },
  { device: 'Mobile', sessions: 12940, fill: 'color-mix(in oklab, var(--primary) 55%, transparent)' },
  { device: 'Tablet', sessions: 3511, fill: 'color-mix(in oklab, var(--primary) 30%, transparent)' }
]

const deviceConfig = {
  sessions: { label: 'Sessions' },
  Desktop: { label: 'Desktop', color: 'var(--primary)' },
  Mobile: { label: 'Mobile', color: 'color-mix(in oklab, var(--primary) 55%, transparent)' },
  Tablet: { label: 'Tablet', color: 'color-mix(in oklab, var(--primary) 30%, transparent)' }
} satisfies ChartConfig

/* ── Traffic sources ── */
const sources = [
  { source: 'Organic search', visitors: 14280, percent: 37.3 },
  { source: 'Direct', visitors: 9840, percent: 25.7 },
  { source: 'Social media', visitors: 7210, percent: 18.8 },
  { source: 'Referral', visitors: 4560, percent: 11.9 },
  { source: 'Email', visitors: 2401, percent: 6.3 }
]

/* ── Conversion funnel ── */
const funnel = [
  { label: 'Page views', value: 142847, percent: 100 },
  { label: 'Signups', value: 4820, percent: 3.4 },
  { label: 'Trials started', value: 2890, percent: 2.0 },
  { label: 'Paid conversions', value: 924, percent: 0.6 }
]

/* ── Top countries ── */
const countries = [
  { country: 'United States', flag: '🇺🇸', visitors: 12480, pct: 32.6 },
  { country: 'Indonesia', flag: '🇮🇩', visitors: 6840, pct: 17.9 },
  { country: 'Germany', flag: '🇩🇪', visitors: 4210, pct: 11.0 },
  { country: 'India', flag: '🇮🇳', visitors: 3890, pct: 10.2 },
  { country: 'Brazil', flag: '🇧🇷', visitors: 2960, pct: 7.7 },
  { country: 'Japan', flag: '🇯🇵', visitors: 2140, pct: 5.6 }
]

/* ── Recent conversions ── */
const conversions = [
  { name: 'Aria Patel', plan: 'Pro', amount: '$29', source: 'Organic', time: '12m ago' },
  { name: 'Marcus Lee', plan: 'Starter', amount: '$9', source: 'Social', time: '34m ago' },
  { name: 'Jennifer Cole', plan: 'Enterprise', amount: '$99', source: 'Referral', time: '1h ago' },
  { name: 'Diego Ramirez', plan: 'Pro', amount: '$29', source: 'Direct', time: '2h ago' },
  { name: 'Sara Williams', plan: 'Starter', amount: '$9', source: 'Email', time: '4h ago' }
]

const planBadge: Record<string, string> = {
  Starter: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Pro: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  Enterprise: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
}

export default function AnalyticsPage() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-lg font-semibold tracking-tight'>Analytics</h1>
          <p className='text-muted-foreground text-xs'>
            Traffic, conversions, and audience insights.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' className='h-8'>
            Last 30 days
          </Button>
          <Button size='sm' className='h-8'>
            Export report
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          const TrendIcon = kpi.trend === 'up' ? ArrowUpRightIcon : ArrowDownRightIcon
          const trendColor =
            kpi.trend === 'up'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          const isGood = kpi.label === 'Bounce rate' ? kpi.trend === 'down' : kpi.trend === 'up'
          return (
            <Card key={kpi.label}>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <p className='text-muted-foreground text-xs'>{kpi.label}</p>
                  <div className='bg-primary/10 text-primary flex size-7 items-center justify-center rounded-md'>
                    <Icon className='size-3.5' />
                  </div>
                </div>
                <p className='text-2xl font-semibold tracking-tight'>{kpi.value}</p>
                <div className={cn('flex items-center gap-1 text-xs', isGood ? trendColor : 'text-rose-600 dark:text-rose-400')}>
                  <TrendIcon className='size-3' />
                  <span>{kpi.change}%</span>
                  <span className='text-muted-foreground'>vs last period</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Traffic chart + device breakdown */}
      <div className='grid gap-4 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='text-base'>Traffic overview</CardTitle>
            <CardDescription className='text-xs'>
              Visitors and page views over the last 8 months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trafficConfig} className='h-72 w-full'>
              <AreaChart data={trafficData} margin={{ left: 12, right: 12 }}>
                <defs>
                  <linearGradient id='visitorsGrad' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='var(--color-visitors)' stopOpacity={0.4} />
                    <stop offset='95%' stopColor='var(--color-visitors)' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id='pvGrad' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='var(--color-pageViews)' stopOpacity={0.4} />
                    <stop offset='95%' stopColor='var(--color-pageViews)' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey='date' tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='dot' />} />
                <Area
                  dataKey='pageViews'
                  type='monotone'
                  fill='url(#pvGrad)'
                  stroke='var(--color-pageViews)'
                  strokeWidth={2}
                />
                <Area
                  dataKey='visitors'
                  type='monotone'
                  fill='url(#visitorsGrad)'
                  stroke='var(--color-visitors)'
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Device breakdown</CardTitle>
            <CardDescription className='text-xs'>Sessions by device type.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={deviceConfig} className='mx-auto aspect-square max-h-44'>
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey='device' />} />
                <Pie data={deviceData} dataKey='sessions' nameKey='device' innerRadius={48} outerRadius={70}>
                  {deviceData.map((entry) => (
                    <Cell key={entry.device} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className='mt-3 space-y-1.5'>
              {deviceData.map((entry) => (
                <div key={entry.device} className='flex items-center gap-2 text-xs'>
                  <span className='size-2 shrink-0 rounded-full' style={{ backgroundColor: entry.fill }} aria-hidden />
                  <span className='flex-1'>{entry.device}</span>
                  <span className='text-muted-foreground'>{entry.sessions.toLocaleString('en-US')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top pages + Traffic sources + Conversion funnel */}
      <div className='grid gap-4 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Top pages</CardTitle>
            <CardDescription className='text-xs'>Most visited pages this period.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={topPagesConfig} className='h-52 w-full'>
              <BarChart data={topPages} layout='vertical' margin={{ left: 4, right: 12 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type='number' tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis type='category' dataKey='page' tickLine={false} axisLine={false} width={120} tick={{ fontSize: 11 }} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='dashed' />} />
                <Bar dataKey='views' fill='var(--color-views)' radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Traffic sources</CardTitle>
            <CardDescription className='text-xs'>Where your visitors come from.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {sources.map((source) => (
              <div key={source.source} className='space-y-1.5'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='font-medium'>{source.source}</span>
                  <span className='text-muted-foreground'>
                    {source.visitors.toLocaleString('en-US')} ({source.percent}%)
                  </span>
                </div>
                <Progress value={source.percent} className='h-1.5' />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Conversion funnel</CardTitle>
            <CardDescription className='text-xs'>From page view to paid customer.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {funnel.map((step, i) => (
              <div key={step.label} className='space-y-1.5'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='font-medium'>{step.label}</span>
                  <span className='text-muted-foreground'>
                    {step.value.toLocaleString('en-US')} ({step.percent}%)
                  </span>
                </div>
                <Progress value={(step.value / funnel[0].value) * 100} className='h-1.5' />
                {i < funnel.length - 1 ? (
                  <p className='text-muted-foreground text-[10px]'>
                    {((funnel[i + 1].value / step.value) * 100).toFixed(1)}% to next step
                  </p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Countries + Recent conversions */}
      <div className='grid gap-4 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Top countries</CardTitle>
            <CardDescription className='text-xs'>Visitors by geography.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2.5'>
            {countries.map((c) => (
              <div key={c.country} className='flex items-center gap-3 text-xs'>
                <span className='text-base leading-none'>{c.flag}</span>
                <span className='flex-1 font-medium'>{c.country}</span>
                <span className='text-muted-foreground'>{c.visitors.toLocaleString('en-US')}</span>
                <Badge variant='secondary' className='h-4 rounded-sm px-1 text-[10px]'>{c.pct}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className='lg:col-span-2'>
          <CardHeader className='flex-row items-center justify-between'>
            <div>
              <CardTitle className='text-base'>Recent conversions</CardTitle>
              <CardDescription className='text-xs'>Latest paying customers.</CardDescription>
            </div>
            <Button variant='ghost' size='sm' className='h-7 text-xs'>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full text-xs'>
                <thead>
                  <tr className='text-muted-foreground border-b text-left'>
                    <th className='pb-2 font-medium'>Customer</th>
                    <th className='pb-2 font-medium'>Plan</th>
                    <th className='pb-2 font-medium'>Amount</th>
                    <th className='pb-2 font-medium'>Source</th>
                    <th className='pb-2 font-medium'>Time</th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {conversions.map((c) => (
                    <tr key={c.name}>
                      <td className='py-2.5 font-medium'>{c.name}</td>
                      <td className='py-2.5'>
                        <Badge className={cn('h-4 rounded-sm px-1 text-[10px]', planBadge[c.plan])}>
                          {c.plan}
                        </Badge>
                      </td>
                      <td className='py-2.5'>{c.amount}</td>
                      <td className='py-2.5 text-muted-foreground'>{c.source}</td>
                      <td className='py-2.5 text-muted-foreground'>{c.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
