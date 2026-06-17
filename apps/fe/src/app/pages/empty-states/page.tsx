'use client'

import {
  FileXIcon,
  InboxIcon,
  LockIcon,
  PlusIcon,
  SearchIcon,
  ServerCrashIcon,
  UsersIcon,
  WifiOffIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function EmptyStatesPage() {
  return (
    <div className='space-y-6'>
      <PageHeader
        title='Empty States'
        description='Patterns for empty, error, and no-result UI scenarios.'
      />

      <ShowcaseGrid>
        <Showcase title='No data'>
          <Card className='w-full p-0'>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <InboxIcon />
                </EmptyMedia>
                <EmptyTitle>No items yet</EmptyTitle>
                <EmptyDescription>
                  Get started by creating your first item. You can always edit or remove it later.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button size='sm'>
                  <PlusIcon /> Create item
                </Button>
              </EmptyContent>
            </Empty>
          </Card>
        </Showcase>

        <Showcase title='No search results'>
          <Card className='w-full p-0'>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <SearchIcon />
                </EmptyMedia>
                <EmptyTitle>No results found</EmptyTitle>
                <EmptyDescription>
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant='outline' size='sm'>
                  Clear filters
                </Button>
              </EmptyContent>
            </Empty>
          </Card>
        </Showcase>

        <Showcase title='No permission'>
          <Card className='w-full p-0'>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <LockIcon />
                </EmptyMedia>
                <EmptyTitle>Access restricted</EmptyTitle>
                <EmptyDescription>
                  You don&apos;t have permission to view this resource. Contact an administrator for access.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant='outline' size='sm'>
                  Request access
                </Button>
              </EmptyContent>
            </Empty>
          </Card>
        </Showcase>

        <Showcase title='Error'>
          <Card className='w-full p-0'>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <ServerCrashIcon />
                </EmptyMedia>
                <EmptyTitle>Something went wrong</EmptyTitle>
                <EmptyDescription>
                  We couldn&apos;t load your data. Try refreshing or come back in a few minutes.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button size='sm'>Try again</Button>
                <Button variant='ghost' size='sm'>
                  Contact support
                </Button>
              </EmptyContent>
            </Empty>
          </Card>
        </Showcase>

        <Showcase title='Offline'>
          <Card className='w-full p-0'>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <WifiOffIcon />
                </EmptyMedia>
                <EmptyTitle>You&apos;re offline</EmptyTitle>
                <EmptyDescription>
                  Check your internet connection and try again. Your changes will sync once you&apos;re back online.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant='outline' size='sm'>
                  Retry
                </Button>
              </EmptyContent>
            </Empty>
          </Card>
        </Showcase>

        <Showcase title='No team members'>
          <Card className='w-full p-0'>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <UsersIcon />
                </EmptyMedia>
                <EmptyTitle>Invite your team</EmptyTitle>
                <EmptyDescription>
                  Bring in teammates to collaborate on projects, share files, and review work together.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button size='sm'>
                  <PlusIcon /> Invite members
                </Button>
                <Button variant='link' size='sm'>
                  Learn about teams
                </Button>
              </EmptyContent>
            </Empty>
          </Card>
        </Showcase>

        <Showcase title='File deleted'>
          <Card className='w-full p-0'>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <FileXIcon />
                </EmptyMedia>
                <EmptyTitle>File no longer available</EmptyTitle>
                <EmptyDescription>
                  This file has been deleted or moved. It may still be in your trash for the next 30 days.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant='outline' size='sm'>
                  Open trash
                </Button>
              </EmptyContent>
            </Empty>
          </Card>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
