'use client'

import { useState } from 'react'
import { CheckIcon, SparklesIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type Plan = {
  name: string
  description: string
  monthly: number
  yearly: number
  features: string[]
  cta: string
  highlighted?: boolean
}

const plans: Plan[] = [
  {
    name: 'Starter',
    description: 'For solo builders shipping their first project.',
    monthly: 0,
    yearly: 0,
    features: ['1 project', 'Up to 3 collaborators', 'Community support', 'Basic analytics'],
    cta: 'Get started'
  },
  {
    name: 'Pro',
    description: 'For growing teams that need more power.',
    monthly: 29,
    yearly: 24,
    features: [
      'Unlimited projects',
      'Up to 20 collaborators',
      'Priority email support',
      'Advanced analytics',
      'Custom domains',
      'API access'
    ],
    cta: 'Start free trial',
    highlighted: true
  },
  {
    name: 'Enterprise',
    description: 'For organizations with custom needs.',
    monthly: 99,
    yearly: 79,
    features: [
      'Everything in Pro',
      'Unlimited collaborators',
      'Dedicated support',
      'SSO & SAML',
      'Audit logs',
      'Custom contracts'
    ],
    cta: 'Contact sales'
  }
]

const faqs = [
  {
    q: 'Can I switch plans later?',
    a: 'Yes, you can upgrade or downgrade at any time. Changes take effect at the next billing cycle.'
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 14-day money-back guarantee on all paid plans, no questions asked.'
  },
  {
    q: 'What payment methods are supported?',
    a: 'All major credit cards, debit cards, and bank transfers for Enterprise plans.'
  },
  {
    q: 'Is there a free trial?',
    a: 'The Pro plan includes a 14-day free trial. No credit card required to start.'
  }
]

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <div className='space-y-8'>
      <div className='space-y-3 text-center'>
        <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>Simple pricing for teams of all sizes</h1>
        <p className='text-muted-foreground mx-auto max-w-prose text-sm'>
          Start for free. Upgrade when you need more. Cancel anytime.
        </p>

        <div className='flex justify-center pt-2'>
          <Tabs value={billing} onValueChange={(value) => setBilling(value as 'monthly' | 'yearly')}>
            <TabsList>
              <TabsTrigger value='monthly'>Monthly</TabsTrigger>
              <TabsTrigger value='yearly'>
                Yearly
                <Badge variant='secondary' className='ml-2 text-[10px]'>
                  Save 20%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        {plans.map((plan) => {
          const price = billing === 'monthly' ? plan.monthly : plan.yearly
          return (
            <Card
              key={plan.name}
              className={cn(
                'relative flex flex-col',
                plan.highlighted && 'border-primary shadow-md'
              )}
            >
              {plan.highlighted ? (
                <Badge className='absolute -top-2 left-1/2 -translate-x-1/2'>
                  <SparklesIcon className='size-3' /> Most popular
                </Badge>
              ) : null}
              <CardHeader>
                <CardTitle className='text-base'>{plan.name}</CardTitle>
                <CardDescription className='text-xs'>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className='flex flex-1 flex-col gap-5'>
                <div className='flex items-baseline gap-1'>
                  <span className='text-3xl font-bold tracking-tight'>${price}</span>
                  <span className='text-muted-foreground text-xs'>
                    {price === 0 ? 'forever' : `/ user / mo`}
                  </span>
                </div>

                <Button
                  variant={plan.highlighted ? 'default' : 'outline'}
                  className='w-full'
                  size='sm'
                >
                  {plan.cta}
                </Button>

                <ul className='space-y-2 text-sm'>
                  {plan.features.map((feature) => (
                    <li key={feature} className='flex items-start gap-2'>
                      <CheckIcon className='text-primary mt-0.5 size-4 shrink-0' />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Frequently asked questions</CardTitle>
          <CardDescription className='text-xs'>Common questions about billing and plans.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-5 sm:grid-cols-2'>
            {faqs.map((faq) => (
              <div key={faq.q} className='space-y-1'>
                <p className='text-sm font-medium'>{faq.q}</p>
                <p className='text-muted-foreground text-xs'>{faq.a}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
