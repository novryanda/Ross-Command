import { redirect } from 'next/navigation'

import { ActivityView } from '@/components/features/activity/activity-view'
import { FilterBar } from '@/components/komando/filter-bar'
import { PageHero } from '@/components/komando/page-hero'
import { ServerPagination } from '@/components/komando/server-pagination'
import { buildQueryString } from '@/lib/api/client'
import { getMe, serverApiFetch } from '@/lib/api/server'
import type { ActivityCategory, ActivityItem } from '@/lib/api/types'

const categoryLabel: Record<ActivityCategory, string> = {
  auth: 'Autentikasi',
  order: 'Tugas',
  submission: 'Bukti',
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const me = await getMe()
  const params = await searchParams

  if (me.role !== 'super_admin' && !me.isCommander) {
    redirect('/dashboard')
  }

  const query = buildQueryString({
    page: params.page,
    limit: params.limit ?? 20,
    category: params.category,
    fromDate: params.fromDate,
    toDate: params.toDate,
  })
  const response = await serverApiFetch<ActivityItem[]>(`/api/v1/activity${query ? `?${query}` : ''}`)

  return (
    <div className='space-y-6'>
      <PageHero
        eyebrow='Aktivitas'
        title='Activity'
        description={`Log aktivitas operasional terbaru.${typeof response.meta?.generatedAt === 'string' ? ` Sinkron terakhir ${new Date(response.meta.generatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}.` : ''}`}
      />

      <FilterBar
        selects={[
          {
            key: 'category',
            label: 'Kategori',
            options: Object.entries(categoryLabel).map(([value, label]) => ({
              value,
              label,
            })),
          },
        ]}
        dateFilters={[
          { key: 'fromDate', label: 'Dari' },
          { key: 'toDate', label: 'Sampai' },
        ]}
      />

      <ActivityView activities={response.data} />

      <ServerPagination meta={response.meta?.pagination} searchParams={params} />
    </div>
  )
}
