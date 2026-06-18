import { redirect } from 'next/navigation'

import { ActivityView } from '@/components/features/activity/activity-view'
import { getMe, serverApiFetch } from '@/lib/api/server'
import type { ActivityItem } from '@/lib/api/types'

export default async function ActivityPage() {
  const me = await getMe()

  if (me.role !== 'super_admin' && !me.isCommander) {
    redirect('/dashboard')
  }

  const response = await serverApiFetch<ActivityItem[]>('/api/v1/activity?limit=100')

  return (
    <ActivityView
      activities={response.data}
      generatedAt={typeof response.meta?.generatedAt === 'string' ? response.meta.generatedAt : undefined}
    />
  )
}
