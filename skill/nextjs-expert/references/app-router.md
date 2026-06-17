# App Router Reference

## Table of Contents
1. [File Conventions](#file-conventions)
2. [Layouts & Templates](#layouts--templates)
3. [Route Groups & Parallel Routes](#route-groups--parallel-routes)
4. [Intercepting Routes](#intercepting-routes)
5. [Loading & Streaming](#loading--streaming)
6. [Error Handling](#error-handling)
7. [Server vs Client Components](#server-vs-client-components)
8. [Server Actions](#server-actions)
9. [Route Handlers (API)](#route-handlers-api)
10. [Metadata API](#metadata-api)

---

## File Conventions

| File | Purpose | Notes |
|------|---------|-------|
| `layout.tsx` | Shared UI, persists across navigations | Required at root |
| `page.tsx` | Unique UI for a route, makes route publicly accessible | |
| `loading.tsx` | Instant loading state (Suspense boundary) | |
| `error.tsx` | Error boundary for route | Must be `"use client"` |
| `global-error.tsx` | Root-level error boundary | |
| `not-found.tsx` | 404 UI for `notFound()` | |
| `template.tsx` | Like layout but re-mounts on navigation | |
| `default.tsx` | Fallback for parallel routes | |
| `route.ts` | API Route Handler | Cannot coexist with `page.tsx` |

---

## Layouts & Templates

Layouts **do not re-render** when navigating between children. They persist state (e.g., sidebar open/closed, form state).

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}
```

**Template** re-mounts on every navigation — useful for scroll-to-top, page view tracking, enter/exit animations.

```tsx
// app/dashboard/template.tsx — re-renders on each navigation
export default function Template({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
```

### Nested layouts
Each segment can have its own layout. They compose automatically:
```
app/
├── layout.tsx         ← root (wraps everything)
├── dashboard/
│   ├── layout.tsx     ← wraps /dashboard/*
│   └── settings/
│       └── page.tsx   ← /dashboard/settings
```

---

## Route Groups & Parallel Routes

### Route Groups `(name)`
Organize without affecting URL. Great for:
- Sharing a layout between some routes
- Splitting an app into sections

```
app/
├── (auth)/
│   ├── layout.tsx     ← login/signup share this layout
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (app)/
│   ├── layout.tsx     ← main app layout (authenticated)
│   └── dashboard/page.tsx
```

### Parallel Routes `@name`
Render multiple pages in the same layout simultaneously:

```
app/
├── layout.tsx
├── @team/
│   └── page.tsx
├── @analytics/
│   └── page.tsx
└── page.tsx
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  team,
  analytics,
}: {
  children: React.ReactNode
  team: React.ReactNode
  analytics: React.ReactNode
}) {
  return (
    <>
      {children}
      {team}
      {analytics}
    </>
  )
}
```

---

## Intercepting Routes

Intercept a route to show it in a modal while keeping the URL:

```
app/
├── feed/
│   └── page.tsx         ← full photo page at /feed
├── photo/
│   └── [id]/page.tsx    ← full photo page at /photo/[id]
└── @modal/
    └── (.)photo/
        └── [id]/page.tsx ← intercepted: show modal
```

`(.)` = same level, `(..)` = one level up, `(...)` = from root

---

## Loading & Streaming

`loading.tsx` wraps the route segment in `<Suspense>` automatically:

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />
}
```

For granular streaming, use Suspense directly:

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <StaticContent />
      <Suspense fallback={<Skeleton />}>
        <SlowDataComponent /> {/* Streams in when ready */}
      </Suspense>
    </div>
  )
}
```

---

## Error Handling

```tsx
// app/dashboard/error.tsx
'use client' // Required — error boundaries must be Client Components

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

For **not found** pages, call `notFound()` from the server:

```tsx
import { notFound } from 'next/navigation'

async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  if (!product) notFound() // Renders not-found.tsx
  return <Product data={product} />
}
```

---

## Server vs Client Components

### Decision guide

| Need | Component Type |
|------|---------------|
| Access database / filesystem | Server |
| Use secrets / API keys | Server |
| Fetch data | Server (preferred) |
| Use `useState`, `useEffect`, hooks | Client |
| Use browser APIs (`window`, `localStorage`) | Client |
| Add event listeners | Client |
| Use Context | Client (but Provider can be in Server tree) |

### Boundary pattern — push it down

```tsx
// app/dashboard/page.tsx — Server Component
async function DashboardPage() {
  const user = await getUser() // DB call, stays on server
  return (
    <main>
      <h1>Welcome, {user.name}</h1>
      <InteractiveChart userId={user.id} /> {/* Client component */}
    </main>
  )
}
```

```tsx
// components/InteractiveChart.tsx
'use client'
import { useState } from 'react'

export function InteractiveChart({ userId }: { userId: string }) {
  const [period, setPeriod] = useState('week')
  // ...
}
```

### Passing Server Component children to Client Component

```tsx
// Works! Server component renders ServerChild and passes as prop
import { ClientWrapper } from './ClientWrapper'
import { ServerChild } from './ServerChild'

export default function Page() {
  return (
    <ClientWrapper>
      <ServerChild /> {/* This stays a Server Component */}
    </ClientWrapper>
  )
}
```

---

## Server Actions

Server Actions are async functions that run on the server, called from Client or Server Components.

### With forms (progressive enhancement — works without JS)
```tsx
'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTodo(formData: FormData) {
  const text = formData.get('text') as string
  if (!text) return { error: 'Text is required' }
  
  await db.todo.create({ data: { text } })
  revalidatePath('/todos')
}
```

### With `useActionState` (Next.js 14+ / React 19)
```tsx
'use client'
import { useActionState } from 'react'
import { createTodo } from './actions'

export function TodoForm() {
  const [state, formAction, isPending] = useActionState(createTodo, null)
  
  return (
    <form action={formAction}>
      <input name="text" />
      {state?.error && <p>{state.error}</p>}
      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  )
}
```

### Calling Server Actions programmatically
```tsx
'use client'
import { deletePost } from './actions'

export function DeleteButton({ id }: { id: string }) {
  return (
    <button onClick={() => deletePost(id)}>Delete</button>
  )
}
```

### Revalidation options
```ts
revalidatePath('/posts')           // Revalidate a specific path
revalidatePath('/posts', 'layout') // Revalidate all pages under layout
revalidateTag('posts')             // Revalidate by cache tag
```

---

## Route Handlers (API)

Replace Pages Router API routes. Live in `app/api/*/route.ts`.

```ts
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')
  
  const posts = await db.post.findMany({ where: { title: { contains: query } } })
  return NextResponse.json(posts)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const post = await db.post.create({ data: body })
  return NextResponse.json(post, { status: 201 })
}
```

**Dynamic route handler:**
```ts
// app/api/posts/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await db.post.findUnique({ where: { id: params.id } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}
```

---

## Metadata API

### Static metadata
```tsx
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | My App',
    default: 'My App',
  },
  description: 'Built with Next.js',
  metadataBase: new URL('https://myapp.com'),
  openGraph: {
    images: '/og-image.png',
  },
}
```

### Dynamic metadata
```tsx
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      images: [{ url: post.coverImage }],
    },
  }
}
```

### generateStaticParams (SSG for dynamic routes)
```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({ slug: post.slug }))
}
```
