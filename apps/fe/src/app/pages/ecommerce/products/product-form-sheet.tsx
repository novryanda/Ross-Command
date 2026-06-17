'use client'

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ImageIcon, Loader2Icon, UploadCloudIcon } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'

import type { Product } from '../data'

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.string().min(1, 'Select a category'),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
  stock: z.coerce.number().int('Stock must be a whole number').min(0, 'Stock must be 0 or more'),
  status: z.enum(['active', 'draft', 'out_of_stock']),
  description: z.string().optional()
})

export type ProductValues = z.infer<typeof productSchema>

const categories = ['Audio', 'Accessories', 'Video', 'Storage', 'Office']

const emptyValues: ProductValues = {
  name: '',
  category: '',
  price: 0,
  stock: 0,
  status: 'draft',
  description: ''
}

type ProductFormSheetProps = {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (values: ProductValues, id?: string) => void
}

export function ProductFormSheet({ product, open, onOpenChange, onSave }: ProductFormSheetProps) {
  const [submitting, setSubmitting] = useState(false)
  const isEdit = !!product

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyValues
  })

  useEffect(() => {
    if (open) {
      form.reset(
        product
          ? {
              name: product.name,
              category: product.category,
              price: product.price,
              stock: product.stock,
              status: product.status,
              description: ''
            }
          : emptyValues
      )
    }
  }, [product, open, form])

  const onSubmit = async (values: ProductValues) => {
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSubmitting(false)
    onSave(values, product?.id)
    onOpenChange(false)
    toast.success(isEdit ? 'Product updated' : 'Product created', { description: values.name })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex w-full flex-col gap-0 p-0 sm:max-w-md'>
        <SheetHeader className='border-b p-5'>
          <SheetTitle>{isEdit ? 'Edit product' : 'Add new product'}</SheetTitle>
          <SheetDescription className='text-xs'>
            {isEdit ? 'Update the details below.' : 'Fill in the details to add a product to your catalog.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-1 flex-col overflow-hidden'>
            <div className='flex-1 space-y-4 overflow-y-auto p-5'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product name</FormLabel>
                    <FormControl>
                      <Input placeholder='Wireless Headphones' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder='Describe the product...' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Media</FormLabel>
                <button
                  type='button'
                  className='border-input hover:bg-accent/40 flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-6 text-center transition-colors'
                >
                  <div className='bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full'>
                    <UploadCloudIcon className='size-4' />
                  </div>
                  <div className='space-y-0.5'>
                    <p className='text-sm font-medium'>Click to upload</p>
                    <p className='text-muted-foreground text-xs'>PNG, JPG or WEBP (max. 5MB)</p>
                  </div>
                </button>
                <div className='mt-2 grid grid-cols-4 gap-2'>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className='bg-muted/40 text-muted-foreground flex aspect-square items-center justify-center rounded-md border'
                    >
                      <ImageIcon className='size-4' />
                    </div>
                  ))}
                </div>
              </FormItem>

              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='price'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (USD)</FormLabel>
                      <FormControl>
                        <Input type='number' step='0.01' min='0' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='stock'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input type='number' min='0' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='active'>Active</SelectItem>
                        <SelectItem value='draft'>Draft</SelectItem>
                        <SelectItem value='out_of_stock'>Out of stock</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className='text-xs'>Draft products are hidden from your store.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className='border-t p-3'>
              <Button type='button' variant='outline' size='sm' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type='submit' size='sm' disabled={submitting}>
                {submitting ? <Loader2Icon className='animate-spin' /> : null}
                {isEdit ? 'Save changes' : 'Create product'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
