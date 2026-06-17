'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/showcase'

import { ApiKeysSettings } from './api-keys'
import { IntegrationsSettings } from './integrations'

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  bio: z.string().max(280, 'Bio must be 280 characters or less').optional()
})

const notificationsSchema = z.object({
  productUpdates: z.boolean(),
  security: z.boolean(),
  marketing: z.boolean()
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

type ProfileValues = z.infer<typeof profileSchema>
type NotificationsValues = z.infer<typeof notificationsSchema>
type PasswordValues = z.infer<typeof passwordSchema>

const notificationItems: Array<{
  id: keyof NotificationsValues
  label: string
  description: string
}> = [
  { id: 'productUpdates', label: 'Product updates', description: 'Newsletter and feature announcements.' },
  { id: 'security', label: 'Security alerts', description: 'Sign-ins from new devices and password changes.' },
  { id: 'marketing', label: 'Marketing emails', description: 'Promotional offers and surveys.' }
]

export default function SettingsPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Settings' description='Manage your account profile, preferences, and security.' />

      <Tabs defaultValue='profile' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='profile'>Profile</TabsTrigger>
          <TabsTrigger value='notifications'>Notifications</TabsTrigger>
          <TabsTrigger value='security'>Security</TabsTrigger>
          <TabsTrigger value='api-keys'>API Keys</TabsTrigger>
          <TabsTrigger value='integrations'>Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value='profile'>
          <ProfileForm />
        </TabsContent>

        <TabsContent value='notifications'>
          <NotificationsForm />
        </TabsContent>

        <TabsContent value='security'>
          <PasswordForm />
        </TabsContent>

        <TabsContent value='api-keys'>
          <ApiKeysSettings />
        </TabsContent>

        <TabsContent value='integrations'>
          <IntegrationsSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProfileForm() {
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', bio: '' }
  })

  const onSubmit = async (values: ProfileValues) => {
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSubmitting(false)
    toast.success('Profile updated', { description: `${values.firstName} ${values.lastName}` })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update how others see you across the workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type='email' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='bio'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder='A short description about yourself' {...field} />
                  </FormControl>
                  <FormDescription>{field.value?.length ?? 0} / 280 characters</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type='submit' disabled={submitting}>
                {submitting ? <Loader2Icon className='animate-spin' /> : null}
                Save changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function NotificationsForm() {
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<NotificationsValues>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: { productUpdates: true, security: true, marketing: false }
  })

  const onSubmit = async (values: NotificationsValues) => {
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSubmitting(false)
    const enabled = Object.values(values).filter(Boolean).length
    toast.success('Preferences saved', { description: `${enabled} of 3 enabled` })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose how we get in touch.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
            {notificationItems.map((item) => (
              <FormField
                key={item.id}
                control={form.control}
                name={item.id}
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start justify-between gap-4 rounded-lg border p-4 space-y-0'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm'>{item.label}</FormLabel>
                      <FormDescription>{item.description}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
            <Separator />
            <div className='flex justify-end'>
              <Button type='submit' disabled={submitting}>
                {submitting ? <Loader2Icon className='animate-spin' /> : null}
                Save preferences
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function PasswordForm() {
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  })

  const onSubmit = async (values: PasswordValues) => {
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSubmitting(false)
    toast.success('Password updated')
    form.reset()
    void values
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Change your password regularly to keep your account safe.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='currentPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <Input type='password' autoComplete='current-password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type='password' autoComplete='new-password' {...field} />
                  </FormControl>
                  <FormDescription>At least 8 characters with an uppercase letter and a number.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type='password' autoComplete='new-password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <div className='flex justify-end'>
              <Button type='submit' disabled={submitting}>
                {submitting ? <Loader2Icon className='animate-spin' /> : null}
                Update password
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
