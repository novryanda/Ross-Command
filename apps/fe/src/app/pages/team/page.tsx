'use client'

import { MailIcon, MessageSquareIcon, PlusIcon, SearchIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/showcase'
import { cn } from '@/lib/utils'
import { avatarSrc } from '@/lib/assets'

type Member = {
  id: string
  name: string
  role: string
  department: 'Engineering' | 'Design' | 'Marketing' | 'Sales' | 'Operations'
  email: string
  avatar: string
  fallback: string
  status: 'online' | 'away' | 'offline'
  projects: number
}

const members: Member[] = [
  { id: 'm1', name: 'Jane Cooper', role: 'Senior Designer', department: 'Design', email: 'jane@example.com', avatar: avatarSrc(1), fallback: 'JC', status: 'online', projects: 12 },
  { id: 'm2', name: 'Wade Warren', role: 'Engineering Lead', department: 'Engineering', email: 'wade@example.com', avatar: avatarSrc(2), fallback: 'WW', status: 'online', projects: 18 },
  { id: 'm3', name: 'Esther Howard', role: 'Product Manager', department: 'Operations', email: 'esther@example.com', avatar: avatarSrc(3), fallback: 'EH', status: 'away', projects: 7 },
  { id: 'm4', name: 'Cameron Williamson', role: 'Frontend Engineer', department: 'Engineering', email: 'cameron@example.com', avatar: avatarSrc(4), fallback: 'CW', status: 'offline', projects: 9 },
  { id: 'm5', name: 'Brooklyn Simmons', role: 'Marketing Lead', department: 'Marketing', email: 'brooklyn@example.com', avatar: avatarSrc(5), fallback: 'BS', status: 'online', projects: 5 },
  { id: 'm6', name: 'Leslie Alexander', role: 'Account Executive', department: 'Sales', email: 'leslie@example.com', avatar: avatarSrc(6), fallback: 'LA', status: 'offline', projects: 14 },
  { id: 'm7', name: 'Jenny Wilson', role: 'UX Researcher', department: 'Design', email: 'jenny@example.com', avatar: avatarSrc(7), fallback: 'JW', status: 'away', projects: 6 },
  { id: 'm8', name: 'Robert Fox', role: 'Backend Engineer', department: 'Engineering', email: 'robert@example.com', avatar: avatarSrc(8), fallback: 'RF', status: 'online', projects: 11 }
]

const departmentStyle: Record<Member['department'], string> = {
  Engineering: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Design: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  Marketing: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Sales: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Operations: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
}

const statusDot: Record<Member['status'], string> = {
  online: 'bg-emerald-500',
  away: 'bg-amber-500',
  offline: 'bg-muted-foreground'
}

const stats = [
  { label: 'Total members', value: members.length },
  { label: 'Online now', value: members.filter((m) => m.status === 'online').length },
  { label: 'Departments', value: new Set(members.map((m) => m.department)).size },
  { label: 'Active projects', value: members.reduce((sum, m) => sum + m.projects, 0) }
]

export default function TeamPage() {
  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <PageHeader title='Team' description='Manage members and their access across the workspace.' />
        <Button size='sm' className='h-8'>
          <PlusIcon className='size-3.5' /> Invite member
        </Button>
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className='space-y-1'>
              <p className='text-muted-foreground text-xs'>{stat.label}</p>
              <p className='text-xl font-semibold'>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <div className='relative max-w-xs flex-1'>
          <SearchIcon className='text-muted-foreground absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2' />
          <Input placeholder='Search members...' className='h-8 pl-8 text-sm' />
        </div>
        <Select defaultValue='all'>
          <SelectTrigger size='sm' className='w-36 text-sm'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All departments</SelectItem>
            <SelectItem value='Engineering'>Engineering</SelectItem>
            <SelectItem value='Design'>Design</SelectItem>
            <SelectItem value='Marketing'>Marketing</SelectItem>
            <SelectItem value='Sales'>Sales</SelectItem>
            <SelectItem value='Operations'>Operations</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {members.map((member) => (
          <Card key={member.id} className='py-5'>
            <CardContent className='flex flex-col items-center gap-3 text-center'>
              <div className='relative'>
                <Avatar className='size-16'>
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.fallback}</AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    'border-card absolute bottom-0 right-0 size-3 rounded-full border-2',
                    statusDot[member.status]
                  )}
                  aria-label={member.status}
                />
              </div>
              <div className='space-y-0.5'>
                <p className='text-sm font-semibold'>{member.name}</p>
                <p className='text-muted-foreground text-xs'>{member.role}</p>
              </div>
              <Badge className={cn('h-5 rounded-sm px-1.5 text-[10px]', departmentStyle[member.department])}>
                {member.department}
              </Badge>
              <Separator />
              <div className='text-muted-foreground flex w-full items-center justify-between text-xs'>
                <span>{member.projects} projects</span>
                <span className='capitalize'>{member.status}</span>
              </div>
              <div className='flex w-full gap-2'>
                <Button variant='outline' size='sm' className='flex-1 h-7 text-xs'>
                  <MessageSquareIcon className='size-3' /> Chat
                </Button>
                <Button variant='outline' size='sm' className='flex-1 h-7 text-xs'>
                  <MailIcon className='size-3' /> Email
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
