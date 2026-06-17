'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CalendarIcon, MessageCircleIcon, PaperclipIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { type Task, priorityStyles } from './data'

type TaskCardProps = {
  task: Task
  onClick?: () => void
  isOverlay?: boolean
}

export function TaskCard({ task, onClick, isOverlay }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        {...listeners}
        onClick={onClick}
        className={cn(
          'gap-2 py-3 transition-shadow hover:shadow-sm',
          isDragging && 'opacity-30',
          isOverlay && 'rotate-2 shadow-lg'
        )}
      >
        <CardContent className='space-y-2 px-3'>
          <div className='flex flex-wrap items-center gap-1'>
            {task.tags.map((tag) => (
              <Badge key={tag} variant='secondary' className='h-5 rounded-sm px-1.5 text-[10px] font-normal'>
                {tag}
              </Badge>
            ))}
            <Badge
              className={cn(
                'ml-auto h-5 rounded-sm px-1.5 text-[10px] capitalize',
                priorityStyles[task.priority]
              )}
            >
              {task.priority}
            </Badge>
          </div>

          <p className='text-sm font-medium'>{task.title}</p>
          {task.description ? <p className='text-muted-foreground line-clamp-2 text-xs'>{task.description}</p> : null}

          <div className='flex items-center justify-between pt-1'>
            <div className='text-muted-foreground flex items-center gap-3 text-xs'>
              {task.dueDate ? (
                <span className='flex items-center gap-1'>
                  <CalendarIcon className='size-3' /> {task.dueDate.split(',')[0]}
                </span>
              ) : null}
              <span className='flex items-center gap-1'>
                <MessageCircleIcon className='size-3' /> {task.comments}
              </span>
              <span className='flex items-center gap-1'>
                <PaperclipIcon className='size-3' /> {task.attachments}
              </span>
            </div>
            <div className='flex -space-x-1.5'>
              {task.assignees.map((person) => (
                <Avatar key={person.fallback} className='border-card size-6 border-2'>
                  <AvatarImage src={person.avatar} alt={person.name} />
                  <AvatarFallback className='text-[10px]'>{person.fallback}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
