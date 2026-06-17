'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BellIcon,
  BriefcaseIcon,
  CheckCircle2Icon,
  GlobeIcon,
  Loader2Icon,
  PaintbrushIcon,
  PlusIcon,
  RocketIcon,
  TrashIcon,
  UserIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Stepper, type WizardStep } from '@/components/wizard-stepper'
import { cn } from '@/lib/utils'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  jobTitle: z.string().min(1, 'Job title is required'),
  timezone: z.string().min(1, 'Timezone is required')
})

const workspaceSchema = z.object({
  workspaceName: z.string().min(2, 'Workspace name is required'),
  workspaceUrl: z
    .string()
    .min(3, 'URL must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Use only lowercase letters, numbers, and dashes'),
  size: z.enum(['1', '2-10', '11-50', '51-200', '200+'])
})

const inviteSchema = z.object({
  invites: z
    .array(
      z.object({
        email: z.string().email('Enter a valid email').or(z.literal(''))
      })
    )
    .max(10)
})

const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    weekly: z.boolean()
  })
})

type ProfileValues = z.infer<typeof profileSchema>
type WorkspaceValues = z.infer<typeof workspaceSchema>
type InviteValues = z.infer<typeof inviteSchema>
type PreferencesValues = z.infer<typeof preferencesSchema>

const steps: WizardStep[] = [
  { id: 'profile', title: 'Profile', description: 'About you' },
  { id: 'workspace', title: 'Workspace', description: 'Set up your space' },
  { id: 'team', title: 'Team', description: 'Invite people' },
  { id: 'preferences', title: 'Preferences', description: 'Last touches' }
]

const timezones = [
  'America/Los_Angeles',
  'America/New_York',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney'
]

export default function OnboardingPage() {
  const [stepIndex, setStepIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [data, setData] = useState<{
    profile?: ProfileValues
    workspace?: WorkspaceValues
    invites?: InviteValues
    preferences?: PreferencesValues
  }>({})

  const next = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1))
  const prev = () => setStepIndex((i) => Math.max(i - 1, 0))

  const finish = async (preferences: PreferencesValues) => {
    setSubmitting(true)
    setData((d) => ({ ...d, preferences }))
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSubmitting(false)
    setCompleted(true)
    toast.success('Setup complete', { description: 'Welcome to your new workspace' })
  }

  if (completed) {
    return (
      <div className='mx-auto max-w-xl space-y-6'>
        <Card>
          <CardContent className='space-y-4 py-12 text-center'>
            <div className='bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex size-14 items-center justify-center rounded-full'>
              <CheckCircle2Icon className='size-7' />
            </div>
            <div className='space-y-1'>
              <h2 className='text-xl font-semibold'>You&apos;re all set!</h2>
              <p className='text-muted-foreground text-sm'>
                Your workspace is ready. We&apos;ll send a confirmation email shortly.
              </p>
            </div>
            <div className='bg-muted/50 mx-auto max-w-sm rounded-lg p-3 text-left text-xs'>
              <p className='font-medium'>Summary</p>
              <ul className='text-muted-foreground mt-2 space-y-1'>
                <li>Workspace: {data.workspace?.workspaceName}</li>
                <li>URL: {data.workspace?.workspaceUrl}.mocci.app</li>
                <li>Team size: {data.workspace?.size}</li>
                <li>
                  Invites sent: {data.invites?.invites.filter((i) => i.email).length ?? 0}
                </li>
              </ul>
            </div>
            <div className='flex justify-center gap-2'>
              <Button variant='outline' size='sm' onClick={() => setCompleted(false)}>
                Back to wizard
              </Button>
              <Button size='sm'>
                <RocketIcon className='size-3.5' /> Open dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-2xl space-y-6'>
      <div className='space-y-1 text-center'>
        <h1 className='text-xl font-semibold tracking-tight'>Welcome to Moccilabs</h1>
        <p className='text-muted-foreground text-sm'>Let&apos;s set up your workspace in a few quick steps.</p>
      </div>

      <Stepper steps={steps} currentIndex={stepIndex} />

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>{steps[stepIndex].title}</CardTitle>
          <CardDescription className='text-xs'>{steps[stepIndex].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {stepIndex === 0 ? (
            <ProfileStep
              defaultValues={data.profile}
              onNext={(values) => {
                setData((d) => ({ ...d, profile: values }))
                next()
              }}
            />
          ) : null}
          {stepIndex === 1 ? (
            <WorkspaceStep
              defaultValues={data.workspace}
              onBack={prev}
              onNext={(values) => {
                setData((d) => ({ ...d, workspace: values }))
                next()
              }}
            />
          ) : null}
          {stepIndex === 2 ? (
            <TeamStep
              defaultValues={data.invites}
              onBack={prev}
              onNext={(values) => {
                setData((d) => ({ ...d, invites: values }))
                next()
              }}
            />
          ) : null}
          {stepIndex === 3 ? (
            <PreferencesStep
              defaultValues={data.preferences}
              submitting={submitting}
              onBack={prev}
              onSubmit={finish}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileStep({
  defaultValues,
  onNext
}: {
  defaultValues?: ProfileValues
  onNext: (values: ProfileValues) => void
}) {
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultValues ?? { fullName: '', jobTitle: '', timezone: 'America/Los_Angeles' }
  })

  return (
    <Form {...form}>
      <form className='space-y-4' onSubmit={form.handleSubmit(onNext)}>
        <FormField
          control={form.control}
          name='fullName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <div className='relative'>
                  <UserIcon className='text-muted-foreground absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2' />
                  <Input className='pl-8' placeholder='Jane Doe' {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='jobTitle'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job title</FormLabel>
              <FormControl>
                <div className='relative'>
                  <BriefcaseIcon className='text-muted-foreground absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2' />
                  <Input className='pl-8' placeholder='Product Designer' {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='timezone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <GlobeIcon className='size-3.5' />
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Used for scheduling and notifications.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-end pt-2'>
          <Button type='submit' size='sm'>
            Continue <ArrowRightIcon className='size-3.5' />
          </Button>
        </div>
      </form>
    </Form>
  )
}

function WorkspaceStep({
  defaultValues,
  onBack,
  onNext
}: {
  defaultValues?: WorkspaceValues
  onBack: () => void
  onNext: (values: WorkspaceValues) => void
}) {
  const form = useForm<WorkspaceValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: defaultValues ?? { workspaceName: '', workspaceUrl: '', size: '2-10' }
  })

  return (
    <Form {...form}>
      <form className='space-y-4' onSubmit={form.handleSubmit(onNext)}>
        <FormField
          control={form.control}
          name='workspaceName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workspace name</FormLabel>
              <FormControl>
                <Input placeholder='Acme Inc.' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='workspaceUrl'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workspace URL</FormLabel>
              <FormControl>
                <div className='border-input bg-background flex h-9 items-center rounded-md border text-sm shadow-xs'>
                  <Input
                    placeholder='acme'
                    className='border-0 bg-transparent shadow-none focus-visible:ring-0'
                    {...field}
                  />
                  <span className='text-muted-foreground border-l px-3'>.mocci.app</span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='size'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team size</FormLabel>
              <FormControl>
                <RadioGroup value={field.value} onValueChange={field.onChange} className='grid grid-cols-5 gap-2'>
                  {(['1', '2-10', '11-50', '51-200', '200+'] as const).map((size) => (
                    <label
                      key={size}
                      className={cn(
                        'border-input flex cursor-pointer items-center justify-center rounded-md border p-2 text-xs transition-colors',
                        field.value === size && 'border-primary bg-primary/5 text-primary'
                      )}
                    >
                      <RadioGroupItem value={size} className='sr-only' />
                      {size}
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-between pt-2'>
          <Button type='button' variant='outline' size='sm' onClick={onBack}>
            <ArrowLeftIcon className='size-3.5' /> Back
          </Button>
          <Button type='submit' size='sm'>
            Continue <ArrowRightIcon className='size-3.5' />
          </Button>
        </div>
      </form>
    </Form>
  )
}

function TeamStep({
  defaultValues,
  onBack,
  onNext
}: {
  defaultValues?: InviteValues
  onBack: () => void
  onNext: (values: InviteValues) => void
}) {
  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: defaultValues ?? { invites: [{ email: '' }, { email: '' }, { email: '' }] }
  })
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'invites' })

  return (
    <Form {...form}>
      <form className='space-y-4' onSubmit={form.handleSubmit(onNext)}>
        <p className='text-muted-foreground text-xs'>
          Invite teammates to collaborate. You can skip this and invite people later from settings.
        </p>

        <div className='space-y-2'>
          {fields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`invites.${index}.email`}
              render={({ field: f }) => (
                <FormItem>
                  <div className='flex items-start gap-2'>
                    <FormControl>
                      <Input type='email' placeholder='colleague@example.com' {...f} />
                    </FormControl>
                    {fields.length > 1 ? (
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='size-9 shrink-0'
                        onClick={() => remove(index)}
                        aria-label='Remove invite'
                      >
                        <TrashIcon className='size-3.5' />
                      </Button>
                    ) : null}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          {fields.length < 10 ? (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='text-muted-foreground h-8 w-full justify-start text-xs'
              onClick={() => append({ email: '' })}
            >
              <PlusIcon className='size-3.5' /> Add another
            </Button>
          ) : null}
        </div>

        <div className='flex justify-between pt-2'>
          <Button type='button' variant='outline' size='sm' onClick={onBack}>
            <ArrowLeftIcon className='size-3.5' /> Back
          </Button>
          <div className='flex gap-2'>
            <Button type='button' variant='ghost' size='sm' onClick={() => onNext({ invites: [] })}>
              Skip
            </Button>
            <Button type='submit' size='sm'>
              Continue <ArrowRightIcon className='size-3.5' />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

function PreferencesStep({
  defaultValues,
  submitting,
  onBack,
  onSubmit
}: {
  defaultValues?: PreferencesValues
  submitting: boolean
  onBack: () => void
  onSubmit: (values: PreferencesValues) => void
}) {
  const form = useForm<PreferencesValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues:
      defaultValues ?? {
        theme: 'system',
        notifications: { email: true, push: true, weekly: false }
      }
  })

  const themeOptions = [
    { value: 'light' as const, label: 'Light' },
    { value: 'dark' as const, label: 'Dark' },
    { value: 'system' as const, label: 'System' }
  ]

  const notificationItems: Array<{ key: keyof PreferencesValues['notifications']; label: string; desc: string }> = [
    { key: 'email', label: 'Email notifications', desc: 'Updates and mentions sent to your inbox.' },
    { key: 'push', label: 'Push notifications', desc: 'Real-time alerts on your devices.' },
    { key: 'weekly', label: 'Weekly digest', desc: 'Summary of activity every Monday.' }
  ]

  return (
    <Form {...form}>
      <form className='space-y-5' onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='theme'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='flex items-center gap-1.5'>
                <PaintbrushIcon className='size-3.5' /> Theme
              </FormLabel>
              <FormControl>
                <RadioGroup value={field.value} onValueChange={field.onChange} className='grid grid-cols-3 gap-2'>
                  {themeOptions.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        'border-input flex cursor-pointer items-center justify-center rounded-md border p-2 text-xs transition-colors',
                        field.value === option.value && 'border-primary bg-primary/5 text-primary'
                      )}
                    >
                      <RadioGroupItem value={option.value} className='sr-only' />
                      {option.label}
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        <div className='space-y-2'>
          <FormLabel className='flex items-center gap-1.5'>
            <BellIcon className='size-3.5' /> Notifications
          </FormLabel>
          {notificationItems.map((item) => (
            <FormField
              key={item.key}
              control={form.control}
              name={`notifications.${item.key}`}
              render={({ field }) => (
                <FormItem className='flex flex-row items-start justify-between gap-4 rounded-lg border p-3 space-y-0'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-sm'>{item.label}</FormLabel>
                    <FormDescription>{item.desc}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className='flex justify-between pt-2'>
          <Button type='button' variant='outline' size='sm' onClick={onBack} disabled={submitting}>
            <ArrowLeftIcon className='size-3.5' /> Back
          </Button>
          <Button type='submit' size='sm' disabled={submitting}>
            {submitting ? <Loader2Icon className='animate-spin' /> : <RocketIcon className='size-3.5' />}
            Finish setup
          </Button>
        </div>
      </form>
    </Form>
  )
}
