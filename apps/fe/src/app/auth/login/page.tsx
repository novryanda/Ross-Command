'use client'

import { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean().optional()
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false }
  })

  const onSubmit = async (values: LoginValues) => {
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSubmitting(false)
    toast.success('Welcome back', { description: values.email })
  }

  return (
    <Card>
      <CardHeader className='space-y-1 text-center'>
        <CardTitle className='text-xl'>Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type='email' placeholder='you@example.com' autoComplete='email' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between'>
                    <FormLabel>Password</FormLabel>
                    <Link
                      href='/auth/forgot-password'
                      className='text-muted-foreground hover:text-foreground text-xs'
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input type='password' placeholder='••••••••' autoComplete='current-password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='remember'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center gap-2 space-y-0'>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className='text-xs font-normal'>Remember me for 30 days</FormLabel>
                </FormItem>
              )}
            />
            <Button type='submit' className='w-full' disabled={submitting}>
              {submitting ? <Loader2Icon className='animate-spin' /> : null}
              Sign in
            </Button>
            <p className='text-muted-foreground text-center text-sm'>
              Don&apos;t have an account?{' '}
              <Link href='/auth/register' className='text-foreground hover:underline'>
                Sign up
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
