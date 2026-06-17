import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function AccordionPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Accordion' description='Vertically stacked headings revealing sections of content.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Accordion type='single' collapsible className='w-full max-w-md'>
            <AccordionItem value='item-1'>
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-2'>
              <AccordionTrigger>Is it styled?</AccordionTrigger>
              <AccordionContent>Yes. It uses Tailwind classes you can customize.</AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-3'>
              <AccordionTrigger>Is it animated?</AccordionTrigger>
              <AccordionContent>Yes. It uses CSS animations by default.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
