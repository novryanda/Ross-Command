'use client'

import {
  BookOpenIcon,
  CreditCardIcon,
  LifeBuoyIcon,
  MailIcon,
  MessageSquareIcon,
  RocketIcon,
  SearchIcon,
  ShieldIcon,
  UsersIcon,
  ZapIcon
} from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const categories = [
  { icon: RocketIcon, title: 'Getting started', description: 'Set up your account and explore the basics.', articles: 12 },
  { icon: ZapIcon, title: 'Quick actions', description: 'Shortcuts and tips to work faster.', articles: 8 },
  { icon: CreditCardIcon, title: 'Billing & plans', description: 'Subscriptions, invoices, and payments.', articles: 15 },
  { icon: UsersIcon, title: 'Team management', description: 'Invite, manage, and collaborate with your team.', articles: 9 },
  { icon: ShieldIcon, title: 'Security', description: 'Account protection, 2FA, and best practices.', articles: 11 },
  { icon: BookOpenIcon, title: 'API & integrations', description: 'Connect your tools and automate workflows.', articles: 21 }
]

const faqs = [
  {
    q: 'How do I reset my password?',
    a: 'Go to the login page and click "Forgot password". Enter your email and we will send you a reset link. Links expire after 1 hour for security.'
  },
  {
    q: 'Can I change my subscription plan?',
    a: 'Yes, you can upgrade or downgrade at any time from Settings → Billing. Pro-rated charges or credits will appear on your next invoice.'
  },
  {
    q: 'How do I invite teammates?',
    a: 'Open the Team page, click "Invite member", enter their email and choose a role. They will receive an invite link valid for 7 days.'
  },
  {
    q: 'What payment methods are supported?',
    a: 'All major credit and debit cards (Visa, Mastercard, Amex, Discover). Enterprise plans also support bank transfers and invoicing.'
  },
  {
    q: 'How do I enable two-factor authentication?',
    a: 'Go to Settings → Security and toggle "Two-factor authentication". Scan the QR code with an authenticator app and enter the verification code.'
  },
  {
    q: 'Can I export my data?',
    a: 'Yes. From Settings → Account, click "Export data". You will receive an email with a download link within a few minutes.'
  }
]

export default function HelpPage() {
  return (
    <div className='space-y-8'>
      <div className='space-y-4 text-center'>
        <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>How can we help?</h1>
        <p className='text-muted-foreground text-sm'>
          Search our knowledge base or browse topics below.
        </p>
        <div className='mx-auto max-w-md'>
          <div className='relative'>
            <SearchIcon className='text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2' />
            <Input placeholder='Search articles, guides, FAQs...' className='h-10 pl-9' />
          </div>
        </div>
      </div>

      <div className='space-y-3'>
        <h2 className='text-base font-semibold'>Browse by category</h2>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Card key={category.title} className='hover:bg-accent/30 cursor-pointer transition-colors'>
                <CardContent className='flex items-start gap-3'>
                  <div className='bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-md'>
                    <Icon className='size-4' />
                  </div>
                  <div className='min-w-0 flex-1 space-y-1'>
                    <p className='text-sm font-semibold'>{category.title}</p>
                    <p className='text-muted-foreground text-xs'>{category.description}</p>
                    <p className='text-muted-foreground text-[10px]'>{category.articles} articles</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className='space-y-3'>
        <h2 className='text-base font-semibold'>Frequently asked questions</h2>
        <Card>
          <CardContent>
            <Accordion type='single' collapsible className='w-full'>
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.q} value={`item-${index}`}>
                  <AccordionTrigger className='text-sm'>{faq.q}</AccordionTrigger>
                  <AccordionContent className='text-muted-foreground text-sm'>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <Card className='bg-muted/30'>
        <CardContent className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-md'>
              <LifeBuoyIcon className='size-5' />
            </div>
            <div className='space-y-0.5'>
              <p className='text-sm font-semibold'>Still need help?</p>
              <p className='text-muted-foreground text-xs'>
                Our support team is here to help, usually within a few hours.
              </p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm'>
              <MessageSquareIcon className='size-3.5' /> Live chat
            </Button>
            <Button size='sm'>
              <MailIcon className='size-3.5' /> Email support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
