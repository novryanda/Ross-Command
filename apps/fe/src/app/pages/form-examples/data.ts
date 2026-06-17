import { z } from 'zod'

export type Contact = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  role: 'lead' | 'customer' | 'partner'
  status: 'active' | 'pending' | 'archived'
  notes?: string
  createdAt: string
}

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: z
    .string()
    .min(7, 'Phone must be at least 7 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Use only numbers, spaces, and + - ( )'),
  company: z.string().min(1, 'Company is required'),
  role: z.enum(['lead', 'customer', 'partner']),
  status: z.enum(['active', 'pending', 'archived']),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional()
})

export type ContactValues = z.infer<typeof contactSchema>

export const initialContacts: Contact[] = [
  {
    id: 'c1',
    name: 'Aria Patel',
    email: 'aria@designhub.io',
    phone: '+1 555 0142',
    company: 'Design Hub',
    role: 'customer',
    status: 'active',
    notes: 'Champion within their design team. Ideal for case study.',
    createdAt: '2025-04-12'
  },
  {
    id: 'c2',
    name: 'Marcus Lee',
    email: 'marcus@startup.com',
    phone: '+1 555 0298',
    company: 'Startup Co',
    role: 'lead',
    status: 'pending',
    notes: 'Trial expires next week. Schedule check-in call.',
    createdAt: '2025-04-20'
  },
  {
    id: 'c3',
    name: 'Jennifer Cole',
    email: 'jen@labs.dev',
    phone: '+1 555 0367',
    company: 'Labs Inc.',
    role: 'partner',
    status: 'active',
    createdAt: '2025-03-08'
  },
  {
    id: 'c4',
    name: 'Diego Ramirez',
    email: 'diego@studio.co',
    phone: '+1 555 0411',
    company: 'Studio.co',
    role: 'customer',
    status: 'active',
    createdAt: '2025-02-25'
  },
  {
    id: 'c5',
    name: 'Sara Williams',
    email: 'sara@acme.com',
    phone: '+1 555 0589',
    company: 'Acme Corp',
    role: 'lead',
    status: 'archived',
    notes: 'Lost to competitor. Revisit Q4.',
    createdAt: '2024-11-15'
  }
]

export const roleLabels: Record<Contact['role'], string> = {
  lead: 'Lead',
  customer: 'Customer',
  partner: 'Partner'
}

export const statusLabels: Record<Contact['status'], string> = {
  active: 'Active',
  pending: 'Pending',
  archived: 'Archived'
}

export const statusStyles: Record<Contact['status'], string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  archived: 'bg-muted text-muted-foreground'
}

export const roleStyles: Record<Contact['role'], string> = {
  lead: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  customer: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  partner: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
}
