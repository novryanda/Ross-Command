'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  XAxis
} from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import { PageHeader } from '@/components/showcase'

const monthlyData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 }
]

const dualConfig = {
  desktop: { label: 'Desktop', color: 'var(--primary)' },
  mobile: {
    label: 'Mobile',
    color: 'color-mix(in oklab, var(--primary) 40%, transparent)'
  }
} satisfies ChartConfig

const browserData = [
  { browser: 'chrome', visitors: 275, fill: 'var(--color-chrome)' },
  { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
  { browser: 'firefox', visitors: 187, fill: 'var(--color-firefox)' },
  { browser: 'edge', visitors: 173, fill: 'var(--color-edge)' },
  { browser: 'other', visitors: 90, fill: 'var(--color-other)' }
]

const browserConfig = {
  visitors: { label: 'Visitors' },
  chrome: { label: 'Chrome', color: 'var(--primary)' },
  safari: { label: 'Safari', color: 'color-mix(in oklab, var(--primary) 80%, transparent)' },
  firefox: { label: 'Firefox', color: 'color-mix(in oklab, var(--primary) 60%, transparent)' },
  edge: { label: 'Edge', color: 'color-mix(in oklab, var(--primary) 40%, transparent)' },
  other: { label: 'Other', color: 'color-mix(in oklab, var(--primary) 20%, transparent)' }
} satisfies ChartConfig

const radarData = [
  { month: 'January', desktop: 186 },
  { month: 'February', desktop: 305 },
  { month: 'March', desktop: 237 },
  { month: 'April', desktop: 273 },
  { month: 'May', desktop: 209 },
  { month: 'June', desktop: 214 }
]

const radarConfig = {
  desktop: { label: 'Desktop', color: 'var(--primary)' }
} satisfies ChartConfig

export default function ChartsPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Charts' description='Recharts powered visualizations styled with shadcn tokens.' />

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Area Chart</CardTitle>
            <CardDescription>January - June 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={dualConfig}>
              <AreaChart data={monthlyData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='month'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='dot' />} />
                <Area
                  dataKey='mobile'
                  type='natural'
                  fill='var(--color-mobile)'
                  fillOpacity={0.4}
                  stroke='var(--color-mobile)'
                  stackId='a'
                />
                <Area
                  dataKey='desktop'
                  type='natural'
                  fill='var(--color-desktop)'
                  fillOpacity={0.4}
                  stroke='var(--color-desktop)'
                  stackId='a'
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bar Chart</CardTitle>
            <CardDescription>January - June 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={dualConfig}>
              <BarChart data={monthlyData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='month'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='dashed' />} />
                <Bar dataKey='desktop' fill='var(--color-desktop)' radius={4} />
                <Bar dataKey='mobile' fill='var(--color-mobile)' radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Line Chart</CardTitle>
            <CardDescription>January - June 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={dualConfig}>
              <LineChart data={monthlyData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='month'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Line dataKey='desktop' type='monotone' stroke='var(--color-desktop)' strokeWidth={2} dot={false} />
                <Line dataKey='mobile' type='monotone' stroke='var(--color-mobile)' strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='items-center pb-0'>
            <CardTitle>Pie Chart</CardTitle>
            <CardDescription>Browser share</CardDescription>
          </CardHeader>
          <CardContent className='flex-1 pb-0'>
            <ChartContainer config={browserConfig} className='mx-auto aspect-square max-h-72'>
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={browserData} dataKey='visitors' nameKey='browser' />
                <ChartLegend
                  content={<ChartLegendContent nameKey='browser' />}
                  className='-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center'
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='items-center pb-4'>
            <CardTitle>Radar Chart</CardTitle>
            <CardDescription>January - June 2024</CardDescription>
          </CardHeader>
          <CardContent className='pb-0'>
            <ChartContainer config={radarConfig} className='mx-auto aspect-square max-h-72'>
              <RadarChart data={radarData}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <PolarAngleAxis dataKey='month' />
                <PolarGrid />
                <Radar
                  dataKey='desktop'
                  fill='var(--color-desktop)'
                  fillOpacity={0.6}
                  stroke='var(--color-desktop)'
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='items-center pb-0'>
            <CardTitle>Radial Chart</CardTitle>
            <CardDescription>Browser share</CardDescription>
          </CardHeader>
          <CardContent className='flex-1 pb-0'>
            <ChartContainer config={browserConfig} className='mx-auto aspect-square max-h-72'>
              <RadialBarChart data={browserData} innerRadius={30} outerRadius={110}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey='browser' />} />
                <PolarAngleAxis type='number' domain={[0, 300]} tick={false} />
                <RadialBar dataKey='visitors' background />
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
