'use client'

import { useEffect, useState } from 'react'
import { Loader2Icon, SendIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/rich-text-editor'

import type { Email } from './data'

export type ComposeMode = 'new' | 'reply' | 'forward'

type ComposePanelProps = {
  mode: ComposeMode
  source: Email | null
  onClose: () => void
}

const titles: Record<ComposeMode, string> = {
  new: 'New message',
  reply: 'Reply',
  forward: 'Forward'
}

function quotedBody(email: Email) {
  const date = new Date(email.receivedAt).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
  return `<p></p><p></p><blockquote><p>On ${date}, ${email.from.name} &lt;${email.from.email}&gt; wrote:</p>${email.body}</blockquote>`
}

export function ComposePanel({ mode, source, onClose }: ComposePanelProps) {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (mode === 'reply' && source) {
      setTo(source.from.email)
      setSubject(source.subject.startsWith('Re:') ? source.subject : `Re: ${source.subject}`)
      setBody(quotedBody(source))
    } else if (mode === 'forward' && source) {
      setTo('')
      setSubject(source.subject.startsWith('Fwd:') ? source.subject : `Fwd: ${source.subject}`)
      setBody(quotedBody(source))
    } else {
      setTo('')
      setSubject('')
      setBody('')
    }
  }, [mode, source])

  const send = async () => {
    if (!to.trim()) {
      toast.error('Recipient required', { description: 'Add at least one recipient.' })
      return
    }
    setSending(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSending(false)
    onClose()
    toast.success('Message sent', { description: `To ${to}` })
  }

  return (
    <div className='flex h-full flex-col'>
      <div className='flex items-center justify-between gap-2 border-b p-3'>
        <p className='text-sm font-semibold'>{titles[mode]}</p>
        <Button variant='ghost' size='icon' className='size-7' onClick={onClose} aria-label='Close'>
          <XIcon className='size-4' />
        </Button>
      </div>

      <div className='flex flex-1 flex-col gap-3 overflow-y-auto p-4'>
        <div className='grid gap-1.5'>
          <Label htmlFor='compose-to' className='text-xs'>
            To
          </Label>
          <Input
            id='compose-to'
            type='email'
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder='recipient@example.com'
            className='h-8 text-sm'
          />
        </div>
        <div className='grid gap-1.5'>
          <Label htmlFor='compose-subject' className='text-xs'>
            Subject
          </Label>
          <Input
            id='compose-subject'
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder='Subject'
            className='h-8 text-sm'
          />
        </div>
        <div className='flex flex-1 flex-col gap-1.5'>
          <Label className='text-xs'>Message</Label>
          <RichTextEditor
            value={body}
            onChange={setBody}
            placeholder='Write your message...'
            minHeight='180px'
            className='flex-1'
          />
        </div>
      </div>

      <div className='flex items-center justify-between gap-2 border-t p-3'>
        <Button variant='ghost' size='sm' onClick={onClose}>
          Discard
        </Button>
        <Button size='sm' onClick={send} disabled={sending}>
          {sending ? <Loader2Icon className='animate-spin' /> : <SendIcon className='size-3.5' />}
          Send
        </Button>
      </div>
    </div>
  )
}
