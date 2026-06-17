# Next.js 16 - New Features Reference

Next.js 16 was released in October 2025. This documents the major changes from v15.

## Cache Components (New in 16)

Next.js 16 introduces a new `use cache` directive and Cache Components for Partial Pre-Rendering (PPR).

```tsx
// New 'use cache' directive - cache entire components or functions
async function CachedComponent() {
  'use cache'
  const data = await fetchExpensiveData()
  return <div>{data.title}</div>
}

// Cache with revalidation
async function getProducts() {
  'use cache'
  cacheLife('hours') // revalidate every hour
  cacheTag('products') // tag for manual revalidation
  return db.product.findMany()
}
```

**vs. Next.js 15 fetch cache:**
- v15: Cache is per-request via `fetch()` options
- v16: Cache can be per-component or per-function with `use cache`

## Partial Pre-Rendering (PPR) - Stable

PPR is now stable in Next.js 16. Pages can mix static and dynamic content.

```tsx
// next.config.ts
export default {
  experimental: {
    ppr: true, // or 'incremental' for opt-in per route
  }
}
```

```tsx
// A page with both static and dynamic parts
import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'

// Static shell renders at build time
export default function ProductPage({ params }) {
  return (
    <div>
      <StaticHeader />                         {/* Pre-rendered */}
      <Suspense fallback={<Skeleton />}>
        <DynamicRecommendations />             {/* Streamed at request time */}
      </Suspense>
    </div>
  )
}

async function DynamicRecommendations() {
  noStore() // opt out of caching
  const recs = await getPersonalizedRecs()
  return <RecommendationsList items={recs} />
}
```

## TypeScript Config (next.config.ts)

```ts
// next.config.ts - now use .ts extension (v15+, stable in v16)
import type { NextConfig } from 'next'

const config: NextConfig = {
  experimental: {
    ppr: true,
    reactCompiler: true,
    typedRoutes: true,     // Typed Link hrefs
  },
  turbopack: {             // Top-level turbopack key (moved from experimental.turbo)
    rules: {
      '*.svg': { loaders: ['@svgr/webpack'], as: '*.js' }
    }
  }
}

export default config
```

## Typed Routes (v15.5+)

When `typedRoutes: true` is set, `next/link` and `useRouter` get typed `href` values.

```tsx
// TypeScript will catch invalid routes
<Link href="/blog/[slug]" /> // Error: missing param
<Link href={{ pathname: '/blog/[slug]', params: { slug: 'hello' } }} /> // [OK]
```

## Node.js Middleware (Stable in v15.5)

Middleware can now use the full Node.js runtime (no longer Edge-only).

```ts
// middleware.ts
export const config = {
  matcher: '/api/:path*',
  runtime: 'nodejs', // explicitly use Node.js
}
```

## React 19 Features Available

Next.js 15+ uses React 19. Key APIs available:

```tsx
// useActionState - replaces useFormState
import { useActionState } from 'react'

// useOptimistic - optimistic UI
import { useOptimistic } from 'react'

// use() - read promises and context in render
import { use } from 'react'
const data = use(fetchPromise) // suspends until resolved

// React Compiler (experimental) - auto-memoization
// Enable with experimental.reactCompiler: true in next.config.ts
// No more manual memo/useCallback for most cases
```

## Turbopack Builds (Beta in v15.5, improving in v16)

```bash
# Use Turbopack for builds (beta)
next build --turbopack

# Dev server (stable since v15)
next dev --turbopack
```

## Upgrade Notes (v14 -> v15 -> v16)

### v15 Breaking Changes
- `params` and `searchParams` are now Promises - must `await` them
- `fetch` is NOT cached by default (was cached in v14)
- `cookies()`, `headers()`, `draftMode()` are now async

```tsx
// v14
export default function Page({ params }: { params: { id: string } }) {
  console.log(params.id) // [OK] v14
}

// v15+ 
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params // [OK] v15+
}
```

### v16 Deprecations
- `legacyBehavior` prop on `<Link>` - removed
- AMP support - removed
- `next lint` CLI command - deprecated (use ESLint directly)
