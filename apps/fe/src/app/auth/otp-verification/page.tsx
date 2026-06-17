'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

export default function OtpVerificationPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resendIn, setResendIn] = useState(0)

  const onVerify = async () => {
    if (code.length < 6) {
      toast.error('Enter the 6-digit code')
      return
    }
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSubmitting(false)
    toast.success('Verified', { description: 'Your identity has been confirmed' })
    router.push('/dashboard')
  }

  const onResend = () => {
    setResendIn(30)
    toast.success('Code sent', { description: 'A new code is on its way' })
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
      <CardHeader className='space-y-1 text-center'>
        <CardTitle className='text-xl'>Two-factor verification</CardTitle>
        <CardDescription>Enter the 6-digit code we sent to your device</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex justify-center'>
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button className='w-full' onClick={onVerify} disabled={submitting}>
          {submitting ? <Loader2Icon className='animate-spin' /> : null}
          Verify
        </Button>
        <p className='text-muted-foreground text-center text-sm'>
          Didn&apos;t get a code?{' '}
          {resendIn > 0 ? (
            <span>Resend in {resendIn}s</span>
          ) : (
            <button type='button' onClick={onResend} className='text-foreground hover:underline'>
              Resend code
            </button>
          )}
        </p>
        <Link href='/auth/login' className='text-muted-foreground hover:text-foreground block text-center text-sm'>
          Back to sign in
        </Link>
      </CardContent>
    </Card>
  )
}
