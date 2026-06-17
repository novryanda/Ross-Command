'use client'

import { Slider } from '@/components/ui/slider'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function SliderPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Slider' description='Select a value from within a given range.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Slider defaultValue={[50]} max={100} step={1} className='w-full max-w-sm' />
        </Showcase>
        <Showcase title='Range'>
          <Slider defaultValue={[20, 80]} max={100} step={1} className='w-full max-w-sm' />
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
