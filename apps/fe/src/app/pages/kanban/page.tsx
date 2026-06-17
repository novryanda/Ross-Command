'use client'

import { useMemo, useState } from 'react'

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/showcase'

import { ColumnContainer } from './column'
import { type Task, initialColumns, initialTasks } from './data'
import { TaskCard } from './task-card'
import { TaskDetailSheet } from './task-detail-sheet'

export default function KanbanPage() {
  const [columns] = useState(initialColumns)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    })
  )

  const columnIds = useMemo(() => columns.map((c) => c.id), [columns])

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'task') {
      setActiveTask(event.active.data.current.task as Task)
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return

    setTasks((current) => {
      const activeIndex = current.findIndex((t) => t.id === activeId)
      if (activeIndex === -1) return current

      const overColumn = columns.find((c) => c.id === overId)
      if (overColumn) {
        const updated = [...current]
        updated[activeIndex] = { ...updated[activeIndex], columnId: overColumn.id }
        return updated
      }

      const overIndex = current.findIndex((t) => t.id === overId)
      if (overIndex === -1) return current

      const updated = [...current]
      if (updated[activeIndex].columnId !== updated[overIndex].columnId) {
        updated[activeIndex] = { ...updated[activeIndex], columnId: updated[overIndex].columnId }
      }
      return arrayMove(updated, activeIndex, overIndex)
    })
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setDetailOpen(true)
  }

  const handleSaveTask = (updated: Task) => {
    setTasks((current) => current.map((t) => (t.id === updated.id ? updated : t)))
  }

  const handleDeleteTask = (id: string) => {
    setTasks((current) => current.filter((t) => t.id !== id))
  }

  const handleAddTask = (columnId: string) => {
    const newTask: Task = {
      id: `t-${Date.now()}`,
      columnId,
      title: 'New task',
      description: '',
      priority: 'medium',
      tags: [],
      comments: 0,
      attachments: 0,
      assignees: []
    }
    setTasks((current) => [...current, newTask])
    setSelectedTask(newTask)
    setDetailOpen(true)
    toast.success('Task created', { description: 'Click to edit details' })
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <PageHeader title='Kanban Board' description='Drag tasks across columns. Click any card for details.' />
        <Button size='sm' className='h-8' onClick={() => handleAddTask(columns[0].id)}>
          <PlusIcon className='size-3.5' /> Add task
        </Button>
      </div>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <SortableContext items={columnIds}>
            {columns.map((column) => (
              <ColumnContainer
                key={column.id}
                column={column}
                tasks={tasks.filter((t) => t.columnId === column.id)}
                onTaskClick={handleTaskClick}
                onAddTask={() => handleAddTask(column.id)}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>{activeTask ? <TaskCard task={activeTask} isOverlay /> : null}</DragOverlay>
      </DndContext>

      <TaskDetailSheet
        task={selectedTask}
        columns={columns}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  )
}
