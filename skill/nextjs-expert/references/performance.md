# Performance Reference

## Table of Contents
1. [Image Optimization](#image-optimization)
2. [Font Optimization](#font-optimization)
3. [Script Optimization](#script-optimization)
4. [Bundle Analysis & Code Splitting](#bundle-analysis--code-splitting)
5. [Core Web Vitals](#core-web-vitals)
6. [Caching Strategy](#caching-strategy)
7. [Edge Runtime](#edge-runtime)

---

## Image Optimization

Always use `next/image` — it handles lazy loading, WebP/AVIF conversion, responsive sizing, and prevents layout shift.

```tsx
import Image from 'next/image'

// Fixed size (know exact dimensions)
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={630}
  priority // LCP image — load eagerly
/>

// Fill parent container
<div className="relative h-64 w-full">
  <Image
    src="/banner.jpg"
    alt="Banner"
    fill
    sizes="100vw"
    className="object-cover"
  />
</div>

// Responsive with sizes hint (critical for performance)
<Image
  src="/product.jpg"
  alt="Product"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### Remote images — configure allowed domains
```ts
// next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        pathname: '/images/**',
      },
    ],
  },
}
```

### Common mistakes
- ❌ Forgetting `sizes` on responsive images — browser downloads full-size image
- ❌ Using `priority` on every image — defeats the purpose
- ❌ `fill` without `position: relative` on parent

---

## Font Optimization

`next/font` eliminates layout shift (CLS) and keeps fonts private (no Google Fonts network request from browser).

```tsx
// app/layout.tsx
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '700'],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

### Local fonts
```tsx
import localFont from 'next/font/local'

const myFont = localFont({
  src: [
    { path: './fonts/MyFont-Regular.woff2', weight: '400' },
    { path: './fonts/MyFont-Bold.woff2', weight: '700' },
  ],
  variable: '--font-my-font',
})
```

---

## Script Optimization

```tsx
import Script from 'next/script'

// Strategy options:
// 'beforeInteractive' — before page hydrates (use sparingly)
// 'afterInteractive' — after hydration (default, e.g. analytics)
// 'lazyOnload' — browser idle time (e.g. chat widgets)
// 'worker' — offload to web worker (experimental)

<Script
  src="https://www.googletagmanager.com/gtag/js"
  strategy="afterInteractive"
  onLoad={() => console.log('GA loaded')}
/>
```

---

## Bundle Analysis & Code Splitting

### Analyze bundle
```bash
npm install @next/bundle-analyzer
```

```ts
// next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer({ /* next config */ })
```

```bash
ANALYZE=true npm run build
```

### Dynamic imports (code splitting)
```tsx
import dynamic from 'next/dynamic'

// Basic lazy loading
const HeavyChart = dynamic(() => import('./HeavyChart'))

// With loading state
const Map = dynamic(() => import('./Map'), {
  loading: () => <MapSkeleton />,
  ssr: false, // Disable SSR (for browser-only libs like Leaflet)
})

// Named exports
const { SpecificComponent } = dynamic(
  () => import('./components').then(mod => mod.SpecificComponent)
)
```

### When to use dynamic imports:
- Components only shown on user interaction (modals, drawers)
- Heavy visualization libraries (charts, maps)
- Browser-only code (localStorage, canvas)
- Large third-party components that affect initial load

---

## Core Web Vitals

### LCP (Largest Contentful Paint) — target < 2.5s
- Add `priority` to above-the-fold images
- Preload critical assets
- Use Server Components to reduce JS
- Avoid render-blocking resources

### CLS (Cumulative Layout Shift) — target < 0.1
- Always specify `width`/`height` on `<Image>`
- Use `font-display: swap` (next/font handles this)
- Reserve space for dynamic content (skeleton loaders)
- Avoid inserting content above existing content

### FID/INP (Interaction to Next Paint) — target < 200ms
- Minimize JS on main thread
- Use Server Actions instead of client-side mutations
- Defer non-critical JS with `lazyOnload`
- Use web workers for heavy computation

### Measuring in dev
```tsx
// app/layout.tsx — report Web Vitals
export function reportWebVitals(metric) {
  console.log(metric) // or send to analytics
}
```

Or use Next.js Speed Insights:
```bash
npm install @vercel/speed-insights
```
```tsx
import { SpeedInsights } from '@vercel/speed-insights/next'
// Add <SpeedInsights /> to root layout
```

---

## Caching Strategy

### Full caching hierarchy (App Router)
```
Request
  ↓
Router Cache (client-side, in-memory)
  ↓
Full Route Cache (server-side, persistent)
  ↓
Data Cache (fetch() cache)
  ↓
Request Memoization (per-render dedup)
```

### Making a route fully static vs dynamic
```ts
// Force static
export const dynamic = 'force-static'
export const revalidate = false // never revalidate

// Force dynamic (per-request)
export const dynamic = 'force-dynamic'
// OR use cookies(), headers(), searchParams — these opt into dynamic automatically
```

### Opting out of caching selectively
```tsx
import { cookies } from 'next/headers'

// This makes the entire route dynamic:
async function Page() {
  const cookieStore = cookies() // dynamic signal
  const token = cookieStore.get('token')
  // ...
}
```

---

## Edge Runtime

Run routes closer to users. Ideal for middleware, auth checks, geo-routing.

```ts
// app/api/hello/route.ts
export const runtime = 'edge'

export async function GET() {
  return new Response('Hello from the edge!')
}
```

**Edge limitations** — no Node.js APIs:
- No `fs`, `path`, `crypto` (use Web Crypto API)
- No native Node.js modules
- Cold starts are minimal (~0ms vs ~100ms for Node.js)
- Max bundle size: 4MB

**Use edge for**: middleware, auth validation, A/B testing, geo-redirects, simple API responses.

**Keep on Node.js**: database queries (connection pooling), file processing, heavy computation.
