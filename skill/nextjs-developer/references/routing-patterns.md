# Next.js App Router - Routing Patterns Reference

## Table of Contents
1. [Basic Page & Layout](#basic-page--layout)
2. [Nested Layouts](#nested-layouts)
3. [Dynamic Routes](#dynamic-routes)
4. [Route Groups](#route-groups)
5. [Route Handlers (API)](#route-handlers-api)
6. [Middleware](#middleware)
7. [Loading & Error States](#loading--error-states)
8. [Parallel & Intercepted Routes](#parallel--intercepted-routes)

---

## Basic Page & Layout

```tsx
// src/app/layout.tsx - Root layout (REQUIRED)
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'My App', template: '%s | My App' },
  description: 'My app description',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

```tsx
// src/app/page.tsx - Home page
export default function HomePage() {
  return <main>Hello World</main>
}
```

---

## Nested Layouts

```tsx
// src/app/dashboard/layout.tsx
import { Sidebar } from '@/components/features/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
```

```tsx
// src/app/dashboard/page.tsx
export default function DashboardPage() {
  return <h1>Dashboard</h1>
}
```

---

## Dynamic Routes

```tsx
// src/app/blog/[slug]/page.tsx
interface Props {
  params: Promise<{ slug: string }>  // Note: params is Promise in Next.js 15+
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params  // Must await params in Next.js 15+
  const post = await getPost(slug)
  return <article>{post.content}</article>
}

// Generate static paths (for SSG)
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map(post => ({ slug: post.slug }))
}

// Dynamic metadata
export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  return { title: post.title }
}
```

**Important (Next.js 15 breaking change):** `params` and `searchParams` are now Promises. Always `await` them.

---

## Route Groups

```
src/app/
|-- (auth)/
|   |-- layout.tsx       # Shared auth layout (centered card, etc.)
|   |-- login/page.tsx   -> /login
|   `-- register/page.tsx -> /register
`-- (main)/
    |-- layout.tsx       # Shared main layout (sidebar, header)
    `-- dashboard/page.tsx -> /dashboard
```

```tsx
// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
```

---

## Route Handlers (API)

```ts
// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const postSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') ?? '1')
  
  const posts = await db.post.findMany({
    skip: (page - 1) * 10,
    take: 10,
  })
  
  return NextResponse.json({ data: posts, page })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = postSchema.safeParse(body)
  
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  
  const post = await db.post.create({ data: parsed.data })
  return NextResponse.json(post, { status: 201 })
}
```

```ts
// src/app/api/posts/[id]/route.ts
interface Context {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: Context) {
  const { id } = await params
  const post = await db.post.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const { id } = await params
  await db.post.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
```

---

## Middleware

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Auth guard
  const token = request.cookies.get('session')?.value
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/api/protected')
  
  if (isProtected && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }
  
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ]
}
```

---

## Loading & Error States

```tsx
// src/app/blog/loading.tsx - Automatic Suspense boundary
export default function BlogLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 animate-pulse rounded" />
      ))}
    </div>
  )
}
```

```tsx
// src/app/blog/error.tsx - Error boundary (must be 'use client')
'use client'
import { useEffect } from 'react'

export default function BlogError({
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
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

---

## Parallel & Intercepted Routes

### Parallel Routes (slots)
```
src/app/
|-- layout.tsx           # Receives @analytics and @team slots
|-- page.tsx
|-- @analytics/
|   `-- page.tsx
`-- @team/
    `-- page.tsx
```

```tsx
// src/app/layout.tsx
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}) {
  return (
    <>
      {children}
      <div className="grid grid-cols-2 gap-4">
        {analytics}
        {team}
      </div>
    </>
  )
}
```

### Intercepted Routes (modals)
```
src/app/
|-- photos/
|   `-- page.tsx               -> /photos list
`-- @modal/
    `-- (.)photos/
        `-- [id]/
            `-- page.tsx       -> /photos/:id as modal
```
