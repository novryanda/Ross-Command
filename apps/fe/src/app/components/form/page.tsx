'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
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
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'

const formSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters.'),
  email: z.string().email('Enter a valid email address.')
})

export default function FormPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', email: '' }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    toast.success('Form submitted', { description: JSON.stringify(values) })
  }

  return (
    <div className='space-y-8'>
      <PageHeader title='Form' description='Form validation with react-hook-form and Zod.' />
      <ShowcaseGrid>
        <Showcase title='Validation'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='w-[320px] space-y-6'>
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder='moccilabs' {...field} />
                    </FormControl>
                    <FormDescription>This is your public display name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type='email' placeholder='you@moccilabs.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit'>Submit</Button>
            </form>
          </Form>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}
