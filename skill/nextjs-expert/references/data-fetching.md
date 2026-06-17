# Data Fetching Reference

## Table of Contents
1. [Server Component Fetching](#server-component-fetching)
2. [Caching & Revalidation](#caching--revalidation)
3. [Client-Side Fetching](#client-side-fetching)
4. [React Query / SWR with Next.js](#react-query--swr-with-nextjs)
5. [Parallel & Sequential Fetching](#parallel--sequential-fetching)
6. [Streaming with Suspense](#streaming-with-suspense)
7. [ORM & Database Patterns](#orm--database-patterns)
8. [Pages Router Fetching](#pages-router-fetching)

---

## Server Component Fetching

The most common and recommended pattern in App Router.

```tsx
// Direct async/await — runs on server, never exposed to client
async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetch(`https://api.example.com/products/${params.id}`)
    .then(r => r.json())
  
  return <ProductDetail product={product} />
}
```

**Key advantage**: secrets, API keys, DB connections never leave the server.

### Request Memoization
Next.js deduplicates identical `fetch()` calls within a single render tree automatically. You can safely call the same fetch in a layout AND a page — it only executes once.

```tsx
// Both call getUser() — only one network request is made
// app/layout.tsx
export default async function Layout() {
  const user = await getUser() // cached
  return <NavBar user={user} />
}

// app/page.tsx
export default async function Page() {
  const user = await getUser() // cache hit — no new request
  return <WelcomeBanner user={user} />
}
```

---

## Caching & Revalidation

### fetch() cache options

```ts
// Static (default in Next.js 13/14, changes in Next.js 15)
fetch(url, { cache: 'force-cache' })

// Dynamic — opt out of caching
fetch(url, { cache: 'no-store' })

// ISR — revalidate every N seconds
fetch(url, { next: { revalidate: 3600 } })

// Tag-based revalidation
fetch(url, { next: { tags: ['products'] } })
```

**Next.js 15 change**: `fetch()` defaults to `no-store` (not `force-cache`). Plan accordingly when upgrading.

### Route segment config (applies to entire route)
```ts
// Opt entire route into dynamic rendering
export const dynamic = 'force-dynamic'

// Set revalidation for entire route
export const revalidate = 3600

// Runtime
export const runtime = 'edge' // or 'nodejs'
```

### On-demand revalidation
```ts
// From Server Action or Route Handler
import { revalidatePath, revalidateTag } from 'next/cache'

// After mutation:
await db.product.update(...)
revalidatePath('/products')          // Revalidate path
revalidateTag('products')            // Revalidate by tag
```

### `unstable_cache` (for non-fetch data sources)
Cache DB queries, external SDK calls, etc.:
```ts
import { unstable_cache } from 'next/cache'

const getCachedUser = unstable_cache(
  async (id: string) => db.user.findUnique({ where: { id } }),
  ['user'],
  { revalidate: 3600, tags: ['users'] }
)

// Usage
const user = await getCachedUser(userId)
```

---

## Client-Side Fetching

Use when you need data that depends on user interaction, auth state already on client, or real-time updates.

### Native fetch with useEffect (simple cases)
```tsx
'use client'
import { useState, useEffect } from 'react'

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(data => { setUser(data); setLoading(false) })
  }, [userId])

  if (loading) return <Skeleton />
  return <ProfileCard user={user} />
}
```

⚠️ For anything non-trivial, prefer SWR or TanStack Query over raw useEffect.

---

## React Query / SWR with Next.js

### SWR setup
```tsx
// app/providers.tsx
'use client'
import { SWRConfig } from 'swr'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ fetcher: (url) => fetch(url).then(r => r.json()) }}>
      {children}
    </SWRConfig>
  )
}
```

```tsx
'use client'
import useSWR from 'swr'

function Dashboard() {
  const { data, error, isLoading } = useSWR('/api/dashboard')
  
  if (isLoading) return <Skeleton />
  if (error) return <Error />
  return <DashboardContent data={data} />
}
```

### TanStack Query (React Query) setup
```tsx
// app/providers.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

```tsx
'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

function Posts() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetch('/api/posts').then(r => r.json()),
  })
  
  const queryClient = useQueryClient()
  const { mutate: deletePost } = useMutation({
    mutationFn: (id: string) => fetch(`/api/posts/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })
  
  // ...
}
```

### Hydration pattern (prefetch on server, use on client)
```tsx
// app/posts/page.tsx (Server Component)
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { PostList } from './PostList'

export default async function PostsPage() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostList /> {/* Client Component — data already available, no loading state */}
    </HydrationBoundary>
  )
}
```

---

## Parallel & Sequential Fetching

### Parallel (preferred when possible)
```tsx
async function Dashboard() {
  // Start all fetches simultaneously
  const [user, posts, analytics] = await Promise.all([
    getUser(),
    getPosts(),
    getAnalytics(),
  ])
  
  return <DashboardUI user={user} posts={posts} analytics={analytics} />
}
```

### Sequential (when one depends on another)
```tsx
async function UserPosts({ userId }: { userId: string }) {
  const user = await getUser(userId)        // first
  const posts = await getPosts(user.teamId) // depends on user
  return <Posts posts={posts} />
}
```

### Parallel with Suspense (stream independently)
```tsx
export default function Page() {
  // Don't await — let them stream in independently
  const userPromise = getUser()
  const postsPromise = getPosts()
  
  return (
    <>
      <Suspense fallback={<UserSkeleton />}>
        <User userPromise={userPromise} />
      </Suspense>
      <Suspense fallback={<PostsSkeleton />}>
        <Posts postsPromise={postsPromise} />
      </Suspense>
    </>
  )
}

// Server Component that accepts a promise
async function User({ userPromise }: { userPromise: Promise<User> }) {
  const user = await userPromise
  return <UserCard user={user} />
}
```

---

## Streaming with Suspense

Use `loading.tsx` for route-level streaming, or `<Suspense>` for component-level:

```tsx
import { Suspense } from 'react'

export default function ProductPage() {
  return (
    <div>
      {/* Renders immediately */}
      <ProductHeader />
      
      {/* Streams in when data is ready */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews /> {/* async Server Component */}
      </Suspense>
      
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations />
      </Suspense>
    </div>
  )
}
```

---

## ORM & Database Patterns

### Prisma with Server Components
```ts
// lib/db.ts — singleton pattern for dev (prevents too many connections)
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const db = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

```tsx
// Direct DB call in Server Component — perfectly fine
async function UserPage({ params }: { params: { id: string } }) {
  const user = await db.user.findUnique({
    where: { id: params.id },
    include: { posts: true },
  })
  if (!user) notFound()
  return <UserProfile user={user} />
}
```

### Drizzle ORM
```ts
// db/schema.ts
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})
```

```tsx
import { db } from '@/db'
import { posts } from '@/db/schema'

async function PostsPage() {
  const allPosts = await db.select().from(posts)
  return <PostList posts={allPosts} />
}
```

---

## Pages Router Fetching

### `getServerSideProps` (SSR)
```tsx
import type { GetServerSideProps } from 'next'

interface Props { user: User }

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const user = await getUser(ctx.params?.id as string)
  if (!user) return { notFound: true }
  return { props: { user } }
}

export default function UserPage({ user }: Props) {
  return <UserProfile user={user} />
}
```

### `getStaticProps` + `getStaticPaths` (SSG)
```tsx
import type { GetStaticProps, GetStaticPaths } from 'next'

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPosts()
  return {
    paths: posts.map(p => ({ params: { slug: p.slug } })),
    fallback: 'blocking', // or true, false
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await getPost(params?.slug as string)
  return {
    props: { post },
    revalidate: 3600, // ISR
  }
}
```
