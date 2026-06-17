'use client'

import {
  CalendarIcon,
  GithubIcon,
  GlobeIcon,
  LinkedinIcon,
  MailIcon,
  MapPinIcon,
  TwitterIcon
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/showcase'
import { avatarSrc } from '@/lib/assets'

const stats = [
  { label: 'Projects', value: '24' },
  { label: 'Followers', value: '1.2k' },
  { label: 'Following', value: '348' }
]

const socials = [
  { icon: GithubIcon, label: 'github.com/janedoe', href: '#' },
  { icon: TwitterIcon, label: '@janedoe', href: '#' },
  { icon: LinkedinIcon, label: 'in/janedoe', href: '#' },
  { icon: GlobeIcon, label: 'janedoe.dev', href: '#' }
]

const skills = ['TypeScript', 'React', 'Next.js', 'Tailwind', 'Node.js', 'PostgreSQL', 'AWS', 'Figma']

const activity = [
  {
    id: 'a1',
    title: 'Pushed 4 commits to mocci-admin-template',
    detail: 'feat: add profile page with activity timeline',
    time: '2 hours ago'
  },
  {
    id: 'a2',
    title: 'Reviewed pull request #142',
    detail: 'Approved changes on "datatable component refactor"',
    time: '6 hours ago'
  },
  {
    id: 'a3',
    title: 'Created project "Marketing site v2"',
    detail: 'Added 3 collaborators and 12 initial tasks',
    time: 'yesterday'
  },
  {
    id: 'a4',
    title: 'Joined the workspace',
    detail: 'Welcome message sent by Cameron Williamson',
    time: '3 days ago'
  }
]

export default function ProfilePage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Profile' description='Public information visible to your team and collaborators.' />

      <Card className='gap-0 overflow-hidden py-0'>
        <div className='from-primary/40 to-primary/10 h-28 bg-gradient-to-r' aria-hidden />
        <CardContent className='pb-6'>
          <div className='-mt-12 flex flex-wrap items-end justify-between gap-4'>
            <Avatar className='border-card size-24 border-4 shadow-sm'>
              <AvatarImage src={avatarSrc(1)} alt='Jane Doe' />
              <AvatarFallback className='text-lg'>JD</AvatarFallback>
            </Avatar>
            <div className='flex gap-2'>
              <Button variant='outline' size='sm'>
                Message
              </Button>
              <Button size='sm'>Follow</Button>
              <Button variant='outline' size='sm'>
                Edit profile
              </Button>
            </div>
          </div>

          <div className='mt-4 space-y-1'>
            <h2 className='text-lg font-semibold leading-none'>Jane Doe</h2>
            <p className='text-muted-foreground text-sm'>Senior Product Designer</p>
          </div>

          <p className='text-muted-foreground mt-3 max-w-prose text-sm'>
            Designing and shipping accessible interfaces for SaaS products. Currently focused on design systems and
            developer tooling. Coffee enthusiast and dog person.
          </p>

          <div className='text-muted-foreground mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs'>
            <span className='flex items-center gap-1.5'>
              <MapPinIcon className='size-3.5' /> San Francisco, CA
            </span>
            <span className='flex items-center gap-1.5'>
              <MailIcon className='size-3.5' /> jane@example.com
            </span>
            <span className='flex items-center gap-1.5'>
              <CalendarIcon className='size-3.5' /> Joined March 2023
            </span>
          </div>

          <Separator className='my-5' />

          <div className='grid grid-cols-3 gap-4'>
            {stats.map((stat) => (
              <div key={stat.label} className='text-center'>
                <p className='text-base font-semibold'>{stat.value}</p>
                <p className='text-muted-foreground text-xs'>{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-4 lg:grid-cols-3'>
        <div className='space-y-4 lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className='relative space-y-5 border-l pl-5'>
                {activity.map((item) => (
                  <li key={item.id} className='relative'>
                    <span
                      className='border-card bg-primary absolute -left-[26px] top-1.5 size-2.5 rounded-full border-2'
                      aria-hidden
                    />
                    <p className='text-sm font-medium'>{item.title}</p>
                    <p className='text-muted-foreground text-xs'>{item.detail}</p>
                    <p className='text-muted-foreground/80 mt-0.5 text-[10px]'>{item.time}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Social</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              {socials.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className='hover:bg-accent flex items-center gap-3 rounded-md p-2 text-sm transition-colors'
                  >
                    <Icon className='text-muted-foreground size-4' />
                    <span className='truncate'>{social.label}</span>
                  </a>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-1.5'>
                {skills.map((skill) => (
                  <Badge key={skill} variant='secondary' className='text-xs font-normal'>
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
