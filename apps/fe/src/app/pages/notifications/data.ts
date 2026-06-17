import {
  CheckCircle2Icon,
  CreditCardIcon,
  MessageSquareIcon,
  RocketIcon,
  TriangleAlertIcon,
  UserPlusIcon,
  type LucideIcon
} from 'lucide-react'

export type NotificationCategory = 'message' | 'payment' | 'system' | 'team' | 'alert'

export type NotificationEntry = {
  id: string
  category: NotificationCategory
  title: string
  description: string
  /** ISO date string */
  timestamp: string
  read: boolean
}

export const categoryMeta: Record<NotificationCategory, { label: string; icon: LucideIcon; className: string }> = {
  message: { label: 'Message', icon: MessageSquareIcon, className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  payment: { label: 'Payment', icon: CreditCardIcon, className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  system: { label: 'System', icon: RocketIcon, className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  team: { label: 'Team', icon: UserPlusIcon, className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  alert: { label: 'Alert', icon: TriangleAlertIcon, className: 'bg-red-500/10 text-red-600 dark:text-red-400' }
}

const minutes = (n: number) => new Date(Date.now() - n * 60_000).toISOString()

export const notifications: NotificationEntry[] = [
  { id: 'n1', category: 'message', title: 'New comment on your post', description: 'Sarah Davis replied to "Q3 launch retrospective".', timestamp: minutes(4), read: false },
  { id: 'n2', category: 'payment', title: 'Payment received', description: 'You received $312.40 from Acme Corp.', timestamp: minutes(38), read: false },
  { id: 'n3', category: 'team', title: 'New team member', description: 'Cameron Williamson joined the workspace.', timestamp: minutes(95), read: false },
  { id: 'n4', category: 'system', title: 'Build completed', description: 'Production deploy finished in 1m 24s.', timestamp: minutes(180), read: true },
  { id: 'n5', category: 'alert', title: 'Unusual login detected', description: 'A new sign-in from Jakarta, ID was flagged for review.', timestamp: minutes(320), read: false },
  { id: 'n6', category: 'payment', title: 'Invoice overdue', description: 'Invoice #INV-2043 for Globex is 3 days overdue.', timestamp: minutes(600), read: true },
  { id: 'n7', category: 'message', title: 'You were mentioned', description: 'Wade Warren mentioned you in #engineering.', timestamp: minutes(1500), read: true },
  { id: 'n8', category: 'system', title: 'Storage almost full', description: 'Your workspace is using 92% of available storage.', timestamp: minutes(2880), read: true },
  { id: 'n9', category: 'team', title: 'Role updated', description: 'Esther Howard was promoted to Admin.', timestamp: minutes(4320), read: true }
]

export const successIcon = CheckCircle2Icon
