'use client'

import { CheckIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export type WizardStep = {
  id: string
  title: string
  description?: string
}

type StepperProps = {
  steps: WizardStep[]
  currentIndex: number
  className?: string
}

export function Stepper({ steps, currentIndex, className }: StepperProps) {
  return (
    <ol className={cn('flex items-center gap-2', className)}>
      {steps.map((step, index) => {
        const isComplete = index < currentIndex
        const isActive = index === currentIndex
        return (
          <li key={step.id} className='flex flex-1 items-center gap-2'>
            <div className='flex flex-1 items-center gap-2'>
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors',
                  isComplete && 'bg-primary text-primary-foreground border-primary',
                  isActive && 'border-primary text-primary',
                  !isComplete && !isActive && 'border-border text-muted-foreground'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {isComplete ? <CheckIcon className='size-3.5' /> : index + 1}
              </span>
              <div className='min-w-0 flex-1'>
                <p
                  className={cn(
                    'truncate text-xs font-medium',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
                {step.description ? (
                  <p className='text-muted-foreground hidden truncate text-[10px] sm:block'>
                    {step.description}
                  </p>
                ) : null}
              </div>
            </div>
            {index < steps.length - 1 ? (
              <span
                className={cn(
                  'h-px flex-1 transition-colors',
                  isComplete ? 'bg-primary' : 'bg-border'
                )}
                aria-hidden
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
