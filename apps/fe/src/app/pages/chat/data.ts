export type Message = {
  id: string
  conversationId: string
  authorId: string
  body: string
  sentAt: string
}

export type Participant = {
  id: string
  name: string
  avatar: string
  fallback: string
  status: 'online' | 'away' | 'offline'
  role?: string
}

export type Conversation = {
  id: string
  participantId: string
  unread: number
  pinned?: boolean
}

import { avatarSrc as avatar } from '@/lib/assets'

const ago = (minutes: number) => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - minutes)
  return d.toISOString()
}

export const ME = 'me'

export const participants: Participant[] = [
  { id: ME, name: 'You', avatar: avatar(1), fallback: 'JD', status: 'online' },
  { id: 'p1', name: 'Sarah Davis', avatar: avatar(2), fallback: 'SD', status: 'online', role: 'Product Manager' },
  { id: 'p2', name: 'Cameron Williamson', avatar: avatar(3), fallback: 'CW', status: 'online', role: 'Engineering Lead' },
  { id: 'p3', name: 'Emma Chen', avatar: avatar(4), fallback: 'EC', status: 'away', role: 'Senior Designer' },
  { id: 'p4', name: 'Marcus Johnson', avatar: avatar(5), fallback: 'MJ', status: 'offline', role: 'Backend Engineer' },
  { id: 'p5', name: 'Olivia Park', avatar: avatar(6), fallback: 'OP', status: 'online', role: 'UX Researcher' },
  { id: 'p6', name: 'Robert Fox', avatar: avatar(7), fallback: 'RF', status: 'offline', role: 'DevOps' }
]

export const initialConversations: Conversation[] = [
  { id: 'c1', participantId: 'p1', unread: 2, pinned: true },
  { id: 'c2', participantId: 'p2', unread: 0 },
  { id: 'c3', participantId: 'p3', unread: 1 },
  { id: 'c4', participantId: 'p4', unread: 0 },
  { id: 'c5', participantId: 'p5', unread: 0 },
  { id: 'c6', participantId: 'p6', unread: 0 }
]

export const initialMessages: Message[] = [
  { id: 'm1', conversationId: 'c1', authorId: 'p1', body: 'Hey! Got a minute to chat about the launch retro?', sentAt: ago(45) },
  { id: 'm2', conversationId: 'c1', authorId: ME, body: 'Yeah, just finishing up something. Give me 5 minutes.', sentAt: ago(43) },
  { id: 'm3', conversationId: 'c1', authorId: 'p1', body: 'Perfect, I will start drafting the agenda.', sentAt: ago(42) },
  { id: 'm4', conversationId: 'c1', authorId: 'p1', body: 'Also pulled the Q3 metrics, they look really strong this time.', sentAt: ago(8) },
  { id: 'm5', conversationId: 'c1', authorId: 'p1', body: 'Wanna jump on a call?', sentAt: ago(2) },

  { id: 'm6', conversationId: 'c2', authorId: 'p2', body: 'PR #142 is ready for your review whenever you have a sec.', sentAt: ago(120) },
  { id: 'm7', conversationId: 'c2', authorId: ME, body: 'On it.', sentAt: ago(115) },

  { id: 'm8', conversationId: 'c3', authorId: 'p3', body: 'Updated the onboarding mocks based on yesterday feedback.', sentAt: ago(180) },
  { id: 'm9', conversationId: 'c3', authorId: 'p3', body: 'Let me know if anything needs another pass.', sentAt: ago(60) },

  { id: 'm10', conversationId: 'c4', authorId: 'p4', body: 'DB migration completed successfully. No downtime.', sentAt: ago(360) },
  { id: 'm11', conversationId: 'c4', authorId: ME, body: 'Awesome, thanks for handling that.', sentAt: ago(355) },

  { id: 'm12', conversationId: 'c5', authorId: 'p5', body: 'User interviews scheduled for next week, sending the calendar invites.', sentAt: ago(540) },

  { id: 'm13', conversationId: 'c6', authorId: 'p6', body: 'CI pipeline upgraded to v3, builds are 40% faster now.', sentAt: ago(1440) }
]
