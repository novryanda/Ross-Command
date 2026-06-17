'use client'

import { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CheckCircle2Icon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email')
})

type ForgotValues = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' }
  })

  const onSubmit = async (values: ForgotValues) => {
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSubmitting(false)
    setSent(true)
    toast.success('Reset link sent', { description: values.email })
  }

  if (sent) {
    return (
      <Card>
        <CardHeader className='items-center space-y-2 text-center'>
          <div className='bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex size-12 items-center justify-center rounded-full'>
            <CheckCircle2Icon className='size-6' />
          </div>
          <CardTitle className='text-xl'>Check your email</CardTitle>
          <CardDescription>
            We sent a password reset link to {form.getValues('email')}. The link expires in 1 hour.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <Button variant='outline' className='w-full' onClick={() => setSent(false)}>
            Use different email
          </Button>
          <Link href='/auth/login' className='text-muted-foreground hover:text-foreground block text-center text-sm'>
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className='space-y-1 text-center'>
        <CardTitle className='text-xl'>Reset password</CardTitle>
        <CardDescription>Enter your email and we&apos;ll send you a reset link</CardDescription>
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
            <Button type='submit' className='w-full' disabled={submitting}>
              {submitting ? <Loader2Icon className='animate-spin' /> : null}
              Send reset link
            </Button>
            <p className='text-muted-foreground text-center text-sm'>
              Remember your password?{' '}
              <Link href='/auth/login' className='text-foreground hover:underline'>
                Sign in
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
