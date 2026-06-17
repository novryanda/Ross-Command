'use client'

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'

import { type Contact, type ContactValues, contactSchema } from './data'

type ContactFormSheetProps = {
  contact: Contact | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (values: ContactValues, id?: string) => void
}

export function ContactFormSheet({ contact, open, onOpenChange, onSave }: ContactFormSheetProps) {
  const [submitting, setSubmitting] = useState(false)
  const isEdit = !!contact

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      role: 'lead',
      status: 'active',
      notes: ''
    }
  })

  useEffect(() => {
    if (open) {
      form.reset(
        contact
          ? {
              name: contact.name,
              email: contact.email,
              phone: contact.phone,
              company: contact.company,
              role: contact.role,
              status: contact.status,
              notes: contact.notes ?? ''
            }
          : {
              name: '',
              email: '',
              phone: '',
              company: '',
              role: 'lead',
              status: 'active',
              notes: ''
            }
      )
    }
  }, [contact, open, form])

  const onSubmit = async (values: ContactValues) => {
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSubmitting(false)
    onSave(values, contact?.id)
    onOpenChange(false)
    toast.success(isEdit ? 'Contact updated' : 'Contact created', { description: values.name })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex w-full flex-col gap-0 p-0 sm:max-w-md'>
        <SheetHeader className='border-b p-5'>
          <SheetTitle>{isEdit ? 'Edit contact' : 'Add new contact'}</SheetTitle>
          <SheetDescription className='text-xs'>
            {isEdit ? 'Update the details below.' : 'Fill in the details to create a new contact.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-1 flex-col overflow-hidden'>
            <div className='flex-1 space-y-4 overflow-y-auto p-5'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder='Jane Doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type='email' placeholder='jane@example.com' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder='+1 555 0123' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='company'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder='Acme Inc.' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='role'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='lead'>Lead</SelectItem>
                          <SelectItem value='customer'>Customer</SelectItem>
                          <SelectItem value='partner'>Partner</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='active'>Active</SelectItem>
                          <SelectItem value='pending'>Pending</SelectItem>
                          <SelectItem value='archived'>Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder='Optional notes about this contact' {...field} />
                    </FormControl>
                    <FormDescription>{field.value?.length ?? 0} / 500 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className='border-t p-3'>
              <Button type='button' variant='outline' size='sm' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type='submit' size='sm' disabled={submitting}>
                {submitting ? <Loader2Icon className='animate-spin' /> : null}
                {isEdit ? 'Save changes' : 'Create contact'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

type DeleteContactDialogProps = {
  contact: Contact | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (id: string) => void
}

export function DeleteContactDialog({ contact, open, onOpenChange, onConfirm }: DeleteContactDialogProps) {
  const handleDelete = () => {
    if (!contact) return
    onConfirm(contact.id)
    onOpenChange(false)
    toast.success('Contact deleted', { description: contact.name })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete contact?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <span className='font-medium'>{contact?.name}</span>. This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
