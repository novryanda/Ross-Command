'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Integration = {
  id: string
  name: string
  description: string
  category: string
  initials: string
  color: string
  connected: boolean
}

const initialIntegrations: Integration[] = [
  { id: 'slack', name: 'Slack', description: 'Send notifications to your channels.', category: 'Communication', initials: 'SL', color: 'bg-violet-500', connected: true },
  { id: 'github', name: 'GitHub', description: 'Sync issues and pull requests.', category: 'Development', initials: 'GH', color: 'bg-slate-700', connected: true },
  { id: 'stripe', name: 'Stripe', description: 'Process payments and subscriptions.', category: 'Payments', initials: 'ST', color: 'bg-indigo-500', connected: false },
  { id: 'figma', name: 'Figma', description: 'Embed designs and prototypes.', category: 'Design', initials: 'FG', color: 'bg-rose-500', connected: false },
  { id: 'gdrive', name: 'Google Drive', description: 'Attach and sync files.', category: 'Storage', initials: 'GD', color: 'bg-emerald-500', connected: true },
  { id: 'notion', name: 'Notion', description: 'Link docs and databases.', category: 'Productivity', initials: 'NO', color: 'bg-neutral-800', connected: false }
]

export function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations)

  const toggle = (id: string) => {
    setIntegrations((current) =>
      current.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i))
    )
    const target = integrations.find((i) => i.id === id)
    if (target) {
      toast.success(target.connected ? `${target.name} disconnected` : `${target.name} connected`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>Connect third-party services to extend your workspace.</CardDescription>
      </CardHeader>
      <CardContent className='grid gap-3 sm:grid-cols-2'>
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className='flex items-start justify-between gap-3 rounded-lg border p-3'
          >
            <div className='flex min-w-0 items-start gap-3'>
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white ${integration.color}`}
              >
                {integration.initials}
              </div>
              <div className='min-w-0 space-y-1'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>{integration.name}</span>
                  {integration.connected ? (
                    <Badge className='h-4 rounded-sm bg-emerald-500/10 px-1 text-[10px] font-normal text-emerald-600 dark:text-emerald-400'>
                      Connected
                    </Badge>
                  ) : null}
                </div>
                <p className='text-muted-foreground text-xs'>{integration.description}</p>
                <p className='text-muted-foreground/70 text-[10px] uppercase tracking-wider'>
                  {integration.category}
                </p>
              </div>
            </div>
            <Button
              variant={integration.connected ? 'outline' : 'default'}
              size='sm'
              className='h-7 shrink-0'
              onClick={() => toggle(integration.id)}
            >
              {integration.connected ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
