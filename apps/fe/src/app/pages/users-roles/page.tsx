'use client'

import { useMemo, useState } from 'react'
import { PlusIcon, ShieldCheckIcon, UsersIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/showcase'
import { cn } from '@/lib/utils'

import { MembersTable } from './members-table'
import { RoleDialog } from './role-dialog'
import { members as initialMembers, roles as initialRoles, type Role } from './data'

const statusVariant: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  invited: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  suspended: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
}

export default function UsersRolesPage() {
  const [roles, setRoles] = useState<Role[]>(initialRoles)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const totalMembers = initialMembers.length
  const roleName = useMemo(() => {
    const map = new Map<string, Role>()
    roles.forEach((r) => map.set(r.id, r))
    return map
  }, [roles])

  const openCreate = () => {
    setEditingRole(null)
    setDialogOpen(true)
  }

  const openEdit = (role: Role) => {
    setEditingRole(role)
    setDialogOpen(true)
  }

  const saveRole = (role: Role) => {
    setRoles((current) => {
      const exists = current.some((r) => r.id === role.id)
      return exists ? current.map((r) => (r.id === role.id ? role : r)) : [...current, role]
    })
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <PageHeader title='Users & Roles' description='Manage team members and what they can access.' />
      </div>

      <div className='grid gap-4 sm:grid-cols-3'>
        <Card>
          <CardContent className='flex items-center gap-3'>
            <div className='bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg'>
              <UsersIcon className='size-4' />
            </div>
            <div>
              <p className='text-xl font-semibold leading-none'>{totalMembers}</p>
              <p className='text-muted-foreground text-xs'>Total members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='flex items-center gap-3'>
            <div className='bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg'>
              <ShieldCheckIcon className='size-4' />
            </div>
            <div>
              <p className='text-xl font-semibold leading-none'>{roles.length}</p>
              <p className='text-muted-foreground text-xs'>Roles defined</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='flex items-center gap-3'>
            <div className='bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg'>
              <UsersIcon className='size-4' />
            </div>
            <div>
              <p className='text-xl font-semibold leading-none'>
                {initialMembers.filter((m) => m.status === 'invited').length}
              </p>
              <p className='text-muted-foreground text-xs'>Pending invites</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='members' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='members'>Members</TabsTrigger>
          <TabsTrigger value='roles'>Roles</TabsTrigger>
        </TabsList>

        <TabsContent value='members'>
          <MembersTable
            members={initialMembers}
            roleName={roleName}
            statusVariant={statusVariant}
          />
        </TabsContent>

        <TabsContent value='roles' className='space-y-4'>
          <div className='flex justify-end'>
            <Button size='sm' className='h-8' onClick={openCreate}>
              <PlusIcon className='size-3.5' /> New role
            </Button>
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            {roles.map((role) => (
              <Card key={role.id} className='gap-3'>
                <CardHeader>
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <span className={cn('size-2.5 rounded-full', role.color)} aria-hidden />
                      <CardTitle className='text-base'>{role.name}</CardTitle>
                      {role.isSystem ? (
                        <Badge variant='secondary' className='h-5 rounded-sm px-1.5 text-[10px]'>
                          System
                        </Badge>
                      ) : null}
                    </div>
                    <Badge variant='outline' className='h-5 rounded-sm px-1.5 text-[10px]'>
                      {role.memberCount} members
                    </Badge>
                  </div>
                  <CardDescription className='text-xs'>{role.description}</CardDescription>
                </CardHeader>
                <CardContent className='flex items-center justify-between gap-2'>
                  <span className='text-muted-foreground text-xs'>
                    {role.permissions.length} permissions
                  </span>
                  <Button variant='outline' size='sm' className='h-7' onClick={() => openEdit(role)}>
                    {role.isSystem ? 'View' : 'Edit'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <RoleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        role={editingRole}
        onSave={saveRole}
      />
    </div>
  )
}
