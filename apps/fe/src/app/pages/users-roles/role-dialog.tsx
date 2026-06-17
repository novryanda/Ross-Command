'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

import {
  allPermissions,
  permissionGroups,
  type Permission,
  type Role
} from './data'

type RoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  onSave: (role: Role) => void
}

const emptyDraft = {
  name: '',
  description: '',
  permissions: [] as Permission[]
}

export function RoleDialog({ open, onOpenChange, role, onSave }: RoleDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [permissions, setPermissions] = useState<Permission[]>([])

  const readOnly = role?.isSystem ?? false

  useEffect(() => {
    if (!open) return
    if (role) {
      setName(role.name)
      setDescription(role.description)
      setPermissions(role.permissions)
    } else {
      setName(emptyDraft.name)
      setDescription(emptyDraft.description)
      setPermissions(emptyDraft.permissions)
    }
  }, [role, open])

  const toggle = (id: Permission) => {
    setPermissions((current) =>
      current.includes(id) ? current.filter((p) => p !== id) : [...current, id]
    )
  }

  const toggleAll = () => {
    setPermissions((current) => (current.length === allPermissions.length ? [] : allPermissions))
  }

  const save = () => {
    if (!name.trim()) {
      toast.error('Role name required')
      return
    }
    const saved: Role = {
      id: role?.id ?? `role-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'No description provided.',
      color: role?.color ?? 'bg-slate-500',
      memberCount: role?.memberCount ?? 0,
      permissions,
      isSystem: role?.isSystem ?? false
    }
    onSave(saved)
    onOpenChange(false)
    toast.success(role ? 'Role updated' : 'Role created', { description: saved.name })
  }

  const title = readOnly ? `${role?.name} permissions` : role ? 'Edit role' : 'New role'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='text-xs'>
            {readOnly
              ? 'System roles cannot be edited, but you can review their permissions.'
              : 'Define what members with this role can access.'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {!readOnly ? (
            <>
              <div className='grid gap-1.5'>
                <Label htmlFor='role-name' className='text-xs'>
                  Name
                </Label>
                <Input
                  id='role-name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='e.g. Support agent'
                  className='h-8 text-sm'
                />
              </div>
              <div className='grid gap-1.5'>
                <Label htmlFor='role-desc' className='text-xs'>
                  Description
                </Label>
                <Textarea
                  id='role-desc'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='What is this role for?'
                  rows={2}
                  className='text-sm'
                />
              </div>
              <Separator />
            </>
          ) : null}

          <div className='flex items-center justify-between'>
            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              Permissions
            </p>
            {!readOnly ? (
              <button
                type='button'
                onClick={toggleAll}
                className='text-primary text-xs hover:underline'
              >
                {permissions.length === allPermissions.length ? 'Clear all' : 'Select all'}
              </button>
            ) : null}
          </div>

          <div className='max-h-72 space-y-4 overflow-y-auto pr-1'>
            {permissionGroups.map((group) => (
              <div key={group.group} className='space-y-2'>
                <p className='text-xs font-medium'>{group.group}</p>
                <div className='space-y-1.5'>
                  {group.permissions.map((perm) => (
                    <label
                      key={perm.id}
                      className='flex items-center gap-2.5 rounded-md px-1 py-0.5 text-sm'
                    >
                      <Checkbox
                        checked={permissions.includes(perm.id)}
                        onCheckedChange={() => !readOnly && toggle(perm.id)}
                        disabled={readOnly}
                      />
                      <span className={readOnly ? 'text-muted-foreground' : ''}>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' size='sm' onClick={() => onOpenChange(false)}>
            {readOnly ? 'Close' : 'Cancel'}
          </Button>
          {!readOnly ? (
            <Button size='sm' onClick={save}>
              {role ? 'Save changes' : 'Create role'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
