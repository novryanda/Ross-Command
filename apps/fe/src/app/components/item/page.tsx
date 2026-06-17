'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle
} from '@/components/ui/item'
import { ChevronRightIcon, FileTextIcon } from 'lucide-react'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function ItemPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Item' description='A flexible row for lists, with media, content, and actions.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Item className='w-[360px] border'>
            <ItemMedia variant='icon'>
              <FileTextIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Project proposal.pdf</ItemTitle>
              <ItemDescription>Updated 2 hours ago · 1.2 MB</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant='ghost' size='icon-sm'>
                <ChevronRightIcon />
              </Button>
            </ItemActions>
          </Item>
        </Showcase>
        <Showcase title='Group'>
          <ItemGroup className='w-[360px] rounded-lg border'>
            <Item>
              <ItemMedia>
                <Avatar>
                  <AvatarFallback>AP</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Aria Patel</ItemTitle>
                <ItemDescription>aria@moccilabs.com</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge variant='secondary'>Admin</Badge>
              </ItemActions>
            </Item>
            <ItemSeparator />
            <Item>
              <ItemMedia>
                <Avatar>
                  <AvatarFallback>ML</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Marcus Lee</ItemTitle>
                <ItemDescription>marcus@moccilabs.com</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge variant='outline'>Member</Badge>
              </ItemActions>
            </Item>
          </ItemGroup>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
