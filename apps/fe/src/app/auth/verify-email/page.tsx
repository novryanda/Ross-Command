'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MailCheckIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyEmailPage() {
  const [resendIn, setResendIn] = useState(0)

  const onResend = () => {
    setResendIn(30)
    toast.success('Verification email sent', { description: 'Check your inbox' })
    const timer = setInterval(() => {
      setResendIn((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <Card>
      <CardHeader className='items-center space-y-2 text-center'>
        <div className='bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full'>
          <MailCheckIcon className='size-6' />
        </div>
        <CardTitle className='text-xl'>Verify your email</CardTitle>
        <CardDescription>
          We sent a verification link to you@example.com. Click the link to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        <Button className='w-full' onClick={onResend} disabled={resendIn > 0}>
          {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend email'}
        </Button>
        <Link
          href='/auth/login'
          className='text-muted-foreground hover:text-foreground block text-center text-sm'
        >
          Back to sign in
        </Link>
      </CardContent>
    </Card>
  )
}
