# TypeScript Reference

## Table of Contents
1. [Project Setup](#project-setup)
2. [Page & Layout Types](#page--layout-types)
3. [Component Types](#component-types)
4. [Server Action Types](#server-action-types)
5. [API Route Types](#api-route-types)
6. [Common Utility Types](#common-utility-types)

---

## Project Setup

```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint --app
```

### tsconfig.json — recommended settings
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## Page & Layout Types

### App Router page
```tsx
import type { Metadata } from 'next'

// Props for dynamic segments
type Props = {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: params.slug }
}

export default async function Page({ params, searchParams }: Props) {
  return <div>{params.slug}</div>
}
```

### Nested dynamic params
```tsx
// app/blog/[category]/[slug]/page.tsx
type Props = {
  params: {
    category: string
    slug: string
  }
}
```

### Layout type
```tsx
export default function Layout({
  children,
  modal,           // parallel route
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
```

---

## Component Types

### Basic component
```tsx
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  className?: string
}

export function Button({ children, onClick, variant = 'primary', disabled, className }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(buttonVariants[variant], className)}
    >
      {children}
    </button>
  )
}
```

### With HTML element extension
```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <div>
      <label>{label}</label>
      <input {...props} />
      {error && <p>{error}</p>}
    </div>
  )
}
```

### `forwardRef`
```tsx
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => (
    <div>
      <label>{label}</label>
      <input ref={ref} {...props} />
    </div>
  )
)
Input.displayName = 'Input'
```

### Generic component
```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}
```

---

## Server Action Types

```tsx
'use server'

// Return type for useActionState
type ActionState = {
  error?: string
  success?: boolean
  data?: unknown
}

export async function createPost(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const title = formData.get('title')
  
  if (!title || typeof title !== 'string') {
    return { error: 'Title is required' }
  }
  
  try {
    await db.post.create({ data: { title } })
    return { success: true }
  } catch (e) {
    return { error: 'Failed to create post' }
  }
}
```

```tsx
// Client Component using the action
'use client'
import { useActionState } from 'react'
import { createPost } from './actions'

export function PostForm() {
  const [state, action, isPending] = useActionState(createPost, {})
  
  return (
    <form action={action}>
      <input name="title" />
      {state.error && <p className="text-red-500">{state.error}</p>}
      <button disabled={isPending}>Create</button>
    </form>
  )
}
```

---

## API Route Types

### App Router Route Handler
```ts
import { NextRequest, NextResponse } from 'next/server'

// Type-safe request body
interface CreateUserBody {
  name: string
  email: string
  role?: 'user' | 'admin'
}

export async function POST(request: NextRequest) {
  const body: CreateUserBody = await request.json()
  
  // Validate
  if (!body.name || !body.email) {
    return NextResponse.json(
      { error: 'name and email required' },
      { status: 400 }
    )
  }
  
  const user = await createUser(body)
  return NextResponse.json(user, { status: 201 })
}
```

### Pages Router API
```ts
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = { user: User } | { error: string }

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  // ...
}
```

---

## Common Utility Types

### Extract search params type
```ts
type SearchParams = {
  [key: string]: string | string[] | undefined
}

function getStringParam(params: SearchParams, key: string): string | undefined {
  const value = params[key]
  return Array.isArray(value) ? value[0] : value
}
```

### Augment NextAuth session
```ts
// types/next-auth.d.ts
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'user' | 'admin'
    } & DefaultSession['user']
  }
  
  interface User {
    role: 'user' | 'admin'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'user' | 'admin'
  }
}
```

### Database types with Prisma
```ts
import type { Post, User, Prisma } from '@prisma/client'

// Include relations
type PostWithAuthor = Prisma.PostGetPayload<{
  include: { author: true }
}>

// Select subset
type PostSummary = Prisma.PostGetPayload<{
  select: { id: true; title: true; createdAt: true }
}>
```

### Path params helper
```ts
// Ensure params are ready (useful in client components)
import { useParams } from 'next/navigation'

function useTypedParams<T extends Record<string, string>>() {
  return useParams() as T
}

// Usage
const { slug } = useTypedParams<{ slug: string }>()
```
