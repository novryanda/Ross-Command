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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

type ResetValues = z.infer<typeof resetSchema>

export default function ResetPasswordPage() {
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' }
  })

  const onSubmit = async () => {
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSubmitting(false)
    setDone(true)
    toast.success('Password updated', { description: 'You can now sign in with your new password' })
  }

  if (done) {
    return (
      <Card>
        <CardHeader className='items-center space-y-2 text-center'>
          <div className='bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex size-12 items-center justify-center rounded-full'>
            <CheckCircle2Icon className='size-6' />
          </div>
          <CardTitle className='text-xl'>Password reset</CardTitle>
          <CardDescription>Your password has been changed successfully.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className='w-full'>
            <Link href='/auth/login'>Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className='space-y-1 text-center'>
        <CardTitle className='text-xl'>Set new password</CardTitle>
        <CardDescription>Choose a strong password you haven&apos;t used before</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='At least 8 characters' autoComplete='new-password' {...field} />
                  </FormControl>
                  <FormDescription>Must include an uppercase letter and a number.</FormDescription>
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
                    <Input type='password' placeholder='Re-enter your password' autoComplete='new-password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' className='w-full' disabled={submitting}>
              {submitting ? <Loader2Icon className='animate-spin' /> : null}
              Reset password
            </Button>
            <Link href='/auth/login' className='text-muted-foreground hover:text-foreground block text-center text-sm'>
              Back to sign in
            </Link>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
