import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function BreadcrumbDemoPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Breadcrumb' description='Path to the current resource using a hierarchy of links.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href='#'>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href='#'>Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
