'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LockScreenPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!password) {
      toast.error('Enter your password to unlock')
      return
    }
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSubmitting(false)
    toast.success('Unlocked', { description: 'Welcome back' })
    router.push('/dashboard')
  }

  return (
    <Card>
      <CardHeader className='items-center space-y-3 text-center'>
        <Avatar className='size-16'>
          <AvatarImage src='https://github.com/shadcn.png' alt='Jane Doe' />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className='space-y-1'>
          <CardTitle className='text-xl'>Jane Doe</CardTitle>
          <CardDescription>Enter your password to unlock the screen</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className='space-y-4' onSubmit={onSubmit}>
          <div className='space-y-2'>
            <Label htmlFor='unlock-password'>Password</Label>
            <Input
              id='unlock-password'
              type='password'
              placeholder='••••••••'
              autoComplete='current-password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <Button type='submit' className='w-full' disabled={submitting}>
            {submitting ? <Loader2Icon className='animate-spin' /> : null}
            Unlock
          </Button>
          <Link
            href='/auth/login'
            className='text-muted-foreground hover:text-foreground block text-center text-sm'
          >
            Sign in as a different user
          </Link>
        </form>
      </CardContent>
    </Card>
  )
}
