export type Email = {
  id: string
  from: { name: string; email: string; avatar?: string; fallback: string }
  subject: string
  preview: string
  body: string
  receivedAt: string
  read: boolean
  starred: boolean
  folder: 'inbox' | 'starred' | 'sent' | 'drafts' | 'trash'
  labels: string[]
  hasAttachment?: boolean
}

// Fixed base date keeps timestamps deterministic across server/client renders
// (using new Date() here caused hydration mismatches as time advanced).
const BASE = new Date('2025-05-29T12:00:00.000Z')
const ago = (hours: number) => {
  const d = new Date(BASE)
  d.setHours(d.getHours() - hours)
  return d.toISOString()
}

import { avatarSrc as avatar } from '@/lib/assets'

export const initialEmails: Email[] = [
  {
    id: 'e1',
    from: { name: 'Sarah Davis', email: 'sarah@acme.com', avatar: avatar(1), fallback: 'SD' },
    subject: 'Q3 launch retrospective notes',
    preview: 'Hi team, sharing the consolidated notes from our Q3 launch retro session yesterday...',
    body: '<p>Hi team,</p><p>Sharing the consolidated notes from our Q3 launch retro session yesterday. Key takeaways:</p><ul><li>Onboarding completion rate jumped 18%</li><li>Server response P95 stayed under 200ms throughout launch week</li><li>3 areas to improve: documentation depth, support response time, mobile UX</li></ul><p>Full deck attached. Let me know if you want to dig into any section together.</p><p>Thanks,<br/>Sarah</p>',
    receivedAt: ago(0.2),
    read: false,
    starred: true,
    folder: 'inbox',
    labels: ['Work', 'Important'],
    hasAttachment: true
  },
  {
    id: 'e2',
    from: { name: 'GitHub', email: 'noreply@github.com', fallback: 'GH' },
    subject: '[mocci-admin-template] Pull request #142 approved',
    preview: 'Cameron Williamson approved your changes on "datatable component refactor"',
    body: '<p>Cameron Williamson approved your pull request <strong>#142: datatable component refactor</strong>.</p><p>The branch is ready to merge. 4 reviewers have approved.</p><p>View the pull request to merge or continue discussion.</p>',
    receivedAt: ago(2),
    read: false,
    starred: false,
    folder: 'inbox',
    labels: ['Work']
  },
  {
    id: 'e3',
    from: { name: 'Stripe', email: 'billing@stripe.com', fallback: 'ST' },
    subject: 'Your invoice is available',
    preview: 'Invoice #INV-2025-0421 for $1,876.00 is now available in your dashboard.',
    body: '<p>Invoice <strong>#INV-2025-0421</strong> for <strong>$1,876.00</strong> is now available in your dashboard.</p><p>Payment was processed automatically using your card ending in 4242. No action is required.</p>',
    receivedAt: ago(5),
    read: true,
    starred: false,
    folder: 'inbox',
    labels: ['Billing']
  },
  {
    id: 'e4',
    from: { name: 'Emma Chen', email: 'emma@design.co', avatar: avatar(2), fallback: 'EC' },
    subject: 'Design review tomorrow at 2pm',
    preview: 'Hi! Just a reminder about our design review tomorrow at 2pm. I will share my screen first...',
    body: '<p>Hi!</p><p>Just a reminder about our design review tomorrow at 2pm. I will share my screen first to walk through the new onboarding flow, then we can open it up for feedback.</p><p>Looking forward to it.</p><p>Emma</p>',
    receivedAt: ago(8),
    read: true,
    starred: true,
    folder: 'inbox',
    labels: ['Personal']
  },
  {
    id: 'e5',
    from: { name: 'Linear', email: 'notify@linear.app', fallback: 'LN' },
    subject: '5 new issues assigned to you',
    preview: 'You have 5 new issues this week across 3 projects. Top priority: ENG-421...',
    body: '<p>You have <strong>5 new issues</strong> this week across 3 projects.</p><p>Top priority items:</p><ul><li>ENG-421: Fix calendar timezone bug</li><li>ENG-418: Implement search debounce</li><li>DES-204: Update empty state illustrations</li></ul>',
    receivedAt: ago(12),
    read: true,
    starred: false,
    folder: 'inbox',
    labels: ['Work']
  },
  {
    id: 'e6',
    from: { name: 'Marcus Johnson', email: 'marcus@startup.io', avatar: avatar(3), fallback: 'MJ' },
    subject: 'Welcome to the team!',
    preview: 'Hey, welcome aboard! Looking forward to working with you on the upcoming projects...',
    body: '<p>Hey,</p><p>Welcome aboard! Looking forward to working with you on the upcoming projects. I will set up a 1:1 next week to walk through our process and answer any questions you have.</p><p>In the meantime, feel free to dive into the docs on the wiki.</p><p>Marcus</p>',
    receivedAt: ago(24),
    read: true,
    starred: false,
    folder: 'inbox',
    labels: ['Personal']
  },
  {
    id: 'e7',
    from: { name: 'AWS Notifications', email: 'no-reply@aws.com', fallback: 'AW' },
    subject: 'Scheduled maintenance for RDS',
    preview: 'Scheduled maintenance for your RDS instance is planned for Friday 2:00 AM UTC...',
    body: '<p>Scheduled maintenance for your RDS instance <code>prod-db-1</code> is planned for Friday 2:00 AM UTC.</p><p>Expected downtime: 5-10 minutes during patching window.</p>',
    receivedAt: ago(36),
    read: true,
    starred: false,
    folder: 'inbox',
    labels: ['Work']
  },
  {
    id: 'e8',
    from: { name: 'Olivia Park', email: 'olivia@example.com', avatar: avatar(4), fallback: 'OP' },
    subject: 'Coffee next week?',
    preview: 'Hey, would love to catch up over coffee next week if you have time...',
    body: '<p>Hey,</p><p>Would love to catch up over coffee next week if you have time. I am free Tuesday or Thursday afternoon.</p><p>Let me know what works.</p><p>Olivia</p>',
    receivedAt: ago(48),
    read: false,
    starred: false,
    folder: 'inbox',
    labels: ['Personal']
  }
]
