import { TableSkeleton } from '@/components/skeletons'

import { PageHeader } from '@/components/showcase'

export default function Loading() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Data Table' description='Searchable, sortable, filterable table with row selection.' />
      <TableSkeleton rows={8} cols={6} />
    </div>
  )
}
