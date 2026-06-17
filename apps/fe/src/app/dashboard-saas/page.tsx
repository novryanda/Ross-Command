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
  XAxis
} from 'recharts'
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  DollarSignIcon,
  TrendingDownIcon,
  UsersIcon,
  ZapIcon
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { avatarSrc } from '@/lib/assets'

const kpis = [
  {
    label: 'Monthly recurring revenue',
    value: '$48,290',
    change: 12.4,
    trend: 'up' as const,
    icon: DollarSignIcon
  },
  {
    label: 'Active users',
    value: '8,492',
    change: 8.2,
    trend: 'up' as const,
    icon: UsersIcon
  },
  {
    label: 'Annual run rate',
    value: '$579,480',
    change: 15.7,
    trend: 'up' as const,
    icon: ZapIcon
  },
  {
    label: 'Churn rate',
    value: '2.4%',
    change: 0.8,
    trend: 'down' as const,
    icon: TrendingDownIcon
  }
]

const revenueData = [
  { month: 'Jan', mrr: 28000, newRevenue: 6200 },
  { month: 'Feb', mrr: 31000, newRevenue: 7100 },
  { month: 'Mar', mrr: 33500, newRevenue: 6800 },
  { month: 'Apr', mrr: 36200, newRevenue: 8400 },
  { month: 'May', mrr: 39800, newRevenue: 9600 },
  { month: 'Jun', mrr: 42100, newRevenue: 8900 },
  { month: 'Jul', mrr: 45300, newRevenue: 10200 },
  { month: 'Aug', mrr: 48290, newRevenue: 11100 }
]

const revenueConfig = {
  mrr: { label: 'MRR', color: 'var(--primary)' },
  newRevenue: {
    label: 'New revenue',
    color: 'color-mix(in oklab, var(--primary) 40%, transparent)'
  }
} satisfies ChartConfig

const signupData = [
  { day: 'Mon', signups: 124 },
  { day: 'Tue', signups: 168 },
  { day: 'Wed', signups: 142 },
  { day: 'Thu', signups: 215 },
  { day: 'Fri', signups: 189 },
  { day: 'Sat', signups: 96 },
  { day: 'Sun', signups: 78 }
]

const signupConfig = {
  signups: { label: 'Signups', color: 'var(--primary)' }
} satisfies ChartConfig

const planData = [
  { plan: 'Starter', users: 4280, fill: 'color-mix(in oklab, var(--primary) 30%, transparent)' },
  { plan: 'Pro', users: 3490, fill: 'color-mix(in oklab, var(--primary) 60%, transparent)' },
  { plan: 'Enterprise', users: 722, fill: 'var(--primary)' }
]

const planConfig = {
  users: { label: 'Users' },
  Starter: { label: 'Starter', color: 'color-mix(in oklab, var(--primary) 30%, transparent)' },
  Pro: { label: 'Pro', color: 'color-mix(in oklab, var(--primary) 60%, transparent)' },
  Enterprise: { label: 'Enterprise', color: 'var(--primary)' }
} satisfies ChartConfig

const recentSignups = [
  { name: 'Aria Patel', email: 'aria@designhub.io', plan: 'Pro', avatar: 1, fallback: 'AP', joinedAt: '2m ago' },
  { name: 'Marcus Lee', email: 'marcus@startup.com', plan: 'Starter', avatar: 2, fallback: 'ML', joinedAt: '14m ago' },
  { name: 'Jennifer Cole', email: 'jen@labs.dev', plan: 'Enterprise', avatar: 3, fallback: 'JC', joinedAt: '1h ago' },
  { name: 'Diego Ramirez', email: 'diego@studio.co', plan: 'Pro', avatar: 4, fallback: 'DR', joinedAt: '3h ago' },
  { name: 'Sara Williams', email: 'sara@example.com', plan: 'Starter', avatar: 5, fallback: 'SW', joinedAt: '5h ago' }
]

const planBadge: Record<string, string> = {
  Starter: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Pro: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  Enterprise: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
}

const funnel = [
  { label: 'Visitors', value: 24890, percent: 100 },
  { label: 'Signups', value: 4218, percent: 16.9 },
  { label: 'Activated', value: 2841, percent: 11.4 },
  { label: 'Paying', value: 892, percent: 3.6 }
]

export default function DashboardSaas() {
  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-lg font-semibold tracking-tight'>SaaS Dashboard</h1>
          <p className='text-muted-foreground text-xs'>
            Track revenue, users, and product growth in one place.
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

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          const TrendIcon = kpi.trend === 'up' ? ArrowUpRightIcon : ArrowDownRightIcon
          const trendColor =
            kpi.trend === 'up'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
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
                <div className={cn('flex items-center gap-1 text-xs', trendColor)}>
                  <TrendIcon className='size-3' />
                  <span>{kpi.change}%</span>
                  <span className='text-muted-foreground'>vs last period</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='text-base'>Revenue growth</CardTitle>
            <CardDescription className='text-xs'>MRR and new revenue over the last 8 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className='h-72 w-full'>
              <AreaChart data={revenueData} margin={{ left: 12, right: 12 }}>
                <defs>
                  <linearGradient id='mrrGradient' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='var(--color-mrr)' stopOpacity={0.4} />
                    <stop offset='95%' stopColor='var(--color-mrr)' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id='newGradient' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='var(--color-newRevenue)' stopOpacity={0.4} />
                    <stop offset='95%' stopColor='var(--color-newRevenue)' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='dot' />} />
                <Area
                  dataKey='mrr'
                  type='monotone'
                  fill='url(#mrrGradient)'
                  stroke='var(--color-mrr)'
                  strokeWidth={2}
                />
                <Area
                  dataKey='newRevenue'
                  type='monotone'
                  fill='url(#newGradient)'
                  stroke='var(--color-newRevenue)'
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Plan distribution</CardTitle>
            <CardDescription className='text-xs'>Active subscriptions by tier.</CardDescription>
          </CardHeader>
          <CardContent className='flex-1'>
            <ChartContainer config={planConfig} className='mx-auto aspect-square max-h-44'>
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey='plan' />} />
                <Pie data={planData} dataKey='users' nameKey='plan' innerRadius={48} outerRadius={70}>
                  {planData.map((entry) => (
                    <Cell key={entry.plan} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className='mt-3 space-y-1.5'>
              {planData.map((entry) => (
                <div key={entry.plan} className='flex items-center gap-2 text-xs'>
                  <span
                    className='size-2 shrink-0 rounded-full'
                    style={{ backgroundColor: entry.fill }}
                    aria-hidden
                  />
                  <span className='flex-1'>{entry.plan}</span>
                  <span className='text-muted-foreground'>{entry.users.toLocaleString('en-US')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Daily signups</CardTitle>
            <CardDescription className='text-xs'>This week.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={signupConfig} className='h-44 w-full'>
              <BarChart data={signupData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey='day' tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='dashed' />} />
                <Bar dataKey='signups' fill='var(--color-signups)' radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Conversion funnel</CardTitle>
            <CardDescription className='text-xs'>From visit to paying customer.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {funnel.map((step, index) => (
              <div key={step.label} className='space-y-1.5'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='font-medium'>{step.label}</span>
                  <span className='text-muted-foreground'>
                    {step.value.toLocaleString('en-US')} ({step.percent}%)
                  </span>
                </div>
                <Progress value={(step.value / funnel[0].value) * 100} className='h-1.5' />
                {index < funnel.length - 1 ? (
                  <p className='text-muted-foreground text-[10px]'>
                    {((funnel[index + 1].value / step.value) * 100).toFixed(1)}% conversion to next step
                  </p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex-row items-center justify-between'>
            <div>
              <CardTitle className='text-base'>Recent signups</CardTitle>
              <CardDescription className='text-xs'>Latest 5 customers.</CardDescription>
            </div>
            <Button variant='ghost' size='sm' className='h-7 text-xs'>
              View all
            </Button>
          </CardHeader>
          <CardContent className='space-y-0'>
            <ul className='divide-border divide-y'>
              {recentSignups.map((user) => (
                <li key={user.email} className='flex items-center gap-3 py-2.5 first:pt-0 last:pb-0'>
                  <Avatar className='size-8'>
                    <AvatarImage
                      src={avatarSrc(user.avatar)}
                      alt={user.name}
                    />
                    <AvatarFallback className='text-[10px]'>{user.fallback}</AvatarFallback>
                  </Avatar>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>{user.name}</p>
                    <p className='text-muted-foreground truncate text-xs'>{user.email}</p>
                  </div>
                  <div className='flex flex-col items-end gap-1'>
                    <Badge className={cn('h-4 rounded-sm px-1 text-[10px]', planBadge[user.plan])}>
                      {user.plan}
                    </Badge>
                    <span className='text-muted-foreground text-[10px]'>{user.joinedAt}</span>
                  </div>
                </li>
              ))}
            </ul>
            <Separator className='my-3' />
            <Button variant='outline' size='sm' className='w-full text-xs'>
              Invite via email
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
