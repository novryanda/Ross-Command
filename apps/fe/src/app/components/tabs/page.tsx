'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function TabsPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Tabs' description='Layered sections of content displayed one at a time.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <Tabs defaultValue='account' className='w-full max-w-md'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='account'>Account</TabsTrigger>
              <TabsTrigger value='password'>Password</TabsTrigger>
            </TabsList>
            <TabsContent value='account'>
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>Update your account details.</CardDescription>
                </CardHeader>
                <CardContent className='text-muted-foreground text-sm'>Account settings go here.</CardContent>
              </Card>
            </TabsContent>
            <TabsContent value='password'>
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Change your password.</CardDescription>
                </CardHeader>
                <CardContent className='text-muted-foreground text-sm'>Password form goes here.</CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
