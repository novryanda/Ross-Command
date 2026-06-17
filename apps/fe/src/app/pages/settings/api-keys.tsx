'use client'

import { useState } from 'react'
import { CopyIcon, EyeIcon, EyeOffIcon, KeyRoundIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ApiKey = {
  id: string
  name: string
  token: string
  createdAt: string
  lastUsed: string
}

const initialKeys: ApiKey[] = [
  { id: 'k1', name: 'Production', token: 'sk_live_a1b2c3d4e5f6g7h8i9j0', createdAt: 'Jan 12, 2024', lastUsed: '2 hours ago' },
  { id: 'k2', name: 'Staging', token: 'sk_test_z9y8x7w6v5u4t3s2r1q0', createdAt: 'Feb 03, 2024', lastUsed: '5 days ago' },
  { id: 'k3', name: 'CI / CD pipeline', token: 'sk_test_m1n2b3v4c5x6z7a8s9d0', createdAt: 'Mar 21, 2024', lastUsed: 'Never' }
]

function maskToken(token: string) {
  const prefix = token.slice(0, 7)
  return `${prefix}${'•'.repeat(18)}`
}

export function ApiKeysSettings() {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')

  const toggleReveal = (id: string) => {
    setRevealed((current) => ({ ...current, [id]: !current[id] }))
  }

  const copy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token)
      toast.success('Copied to clipboard')
    } catch {
      toast.error('Could not copy')
    }
  }

  const revoke = (id: string) => {
    setKeys((current) => current.filter((k) => k.id !== id))
    toast.success('API key revoked')
  }

  const createKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Key name required')
      return
    }
    const token = `sk_test_${Math.random().toString(36).slice(2, 22)}`
    setKeys((current) => [
      { id: `k-${Date.now()}`, name: newKeyName.trim(), token, createdAt: 'Just now', lastUsed: 'Never' },
      ...current
    ])
    setNewKeyName('')
    setDialogOpen(false)
    toast.success('API key created', { description: 'Copy it now — you won\'t see it again.' })
  }

  return (
    <Card>
      <CardHeader className='flex-row items-start justify-between gap-2 space-y-0'>
        <div className='space-y-1.5'>
          <CardTitle>API keys</CardTitle>
          <CardDescription>Keys let external services authenticate with your account.</CardDescription>
        </div>
        <Button size='sm' className='h-8' onClick={() => setDialogOpen(true)}>
          <PlusIcon className='size-3.5' /> Create key
        </Button>
      </CardHeader>
      <CardContent className='space-y-2'>
        {keys.length === 0 ? (
          <div className='text-muted-foreground flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center text-sm'>
            <KeyRoundIcon className='size-6 opacity-40' />
            <p>No API keys yet. Create one to get started.</p>
          </div>
        ) : (
          keys.map((key) => (
            <div
              key={key.id}
              className='flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3'
            >
              <div className='min-w-0 space-y-1'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>{key.name}</span>
                  <span className='text-muted-foreground text-xs'>Created {key.createdAt}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <code className='bg-muted rounded px-1.5 py-0.5 font-mono text-xs'>
                    {revealed[key.id] ? key.token : maskToken(key.token)}
                  </code>
                  <span className='text-muted-foreground text-[11px]'>Last used {key.lastUsed}</span>
                </div>
              </div>
              <div className='flex items-center gap-1'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-7'
                  onClick={() => toggleReveal(key.id)}
                  aria-label={revealed[key.id] ? 'Hide key' : 'Reveal key'}
                >
                  {revealed[key.id] ? <EyeOffIcon className='size-3.5' /> : <EyeIcon className='size-3.5' />}
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-7'
                  onClick={() => copy(key.token)}
                  aria-label='Copy key'
                >
                  <CopyIcon className='size-3.5' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-7 text-rose-500 hover:text-rose-600'
                  onClick={() => revoke(key.id)}
                  aria-label='Revoke key'
                >
                  <Trash2Icon className='size-3.5' />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription className='text-xs'>
              Give your key a descriptive name so you can recognize it later.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-1.5'>
            <Label htmlFor='key-name' className='text-xs'>
              Key name
            </Label>
            <Input
              id='key-name'
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createKey()}
              placeholder='e.g. Production server'
              className='h-8 text-sm'
            />
          </div>
          <DialogFooter>
            <Button variant='outline' size='sm' onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button size='sm' onClick={createKey}>
              Create key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
