import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function CardPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Card' description='Displays a card with header, content, and footer.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Card className='w-full max-w-sm'>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>You have 3 unread messages.</CardDescription>
              <CardAction>
                <Button variant='outline' size='sm'>
                  View all
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-sm'>
                Push notifications are sent to your device when new updates are available.
              </p>
            </CardContent>
            <CardFooter>
              <Button className='w-full'>Mark all as read</Button>
            </CardFooter>
          </Card>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
