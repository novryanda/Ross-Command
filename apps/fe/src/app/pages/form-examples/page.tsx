'use client'

import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  ArrowUpDownIcon,
  CheckIcon,
  CopyIcon,
  EditIcon,
  MailIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  RefreshCwIcon,
  TrashIcon,
  XIcon
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/data-table/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/showcase'
import { cn } from '@/lib/utils'

import { ContactFormSheet, DeleteContactDialog } from './contact-dialogs'
import {
  type Contact,
  type ContactValues,
  initialContacts,
  roleLabels,
  roleStyles,
  statusLabels,
  statusStyles
} from './data'

export default function FormExamplesPage() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState<Contact | null>(null)

  const handleAdd = () => {
    setEditing(null)
    setSheetOpen(true)
  }

  const handleEdit = (contact: Contact) => {
    setEditing(contact)
    setSheetOpen(true)
  }

  const handleSave = (values: ContactValues, id?: string) => {
    if (id) {
      setContacts((cs) => cs.map((c) => (c.id === id ? { ...c, ...values } : c)))
    } else {
      const newContact: Contact = {
        id: `c-${Date.now()}`,
        ...values,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setContacts((cs) => [newContact, ...cs])
    }
  }

  const handleDelete = (id: string) => {
    setContacts((cs) => cs.filter((c) => c.id !== id))
  }

  const columns = useMemo<ColumnDef<Contact, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant='ghost'
            size='sm'
            className='-ml-2 h-7 px-2'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name <ArrowUpDownIcon className='ml-1 size-3' />
          </Button>
        ),
        cell: ({ row }) => <span className='text-sm font-medium'>{row.original.name}</span>
      },
      {
        id: 'contact',
        header: 'Contact',
        cell: ({ row }) => (
          <div className='text-muted-foreground space-y-0.5 text-xs'>
            <p className='flex items-center gap-1'>
              <MailIcon className='size-3' /> {row.original.email}
            </p>
            <p className='flex items-center gap-1'>
              <PhoneIcon className='size-3' /> {row.original.phone}
            </p>
          </div>
        )
      },
      {
        accessorKey: 'company',
        header: 'Company',
        cell: ({ row }) => <span className='text-sm'>{row.original.company}</span>
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <Badge className={cn('h-5 rounded-sm px-1.5 text-[10px]', roleStyles[row.original.role])}>
            {roleLabels[row.original.role]}
          </Badge>
        ),
        filterFn: (row, id, value) => {
          if (!value || value === 'all') return true
          return row.getValue(id) === value
        }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge className={cn('h-5 rounded-sm px-1.5 text-[10px]', statusStyles[row.original.status])}>
            {statusLabels[row.original.status]}
          </Badge>
        ),
        filterFn: (row, id, value) => {
          if (!value || value === 'all') return true
          return row.getValue(id) === value
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const contact = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='size-7' aria-label='Row actions'>
                  <MoreHorizontalIcon className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => handleEdit(contact)}>
                  <EditIcon className='size-3.5' /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(contact.email)
                    toast.success('Email copied', { description: contact.email })
                  }}
                >
                  <CopyIcon className='size-3.5' /> Copy email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant='destructive'
                  onClick={() => {
                    setDeleting(contact)
                    setDeleteOpen(true)
                  }}
                >
                  <TrashIcon className='size-3.5' /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        enableSorting: false,
        enableHiding: false
      }
    ],
    []
  )

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Form Examples'
        description='CRUD patterns with Sheet, Dialog, Toast, inline edit, and more.'
      />

      <Card>
        <CardHeader className='flex-row items-center justify-between'>
          <div>
            <CardTitle className='text-base'>Contacts</CardTitle>
            <CardDescription className='text-xs'>A mini contact manager showcasing real form patterns.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          <DataTable
            columns={columns}
            data={contacts}
            searchPlaceholder='Search name, email, or company...'
            filters={[
              {
                columnId: 'role',
                label: 'Role',
                options: [
                  { value: 'lead', label: 'Lead' },
                  { value: 'customer', label: 'Customer' },
                  { value: 'partner', label: 'Partner' }
                ]
              },
              {
                columnId: 'status',
                label: 'Status',
                options: [
                  { value: 'active', label: 'Active' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'archived', label: 'Archived' }
                ]
              }
            ]}
            toolbarActions={
              <Button size='sm' className='h-8' onClick={handleAdd}>
                <PlusIcon className='size-3.5' /> Add contact
              </Button>
            }
            emptyMessage='No contacts. Click "Add contact" to get started.'
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Inline edit</CardTitle>
          <CardDescription className='text-xs'>
            Click any value to edit, then press Enter to save or Escape to cancel.
          </CardDescription>
        </CardHeader>
        <CardContent className='divide-border divide-y border-y'>
          <InlineEditField label='Display name' defaultValue='Jane Cooper' />
          <InlineEditField label='Job title' defaultValue='Senior Designer' />
          <InlineEditField label='Department' defaultValue='Design' />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Toast samples</CardTitle>
          <CardDescription className='text-xs'>
            Click any button to trigger different notification styles.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-5'>
          <ToastGroup label='Status'>
            <Button
              size='sm'
              variant='outline'
              className='h-8 justify-start'
              onClick={() => toast.success('Changes saved', { description: 'Your profile has been updated.' })}
            >
              <CheckIcon className='size-3.5 text-emerald-600 dark:text-emerald-400' /> Success
            </Button>
            <Button
              size='sm'
              variant='outline'
              className='h-8 justify-start'
              onClick={() => toast.error('Upload failed', { description: 'The file exceeds the 10MB limit.' })}
            >
              <XIcon className='size-3.5 text-rose-600 dark:text-rose-400' /> Error
            </Button>
            <Button
              size='sm'
              variant='outline'
              className='h-8 justify-start'
              onClick={() => toast.info('New version available', { description: 'Refresh to update.' })}
            >
              <span className='bg-blue-500 size-2 rounded-full' aria-hidden /> Info
            </Button>
            <Button
              size='sm'
              variant='outline'
              className='h-8 justify-start'
              onClick={() => toast.warning('Storage almost full', { description: 'You have used 92% of your quota.' })}
            >
              <span className='bg-amber-500 size-2 rounded-full' aria-hidden /> Warning
            </Button>
          </ToastGroup>

          <ToastGroup label='Interactive'>
            <Button
              size='sm'
              variant='outline'
              className='h-8 justify-start'
              onClick={() =>
                toast('Event created', {
                  description: 'Monday, January 3rd at 4:00 PM',
                  action: { label: 'Undo', onClick: () => toast.info('Undo clicked') }
                })
              }
            >
              With action button
            </Button>
            <Button
              size='sm'
              variant='outline'
              className='h-8 justify-start'
              onClick={() => {
                const id = toast.loading('Processing payment...')
                setTimeout(() => {
                  toast.success('Payment complete', { id, description: '$49.00 charged to your card.' })
                }, 2000)
              }}
            >
              <RefreshCwIcon className='size-3.5' /> Loading then success
            </Button>
          </ToastGroup>
        </CardContent>
      </Card>

      <ContactFormSheet
        contact={editing}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={handleSave}
      />
      <DeleteContactDialog
        contact={deleting}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function InlineEditField({ label, defaultValue }: { label: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(defaultValue)

  const save = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) {
      setValue(trimmed)
      toast.success('Updated', { description: `${label} changed to "${trimmed}"` })
    }
    setEditing(false)
  }

  const cancel = () => {
    setDraft(value)
    setEditing(false)
  }

  return (
    <div className='flex items-center justify-between gap-3 py-2.5'>
      <span className='text-muted-foreground text-xs'>{label}</span>
      {editing ? (
        <div className='flex items-center gap-1'>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') cancel()
            }}
            className='h-7 w-56 text-sm'
            autoFocus
          />
          <Button type='button' variant='ghost' size='icon' className='size-7' onClick={save} aria-label='Save'>
            <CheckIcon className='size-3.5' />
          </Button>
          <Button type='button' variant='ghost' size='icon' className='size-7' onClick={cancel} aria-label='Cancel'>
            <XIcon className='size-3.5' />
          </Button>
        </div>
      ) : (
        <button
          type='button'
          onClick={() => {
            setDraft(value)
            setEditing(true)
          }}
          className='hover:bg-accent group flex items-center gap-1.5 rounded-md px-2 py-1 text-right text-sm transition-colors'
        >
          {value}
          <PencilIcon className='text-muted-foreground size-3 opacity-0 group-hover:opacity-100 transition-opacity' />
        </button>
      )}
    </div>
  )
}

function ToastGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='space-y-2'>
      <p className='text-muted-foreground text-[10px] font-medium uppercase tracking-wider'>{label}</p>
      <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>{children}</div>
    </div>
  )
}
