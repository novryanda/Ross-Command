'use client'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function NavigationMenuPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Navigation Menu' description='Collection of links for navigating websites.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className='grid w-[280px] gap-1 p-2'>
                    <li>
                      <NavigationMenuLink href='#'>Introduction</NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink href='#'>Installation</NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href='#' className={navigationMenuTriggerStyle()}>
                  Docs
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
