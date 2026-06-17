import { avatarSrc } from '@/lib/assets'

export type Priority = 'low' | 'medium' | 'high'

export type Assignee = {
  name: string
  avatar: string
  fallback: string
}

export type Task = {
  id: string
  columnId: string
  title: string
  description?: string
  priority: Priority
  tags: string[]
  comments: number
  attachments: number
  assignees: Assignee[]
  dueDate?: string
}

export type Column = {
  id: string
  title: string
  color: string
}

export const priorityStyles: Record<Priority, string> = {
  low: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  high: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
}

const avatar = (n: number, fallback: string): Assignee => ({
  name: fallback,
  fallback,
  avatar: avatarSrc(n)
})

export const initialColumns: Column[] = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-500' },
  { id: 'progress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'review', title: 'In Review', color: 'bg-violet-500' },
  { id: 'done', title: 'Done', color: 'bg-emerald-500' }
]

export const initialTasks: Task[] = [
  {
    id: 't1',
    columnId: 'todo',
    title: 'Design new onboarding flow',
    description: 'Update the welcome screens with new branding and improve the first-time user experience.',
    priority: 'high',
    tags: ['Design', 'Onboarding'],
    comments: 4,
    attachments: 2,
    assignees: [avatar(1, 'JD'), avatar(2, 'SM')],
    dueDate: 'May 30, 2025'
  },
  {
    id: 't2',
    columnId: 'todo',
    title: 'Research competitor pricing',
    description: 'Compare pricing tiers from top 5 competitors and prepare a recommendation deck.',
    priority: 'low',
    tags: ['Research'],
    comments: 1,
    attachments: 0,
    assignees: [avatar(3, 'AL')],
    dueDate: 'Jun 5, 2025'
  },
  {
    id: 't3',
    columnId: 'progress',
    title: 'Implement OAuth integration',
    description: 'Add Google and GitHub sign-in providers with proper error handling and token refresh.',
    priority: 'high',
    tags: ['Backend', 'Auth'],
    comments: 8,
    attachments: 1,
    assignees: [avatar(4, 'MK'), avatar(5, 'RP'), avatar(6, 'CW')],
    dueDate: 'May 28, 2025'
  },
  {
    id: 't4',
    columnId: 'progress',
    title: 'Refactor data table component',
    description: 'Extract data table logic into a reusable component with full type safety.',
    priority: 'medium',
    tags: ['Frontend'],
    comments: 3,
    attachments: 0,
    assignees: [avatar(7, 'EB')]
  },
  {
    id: 't5',
    columnId: 'review',
    title: 'Update billing API endpoints',
    description: 'Migrate to the new Stripe API version and update webhook handlers.',
    priority: 'medium',
    tags: ['Backend', 'Billing'],
    comments: 2,
    attachments: 4,
    assignees: [avatar(8, 'TH')],
    dueDate: 'May 26, 2025'
  },
  {
    id: 't6',
    columnId: 'done',
    title: 'Setup CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment.',
    priority: 'low',
    tags: ['DevOps'],
    comments: 5,
    attachments: 0,
    assignees: [avatar(9, 'NL'), avatar(10, 'OS')]
  },
  {
    id: 't7',
    columnId: 'done',
    title: 'Write project documentation',
    priority: 'low',
    tags: ['Docs'],
    comments: 2,
    attachments: 1,
    assignees: [avatar(11, 'RM')]
  }
]
