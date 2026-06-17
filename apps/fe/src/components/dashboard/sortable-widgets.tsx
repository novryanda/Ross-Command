'use client'

import { type ReactNode, useCallback, useSyncExternalStore } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVerticalIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export type DashboardWidget = { id: string; content: ReactNode }

const ORDER_EVENT = 'mocci:dashboard-order'

// Module-level cache so getSnapshot returns a stable reference (required by
// useSyncExternalStore to avoid infinite re-renders).
const orderCache = new Map<string, string[]>()

function sameOrder(a: string[], b: string[]) {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

function readOrder(storageKey: string, defaultOrder: string[]): string[] {
  if (typeof window === 'undefined') return defaultOrder
  let next = defaultOrder
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const saved = JSON.parse(raw) as string[]
      const valid = saved.filter((id) => defaultOrder.includes(id))
      const missing = defaultOrder.filter((id) => !valid.includes(id))
      next = [...valid, ...missing]
    }
  } catch {
    next = defaultOrder
  }
  const cached = orderCache.get(storageKey)
  if (cached && sameOrder(cached, next)) return cached
  orderCache.set(storageKey, next)
  return next
}

function subscribe(callback: () => void) {
  window.addEventListener(ORDER_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(ORDER_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

// Hydration-safe mounted flag. dnd-kit assigns internal aria ids that differ
// between server and client, so we render a static list until after hydration.
function subscribeMounted() {
  return () => {}
}
function getMountedClient() {
  return true
}
function getMountedServer() {
  return false
}

function SortableItem({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined
  }
  return (
    <div ref={setNodeRef} style={style} className={cn('group/widget relative', isDragging && 'opacity-80')}>
      <button
        type='button'
        aria-label='Drag to reorder'
        className='text-muted-foreground bg-background/80 hover:bg-accent hover:text-foreground absolute top-2 right-2 z-10 hidden size-7 cursor-grab items-center justify-center rounded-md border opacity-60 backdrop-blur transition-opacity group-hover/widget:opacity-100 active:cursor-grabbing sm:flex'
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className='size-4' />
      </button>
      {children}
    </div>
  )
}

export function SortableWidgets({
  widgets,
  storageKey
}: {
  widgets: DashboardWidget[]
  storageKey: string
}) {
  const defaultOrder = widgets.map((w) => w.id)

  const order = useSyncExternalStore(
    subscribe,
    useCallback(() => readOrder(storageKey, defaultOrder), [storageKey, defaultOrder]),
    useCallback(() => defaultOrder, [defaultOrder])
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = order.indexOf(active.id as string)
    const newIndex = order.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return
    const next = arrayMove(order, oldIndex, newIndex)
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
      orderCache.set(storageKey, next)
      window.dispatchEvent(new Event(ORDER_EVENT))
    } catch {
      // ignore persistence errors
    }
  }

  const byId = new Map(widgets.map((w) => [w.id, w.content]))

  const mounted = useSyncExternalStore(subscribeMounted, getMountedClient, getMountedServer)

  if (!mounted) {
    return (
      <div className='space-y-4'>
        {order.map((id) => (
          <div key={id} className='group/widget relative'>
            {byId.get(id)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <div className='space-y-4'>
          {order.map((id) => (
            <SortableItem key={id} id={id}>
              {byId.get(id)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
