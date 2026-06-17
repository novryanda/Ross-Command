'use client'

import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { type Column, type Task } from './data'
import { TaskCard } from './task-card'

type ColumnContainerProps = {
  column: Column
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onAddTask: () => void
}

export function ColumnContainer({ column, tasks, onTaskClick, onAddTask }: ColumnContainerProps) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: 'column', column }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition
  }

  const taskIds = tasks.map((t) => t.id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('flex flex-col gap-3', isDragging && 'opacity-50')}
    >
      <div className='flex items-center justify-between px-1'>
        <div className='flex items-center gap-2'>
          <span className={cn('size-2 rounded-full', column.color)} aria-hidden />
          <h2 className='text-sm font-semibold'>{column.title}</h2>
          <span className='text-muted-foreground text-xs'>{tasks.length}</span>
        </div>
        <Button variant='ghost' size='icon' className='size-6' aria-label='Add task' onClick={onAddTask}>
          <PlusIcon className='size-3.5' />
        </Button>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className='bg-muted/30 flex min-h-32 flex-col gap-2 rounded-lg p-2'>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
          {tasks.length === 0 ? (
            <p className='text-muted-foreground py-6 text-center text-xs'>Drop tasks here</p>
          ) : null}
        </div>
      </SortableContext>

      <Button variant='ghost' size='sm' className='text-muted-foreground w-full justify-start text-xs' onClick={onAddTask}>
        <PlusIcon className='size-3.5' /> Add task
      </Button>
    </div>
  )
}
