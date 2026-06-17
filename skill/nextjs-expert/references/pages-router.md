# Pages Router Reference

## Table of Contents
1. [File Structure](#file-structure)
2. [Data Fetching Methods](#data-fetching-methods)
3. [Dynamic Routes](#dynamic-routes)
4. [API Routes](#api-routes)
5. [Custom App & Document](#custom-app--document)
6. [Router & Navigation](#router--navigation)

---

## File Structure

```
pages/
├── _app.tsx          # Global app wrapper
├── _document.tsx     # HTML document template
├── index.tsx         # → /
├── about.tsx         # → /about
├── blog/
│   ├── index.tsx     # → /blog
│   └── [slug].tsx    # → /blog/:slug
└── api/
    └── users/
        ├── index.ts  # → GET/POST /api/users
        └── [id].ts   # → /api/users/:id
```

---

## Data Fetching Methods

### `getServerSideProps` — SSR (per request)
```tsx
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'

type Props = { user: User }

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { params, req, res, query } = context
  
  // Access cookies
  const token = req.cookies.token
  
  const user = await getUser(params?.id as string)
  if (!user) {
    return { notFound: true }
    // Or: return { redirect: { destination: '/login', permanent: false } }
  }
  
  return {
    props: { user },
    // No revalidate here — it re-runs every request
  }
}

export default function UserPage({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <UserProfile user={user} />
}
```

### `getStaticProps` — SSG + ISR
```tsx
import type { GetStaticProps } from 'next'

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale
  
  const posts = await getPosts()
  
  return {
    props: { posts },
    revalidate: 3600, // ISR: regenerate at most every hour
    // notFound: true  — returns 404
    // redirect: { destination: '/other', permanent: false }
  }
}
```

### `getStaticPaths` — required for dynamic SSG routes
```tsx
import type { GetStaticPaths } from 'next'

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPosts()
  
  return {
    paths: posts.map(p => ({ params: { slug: p.slug } })),
    fallback: false,      // 404 if not pre-built
    // fallback: true     // Build on-demand, show fallback first
    // fallback: 'blocking' // Build on-demand, SSR first visit
  }
}
```

### Client-side fetching — `useSWR`
```tsx
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function Dashboard() {
  const { data, error, isLoading } = useSWR('/api/dashboard', fetcher)
  
  if (isLoading) return <Skeleton />
  if (error) return <Error />
  return <DashboardContent data={data} />
}
```

---

## Dynamic Routes

```tsx
// pages/blog/[slug].tsx — matches /blog/hello-world
import { useRouter } from 'next/router'

export default function BlogPost() {
  const router = useRouter()
  const { slug } = router.query  // string | string[]
  // ...
}
```

### Catch-all routes
```
pages/docs/[...slug].tsx  → /docs/a/b/c → { slug: ['a', 'b', 'c'] }
pages/docs/[[...slug]].tsx → /docs too  → { slug: undefined }
```

---

## API Routes

```ts
// pages/api/users/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = User[] | { error: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'GET') {
    const users = await getUsers()
    return res.status(200).json(users)
  }
  
  if (req.method === 'POST') {
    const { name, email } = req.body
    const user = await createUser({ name, email })
    return res.status(201).json(user)
  }
  
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
```

### API middleware pattern
```ts
import type { NextApiHandler } from 'next'

function withAuth(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    // verify token...
    return handler(req, res)
  }
}

export default withAuth(async (req, res) => {
  res.json({ data: 'protected' })
})
```

---

## Custom App & Document

### `_app.tsx` — global layout, providers, styles
```tsx
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@/styles/globals.css'
import { useState } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())
  
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </QueryClientProvider>
  )
}
```

### `_document.tsx` — customize `<html>`, `<head>`, `<body>`
```tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Put persistent head tags here — not in _app */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

---

## Router & Navigation

```tsx
import { useRouter } from 'next/router'
import Link from 'next/link'

// Declarative navigation
<Link href="/about">About</Link>
<Link href={{ pathname: '/blog/[slug]', query: { slug: 'hello' } }}>Post</Link>

// Programmatic navigation
const router = useRouter()
router.push('/dashboard')
router.push('/search?q=nextjs')
router.replace('/login')  // no history entry
router.back()

// Route info
const { pathname, query, asPath, locale } = router

// Events
useEffect(() => {
  const handleStart = () => setLoading(true)
  const handleStop = () => setLoading(false)
  
  router.events.on('routeChangeStart', handleStart)
  router.events.on('routeChangeComplete', handleStop)
  
  return () => {
    router.events.off('routeChangeStart', handleStart)
    router.events.off('routeChangeComplete', handleStop)
  }
}, [router])
```
