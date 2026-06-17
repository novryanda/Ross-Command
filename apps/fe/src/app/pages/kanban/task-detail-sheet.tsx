'use client'

import { useEffect, useState } from 'react'

import {
  CalendarIcon,
  MessageCircleIcon,
  PaperclipIcon,
  TrashIcon,
  UserPlusIcon,
  XIcon
} from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { RichTextEditor } from '@/components/rich-text-editor'
import { cn } from '@/lib/utils'

import { type Column, type Priority, type Task, priorityStyles } from './data'

type TaskDetailSheetProps = {
  task: Task | null
  columns: Column[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: Task) => void
  onDelete: (taskId: string) => void
}

export function TaskDetailSheet({
  task,
  columns,
  open,
  onOpenChange,
  onSave,
  onDelete
}: TaskDetailSheetProps) {
  const [draft, setDraft] = useState<Task | null>(task)
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    setDraft(task)
    setTagInput('')
  }, [task])

  if (!task || !draft) return null

  const handleSave = () => {
    onSave(draft)
    onOpenChange(false)
    toast.success('Task updated', { description: draft.title })
  }

  const handleDelete = () => {
    onDelete(draft.id)
    onOpenChange(false)
    toast.success('Task deleted')
  }

  const addTag = () => {
    const value = tagInput.trim()
    if (!value || draft.tags.includes(value)) return
    setDraft({ ...draft, tags: [...draft.tags, value] })
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setDraft({ ...draft, tags: draft.tags.filter((t) => t !== tag) })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex w-full flex-col gap-0 p-0 sm:max-w-lg'>
        <SheetHeader className='border-b p-5 pb-4'>
          <p className='text-muted-foreground text-[10px] font-medium uppercase tracking-wider'>
            Task · {draft.id}
          </p>
          <SheetTitle className='sr-only'>{draft.title || 'Untitled task'}</SheetTitle>
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder='Untitled task'
            className='hover:bg-muted/50 focus:bg-muted/50 -mx-1 w-[calc(100%-2rem)] rounded-md bg-transparent px-1 py-0.5 text-lg font-semibold leading-tight tracking-tight outline-none transition-colors placeholder:text-muted-foreground/60 focus:outline-none'
          />

          <div className='mt-3 flex flex-wrap items-center gap-2'>
            <Select
              value={draft.columnId}
              onValueChange={(value) => setDraft({ ...draft, columnId: value })}
            >
              <SelectTrigger size='sm' className='h-7 w-auto gap-1.5 text-xs'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {columns.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    <span className={cn('mr-1.5 inline-block size-1.5 rounded-full', col.color)} aria-hidden />
                    {col.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={draft.priority}
              onValueChange={(value) => setDraft({ ...draft, priority: value as Priority })}
            >
              <SelectTrigger
                size='sm'
                className={cn('h-7 w-auto gap-1.5 text-xs capitalize', priorityStyles[draft.priority])}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='low'>Low</SelectItem>
                <SelectItem value='medium'>Medium</SelectItem>
                <SelectItem value='high'>High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SheetHeader>

        <div className='flex-1 space-y-5 overflow-y-auto p-5'>
          <Field label='Description'>
            <RichTextEditor
              value={draft.description ?? ''}
              onChange={(html) => setDraft({ ...draft, description: html })}
              placeholder='Add a more detailed description...'
              minHeight='120px'
            />
          </Field>

          <div className='grid grid-cols-2 gap-4'>
            <Field label='Due date'>
              <div className='relative'>
                <CalendarIcon className='text-muted-foreground absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2' />
                <Input
                  type='date'
                  value={draft.dueDate ?? ''}
                  onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                  className='h-8 pl-8 text-sm'
                />
              </div>
            </Field>
            <Field label='Activity'>
              <div className='text-muted-foreground bg-muted/50 flex h-8 items-center gap-3 rounded-md px-2.5 text-xs'>
                <span className='flex items-center gap-1'>
                  <MessageCircleIcon className='size-3' /> {draft.comments} comments
                </span>
                <span className='flex items-center gap-1'>
                  <PaperclipIcon className='size-3' /> {draft.attachments}
                </span>
              </div>
            </Field>
          </div>

          <Field label='Tags'>
            <div className='space-y-2'>
              {draft.tags.length > 0 ? (
                <div className='flex flex-wrap gap-1'>
                  {draft.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant='secondary'
                      className='h-6 gap-1 rounded-md px-2 text-xs font-normal'
                    >
                      {tag}
                      <button
                        type='button'
                        onClick={() => removeTag(tag)}
                        className='hover:text-destructive -mr-0.5'
                        aria-label={`Remove ${tag}`}
                      >
                        <XIcon className='size-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : null}
              <div className='flex gap-2'>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder='Type and press Enter to add tag'
                  className='h-8 text-sm'
                />
                <Button type='button' variant='outline' size='sm' className='h-8' onClick={addTag}>
                  Add
                </Button>
              </div>
            </div>
          </Field>

          <Field label='Assignees'>
            <div className='space-y-1'>
              {draft.assignees.map((person) => (
                <div
                  key={person.fallback}
                  className='hover:bg-accent/50 group flex items-center gap-2 rounded-md p-1.5 transition-colors'
                >
                  <Avatar className='size-7'>
                    <AvatarImage src={person.avatar} alt={person.name} />
                    <AvatarFallback className='text-xs'>{person.fallback}</AvatarFallback>
                  </Avatar>
                  <span className='flex-1 text-sm'>{person.name}</span>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='size-6 opacity-0 group-hover:opacity-100'
                    onClick={() =>
                      setDraft({
                        ...draft,
                        assignees: draft.assignees.filter((a) => a.fallback !== person.fallback)
                      })
                    }
                    aria-label={`Remove ${person.name}`}
                  >
                    <XIcon className='size-3' />
                  </Button>
                </div>
              ))}
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='text-muted-foreground h-8 w-full justify-start text-xs'
                onClick={() => toast.info('Assignee picker', { description: 'Connect this to your team API' })}
              >
                <UserPlusIcon className='size-3.5' /> Add assignee
              </Button>
            </div>
          </Field>
        </div>

        <SheetFooter className='flex-row items-center justify-between gap-2 border-t p-3'>
          <Button variant='ghost' size='sm' className='text-destructive hover:text-destructive gap-1.5' onClick={handleDelete}>
            <TrashIcon className='size-3.5' /> Delete
          </Button>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size='sm' onClick={handleSave}>
              Save changes
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-muted-foreground text-[10px] font-medium uppercase tracking-wider'>
        {label}
      </Label>
      {children}
    </div>
  )
}
