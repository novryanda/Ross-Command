export type Invoice = {
  id: string
  date: string
  amount: string
  status: 'paid' | 'pending' | 'failed'
  plan: string
}

export type UsageMetric = {
  label: string
  used: number
  limit: number
  unit: string
}

export const currentPlan = {
  name: 'Pro',
  price: '$29',
  interval: 'month',
  seats: 12,
  seatLimit: 20,
  renewsOn: 'June 28, 2026',
  status: 'active' as const
}

export const paymentMethod = {
  brand: 'Visa',
  last4: '4242',
  expiry: '08 / 28',
  name: 'Fatmuh'
}

export const usageMetrics: UsageMetric[] = [
  { label: 'Team members', used: 12, limit: 20, unit: 'seats' },
  { label: 'Projects', used: 34, limit: 100, unit: 'projects' },
  { label: 'API requests', used: 184_320, limit: 500_000, unit: 'requests' },
  { label: 'Storage', used: 46, limit: 100, unit: 'GB' }
]

export const invoices: Invoice[] = [
  { id: 'INV-2048', date: 'May 28, 2026', amount: '$29.00', status: 'paid', plan: 'Pro (monthly)' },
  { id: 'INV-2031', date: 'Apr 28, 2026', amount: '$29.00', status: 'paid', plan: 'Pro (monthly)' },
  { id: 'INV-2014', date: 'Mar 28, 2026', amount: '$29.00', status: 'paid', plan: 'Pro (monthly)' },
  { id: 'INV-1998', date: 'Feb 28, 2026', amount: '$29.00', status: 'paid', plan: 'Pro (monthly)' },
  { id: 'INV-1982', date: 'Jan 28, 2026', amount: '$29.00', status: 'paid', plan: 'Pro (monthly)' },
  { id: 'INV-1965', date: 'Dec 28, 2025', amount: '$0.00', status: 'paid', plan: 'Starter (free)' }
]
