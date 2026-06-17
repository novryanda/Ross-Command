# Next.js Component Patterns Reference

## Table of Contents
1. [Server vs Client Decision Tree](#server-vs-client-decision-tree)
2. [Server Components](#server-components)
3. [Client Components](#client-components)
4. [Composing Server & Client](#composing-server--client)
5. [Server Actions](#server-actions)
6. [Data Fetching Patterns](#data-fetching-patterns)
7. [Common UI Patterns](#common-ui-patterns)

---

## Server vs Client Decision Tree

```
Does the component need:
  useState / useReducer / useEffect?  -> 'use client'
  onClick, onChange, other events?    -> 'use client'
  Browser APIs (window, document)?    -> 'use client'
  Third-party client library?         -> 'use client'
  
Otherwise:
  Direct DB/API access?               -> Server Component [OK]
  Access request headers/cookies?     -> Server Component [OK]
  Large dependency (shouldn't ship to client)? -> Server Component [OK]
  Just rendering static/async data?   -> Server Component [OK]
```

**Rule of thumb:** Start as Server Component. Add `'use client'` only when you hit a wall.

---

## Server Components

```tsx
// Async Server Component - direct data access
import { db } from '@/lib/db'
import { cache } from 'react'

// Use React's cache() for request deduplication
const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } })
})

export default async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId)
  
  if (!user) return <div>User not found</div>
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

```tsx
// Server Component with Suspense boundary
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading stats...</div>}>
        <Stats />  {/* This async component streams in */}
      </Suspense>
    </div>
  )
}

async function Stats() {
  const data = await fetchStats() // Can be slow
  return <div>{data.total} users</div>
}
```

---

## Client Components

```tsx
// Interactive form
'use client'
import { useState, useTransition } from 'react'
import { createPost } from '@/features/blog/actions'

export function CreatePostForm() {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await createPost({ title })
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Post title"
      />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  )
}
```

---

## Composing Server & Client

### Pattern: Server wrapper, Client leaf

```tsx
// src/components/features/ProductCard.tsx - Server Component
import { AddToCartButton } from './AddToCartButton' // Client Component

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  return (
    <div className="card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      {/* Client Component used as leaf */}
      <AddToCartButton productId={product.id} />
    </div>
  )
}
```

```tsx
// src/components/features/AddToCartButton.tsx - Client Component
'use client'
import { useState } from 'react'

export function AddToCartButton({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false)
  return (
    <button onClick={() => setAdded(true)}>
      {added ? 'Added!' : 'Add to Cart'}
    </button>
  )
}
```

### Pattern: Pass Server Component as children to Client

```tsx
// Client Component accepts children (can be Server Components)
'use client'
export function Modal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && <div className="modal">{children}</div>}
    </>
  )
}

// In a Server Component:
export default function Page() {
  return (
    <Modal>
      <ServerContent /> {/* [OK] Server Component as children */}
    </Modal>
  )
}
```

---

## Server Actions

```ts
// src/features/blog/actions.ts
'use server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const createPostSchema = z.object({
  title: z.string().min(1, 'Title required'),
  content: z.string().min(10, 'Content too short'),
})

export async function createPost(data: unknown) {
  const parsed = createPostSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }
  
  const post = await db.post.create({ data: parsed.data })
  revalidatePath('/blog')
  redirect(`/blog/${post.slug}`)
}

export async function deletePost(id: string) {
  await db.post.delete({ where: { id } })
  revalidatePath('/blog')
}
```

**Using with useActionState (React 19):**
```tsx
'use client'
import { useActionState } from 'react'
import { createPost } from './actions'

export function CreatePostForm() {
  const [state, action, isPending] = useActionState(createPost, null)
  
  return (
    <form action={action}>
      <input name="title" />
      <textarea name="content" />
      {state?.error && <p>{state.error.title?.[0]}</p>}
      <button disabled={isPending}>
        {isPending ? 'Saving...' : 'Create'}
      </button>
    </form>
  )
}
```

---

## Data Fetching Patterns

### Fetch with revalidation
```tsx
// Force static (cached forever until manual revalidation)
const res = await fetch('/api/data', { cache: 'force-cache' })

// ISR: revalidate every 60 seconds
const res = await fetch('/api/data', { next: { revalidate: 60 } })

// Dynamic: never cache
const res = await fetch('/api/data', { cache: 'no-store' })

// Tag-based revalidation
const res = await fetch('/api/posts', { next: { tags: ['posts'] } })
// Later: revalidateTag('posts')
```

### Parallel data fetching
```tsx
export default async function Page() {
  // [OK] Parallel - both start at the same time
  const [user, posts] = await Promise.all([
    getUser(),
    getPosts(),
  ])
  
  return <div>...</div>
}
```

### Streaming with Suspense
```tsx
export default function Page() {
  return (
    <div>
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />
      </Suspense>
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments />
      </Suspense>
    </div>
  )
}
```

---

## Common UI Patterns

### Optimistic Updates
```tsx
'use client'
import { useOptimistic } from 'react'
import { toggleLike } from './actions'

export function LikeButton({ post }: { post: Post }) {
  const [optimisticLiked, addOptimistic] = useOptimistic(
    post.liked,
    (state) => !state
  )
  
  return (
    <form action={async () => {
      addOptimistic(null)
      await toggleLike(post.id)
    }}>
      <button type="submit">
        {optimisticLiked ? 'Liked' : 'Like'}
      </button>
    </form>
  )
}
```

### Image Optimization
```tsx
import Image from 'next/image'

// Always use next/image for images
export function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-square">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        priority={false} // true only for above-the-fold images
      />
    </div>
  )
}
```

### Link Navigation
```tsx
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Declarative
<Link href="/blog" prefetch={true}>Blog</Link>

// Programmatic (in 'use client' components)
const router = useRouter()
router.push('/dashboard')
router.replace('/login') // no history entry
```
