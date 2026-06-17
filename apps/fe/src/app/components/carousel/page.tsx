'use client'

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function CarouselPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Carousel' description='A carousel with motion and swipe built using Embla.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Carousel className='w-full max-w-xs'>
            <CarouselContent>
              {Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index}>
                  <Card>
                    <CardContent className='flex aspect-square items-center justify-center p-6'>
                      <span className='text-3xl font-semibold'>{index + 1}</span>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
