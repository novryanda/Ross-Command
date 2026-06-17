'use client'

import { useState } from 'react'

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

export default function InputOTPPage() {
  const [value, setValue] = useState('')

  return (
    <div className='space-y-8'>
      <PageHeader title='Input OTP' description='Accessible one-time password component.' />
      <ShowcaseGrid>
        <Showcase title='Default'>
          <InputOTP maxLength={6} value={value} onChange={setValue}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
