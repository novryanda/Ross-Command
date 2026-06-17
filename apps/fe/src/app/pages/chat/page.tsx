'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeftIcon,
  PaperclipIcon,
  PhoneIcon,
  SearchIcon,
  SendIcon,
  SmileIcon,
  VideoIcon
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { ConversationItem, MessageBubble, StatusAvatar } from './components'
import {
  ME,
  type Message,
  initialConversations,
  initialMessages,
  participants
} from './data'

export default function ChatPage() {
  const [conversations] = useState(initialConversations)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [activeId, setActiveId] = useState<string>(conversations[0]?.id ?? '')
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)

  const participantMap = useMemo(() => {
    const map = new Map<string, (typeof participants)[number]>()
    participants.forEach((p) => map.set(p.id, p))
    return map
  }, [])

  const sortedConversations = useMemo(() => {
    return [...conversations]
      .map((conv) => {
        const last = messages
          .filter((m) => m.conversationId === conv.id)
          .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0]
        return { conv, last }
      })
      .filter(({ conv }) => {
        if (!search.trim()) return true
        const participant = participantMap.get(conv.participantId)
        return participant?.name.toLowerCase().includes(search.toLowerCase())
      })
      .sort((a, b) => {
        if (a.conv.pinned && !b.conv.pinned) return -1
        if (!a.conv.pinned && b.conv.pinned) return 1
        const aTime = a.last ? new Date(a.last.sentAt).getTime() : 0
        const bTime = b.last ? new Date(b.last.sentAt).getTime() : 0
        return bTime - aTime
      })
  }, [conversations, messages, participantMap, search])

  const activeConv = conversations.find((c) => c.id === activeId)
  const activePartner = activeConv ? participantMap.get(activeConv.participantId) : null
  const activeMessages = useMemo(
    () => messages.filter((m) => m.conversationId === activeId).sort((a, b) => a.sentAt.localeCompare(b.sentAt)),
    [messages, activeId]
  )

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeMessages.length])

  const sendMessage = () => {
    const value = draft.trim()
    if (!value || !activeId) return
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      conversationId: activeId,
      authorId: ME,
      body: value,
      sentAt: new Date().toISOString()
    }
    setMessages((current) => [...current, newMessage])
    setDraft('')
  }

  return (
    <div className='space-y-4'>
      <div>
        <h1 className='text-lg font-semibold tracking-tight'>Messages</h1>
        <p className='text-muted-foreground text-xs'>Chat with your team in real time.</p>
      </div>

      <Card className='gap-0 overflow-hidden p-0'>
        <div className='grid h-[calc(100vh-13rem)] min-h-96 grid-cols-1 md:grid-cols-[300px_1fr]'>
          <aside className={cn('flex flex-col border-r', activeId && 'max-md:hidden')}>
            <div className='border-b p-2'>
              <div className='relative'>
                <SearchIcon className='text-muted-foreground absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2' />
                <Input
                  placeholder='Search conversations...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='h-8 pl-8 text-sm'
                />
              </div>
            </div>
            <div className='flex-1 space-y-0.5 overflow-y-auto p-2'>
              {sortedConversations.map(({ conv, last }) => {
                const participant = participantMap.get(conv.participantId)
                if (!participant) return null
                return (
                  <ConversationItem
                    key={conv.id}
                    participant={participant}
                    lastMessage={last}
                    unread={conv.unread}
                    pinned={conv.pinned}
                    active={conv.id === activeId}
                    onClick={() => setActiveId(conv.id)}
                  />
                )
              })}
            </div>
          </aside>

          {activePartner ? (
            <div className={cn('flex h-full min-h-0 flex-col', !activeId && 'max-md:hidden')}>
              <div className='flex items-center justify-between gap-2 border-b p-3'>
                <div className='flex items-center gap-3'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='size-7 md:hidden'
                    onClick={() => setActiveId('')}
                    aria-label='Back to conversations'
                  >
                    <ArrowLeftIcon className='size-4' />
                  </Button>
                  <StatusAvatar participant={activePartner} />
                  <div>
                    <p className='text-sm font-semibold leading-tight'>{activePartner.name}</p>
                    <p className='text-muted-foreground text-xs capitalize'>
                      {activePartner.role ? `${activePartner.role} · ` : ''}
                      {activePartner.status}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='size-8'
                    aria-label='Voice call'
                    onClick={() => toast.info('Voice call', { description: `Calling ${activePartner.name}...` })}
                  >
                    <PhoneIcon className='size-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='size-8'
                    aria-label='Video call'
                    onClick={() => toast.info('Video call', { description: `Starting video with ${activePartner.name}...` })}
                  >
                    <VideoIcon className='size-4' />
                  </Button>
                </div>
              </div>

              <div ref={scrollRef} className='flex-1 space-y-3 overflow-y-auto p-4'>
                {activeMessages.map((message, index) => {
                  const author = participantMap.get(message.authorId)
                  const next = activeMessages[index + 1]
                  const isLast = !next || next.authorId !== message.authorId
                  if (!author) return null
                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      participant={author}
                      showAvatar={isLast}
                    />
                  )
                })}
              </div>

              <div className='border-t p-2'>
                <div className='flex items-center gap-1'>
                  <Button variant='ghost' size='icon' className='size-8' aria-label='Attach file'>
                    <PaperclipIcon className='size-4' />
                  </Button>
                  <Button variant='ghost' size='icon' className='size-8' aria-label='Emoji'>
                    <SmileIcon className='size-4' />
                  </Button>
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder={`Message ${activePartner.name}...`}
                    className='h-8 flex-1 text-sm'
                  />
                  <Button size='icon' className='size-8' onClick={sendMessage} disabled={!draft.trim()} aria-label='Send'>
                    <SendIcon className='size-4' />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className='text-muted-foreground flex h-full flex-col items-center justify-center gap-2 p-8 text-sm'>
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
