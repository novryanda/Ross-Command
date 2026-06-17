# Authentication Patterns Reference

## Table of Contents
1. [NextAuth.js / Auth.js v5](#nextauthjs--authjs-v5)
2. [Middleware-based Protection](#middleware-based-protection)
3. [Server Component Auth](#server-component-auth)
4. [Clerk (third-party)](#clerk-third-party)
5. [Manual JWT / Session](#manual-jwt--session)

---

## NextAuth.js / Auth.js v5

Auth.js v5 (NextAuth) is the most common solution. It supports OAuth, email, credentials, and more.

### Installation & Config
```bash
npm install next-auth@beta
npx auth secret  # generates AUTH_SECRET
```

```ts
// auth.ts (root of project)
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub,
    Google,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await getUserByEmail(credentials.email as string)
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        return valid ? user : null
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role
      return token
    },
    session({ session, token }) {
      session.user.role = token.role
      return session
    },
  },
})
```

```ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

### Sign in / Sign out
```tsx
// Server Action
import { signIn, signOut } from '@/auth'

// Sign in button
<form action={async () => { 'use server'; await signIn('github') }}>
  <button>Sign in with GitHub</button>
</form>

// Sign out button
<form action={async () => { 'use server'; await signOut() }}>
  <button>Sign out</button>
</form>
```

### Get session
```tsx
// Server Component
import { auth } from '@/auth'

export default async function Page() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return <Dashboard user={session.user} />
}

// Client Component
'use client'
import { useSession } from 'next-auth/react'

export function UserMenu() {
  const { data: session, status } = useSession()
  if (status === 'loading') return <Skeleton />
  if (!session) return <SignInButton />
  return <Avatar user={session.user} />
}
```

---

## Middleware-based Protection

The recommended pattern for route-level protection. Runs at the edge before the page renders.

```ts
// middleware.ts
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isAuthenticated = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/login')
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard')
  
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### Role-based access
```ts
export default auth((req) => {
  const session = req.auth
  
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (session?.user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/403', req.url))
    }
  }
})
```

---

## Server Component Auth

Always verify auth in Server Components for sensitive data — don't rely solely on middleware redirects.

```tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const session = await auth()
  
  // Defense in depth — check even if middleware should have caught this
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'admin') redirect('/403')
  
  const data = await getAdminData() // safe to fetch
  return <AdminDashboard data={data} />
}
```

### Auth helper to DRY up checks
```ts
// lib/auth-helpers.ts
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return session
}

export async function requireRole(role: string) {
  const session = await requireAuth()
  if (session.user.role !== role) redirect('/403')
  return session
}
```

---

## Clerk (third-party)

Clerk is a popular hosted auth solution with great Next.js integration.

```bash
npm install @clerk/nextjs
```

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

```tsx
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html><body>{children}</body></html>
    </ClerkProvider>
  )
}
```

```tsx
// Components
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

<SignedOut>
  <SignInButton />
</SignedOut>
<SignedIn>
  <UserButton />
</SignedIn>
```

---

## Manual JWT / Session

For custom implementations without a library.

```ts
// lib/session.ts
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
  
  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function getSession() {
  const token = cookies().get('session')?.value
  if (!token) return null
  
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}
```

```tsx
// Server Action login
'use server'
import { createSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const user = await validateCredentials(
    formData.get('email') as string,
    formData.get('password') as string,
  )
  if (!user) return { error: 'Invalid credentials' }
  
  await createSession(user.id)
  redirect('/dashboard')
}
```
