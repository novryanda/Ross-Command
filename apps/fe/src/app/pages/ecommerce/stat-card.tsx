import type { LucideIcon } from 'lucide-react'
import { ArrowDownRightIcon, ArrowUpRightIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type Stat = {
  label: string
  value: string
  change?: number
  trend?: 'up' | 'down'
  icon: LucideIcon
}

export function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {stats.map((stat) => {
        const Icon = stat.icon
        const TrendIcon = stat.trend === 'down' ? ArrowDownRightIcon : ArrowUpRightIcon
        const trendColor =
          stat.trend === 'down'
            ? 'text-rose-600 dark:text-rose-400'
            : 'text-emerald-600 dark:text-emerald-400'
        return (
          <Card key={stat.label}>
            <CardContent className='space-y-3'>
              <div className='flex items-center justify-between'>
                <p className='text-muted-foreground text-xs'>{stat.label}</p>
                <div className='bg-primary/10 text-primary flex size-7 items-center justify-center rounded-md'>
                  <Icon className='size-3.5' />
                </div>
              </div>
              <p className='text-2xl font-semibold tracking-tight'>{stat.value}</p>
              {typeof stat.change === 'number' ? (
                <div className={cn('flex items-center gap-1 text-xs', trendColor)}>
                  <TrendIcon className='size-3' />
                  <span>{stat.change}%</span>
                  <span className='text-muted-foreground'>vs last period</span>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
