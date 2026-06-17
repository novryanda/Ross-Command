# Next.js Project Structure Reference

## Table of Contents
1. [Root-Level Files](#root-level-files)
2. [src/ Directory Layout](#src-directory-layout)
3. [App Router Special Files](#app-router-special-files)
4. [Route Conventions](#route-conventions)
5. [Component Organization](#component-organization)
6. [Feature-Based Scaling](#feature-based-scaling)

---

## Root-Level Files

```
my-next-app/
|-- public/                    # Served at / (e.g. /logo.png)
|   |-- favicon.ico
|   |-- robots.txt
|   `-- assets/
|       |-- images/
|       |-- fonts/
|       `-- svgs/
|
|-- src/                       # All application code
|
|-- .env                       # Shared env (careful: committed)
|-- .env.local                 # Local overrides (git-ignored)
|-- .env.development           # Dev-only vars
|-- .env.production            # Prod-only vars
|-- .env.example               # Template (always commit this)
|
|-- next.config.ts             # Next.js configuration (use .ts in v15+)
|-- tsconfig.json              # TypeScript config
|-- eslint.config.mjs          # ESLint flat config (v15+)
|-- tailwind.config.ts         # Tailwind (if used)
|-- postcss.config.mjs         # PostCSS (if used)
|-- package.json
`-- .gitignore
```

**Important:**
- `public/` must stay at root - never move inside `src/`
- `.env.*` files stay at root
- Config files stay at root

---

## src/ Directory Layout

```
src/
|-- app/                       # App Router (Next.js 13+)
|-- components/                # Shared UI components
|-- hooks/                     # Custom React hooks
|-- lib/                       # Utilities, helpers, API clients
|-- stores/                    # State management
|-- types/                     # Global TypeScript types
|-- providers/                 # React context providers
|-- styles/                    # Additional CSS files
`-- middleware.ts              # Edge/Node.js middleware
```

---

## App Router Special Files

Inside `src/app/`, these filenames have special meaning:

| File            | Purpose                                              |
|-----------------|------------------------------------------------------|
| `layout.tsx`    | Shared UI wrapping child routes (persistent)         |
| `page.tsx`      | Unique UI for a route - makes route publicly visible |
| `loading.tsx`   | Automatic Suspense boundary loading skeleton         |
| `error.tsx`     | Error boundary UI (must be `'use client'`)           |
| `not-found.tsx` | Rendered when `notFound()` is called                 |
| `route.ts`      | API Route Handler (GET, POST, PUT, DELETE, etc.)     |
| `template.tsx`  | Like layout, but re-renders on navigation            |
| `default.tsx`   | Fallback for parallel routes                         |

**Root layout must include `<html>` and `<body>` tags:**
```tsx
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

---

## Route Conventions

### Static Routes
```
src/app/page.tsx              -> /
src/app/about/page.tsx        -> /about
src/app/blog/page.tsx         -> /blog
src/app/blog/[slug]/page.tsx  -> /blog/:slug
```

### Route Groups (no URL impact)
```
src/app/(auth)/login/page.tsx    -> /login
src/app/(auth)/register/page.tsx -> /register
src/app/(main)/dashboard/page.tsx -> /dashboard
```
Groups let you share layouts within a group without affecting the URL.

### Private Folders (non-routable)
```
src/app/blog/_components/PostCard.tsx  -> not a route
src/app/blog/_utils/format.ts          -> not a route
```
Prefix folder with `_` to opt it out of routing.

### Dynamic Routes
```
[slug]        -> single segment: /blog/hello-world
[...slug]     -> catch-all: /shop/clothing/shirts
[[...slug]]   -> optional catch-all: /docs and /docs/getting-started
```

### Parallel Routes
```
src/app/@sidebar/page.tsx    -> slot named "sidebar"
src/app/@main/page.tsx       -> slot named "main"
```

### Intercepting Routes
```
(.)route      -> intercept same level
(..)route     -> intercept one level up
(...)route    -> intercept from root
```

---

## Component Organization

### By type (small/medium projects)
```
src/components/
|-- ui/                    # Primitives: Button, Input, Modal, Badge...
|   |-- button.tsx
|   |-- input.tsx
|   `-- modal.tsx
`-- features/              # Domain: UserCard, PostList, CheckoutForm...
    |-- user/
    |   |-- UserCard.tsx
    |   `-- UserAvatar.tsx
    `-- blog/
        |-- PostList.tsx
        `-- PostCard.tsx
```

### By feature (large projects)
```
src/features/
|-- auth/
|   |-- components/       # LoginForm, RegisterForm
|   |-- hooks/            # useAuth
|   |-- actions.ts        # Server Actions
|   `-- types.ts
|-- blog/
|   |-- components/
|   |-- hooks/
|   `-- types.ts
`-- dashboard/
    |-- components/
    `-- hooks/
```

---

## Feature-Based Scaling

As the project grows, organize by domain/feature:

```
src/
|-- app/                          # Only routing concerns
|   |-- (auth)/
|   |   `-- login/page.tsx        # Thin page - delegates to feature
|   `-- dashboard/page.tsx
|
|-- features/                     # Business logic & UI by domain
|   |-- auth/
|   |   |-- components/
|   |   |   |-- LoginForm.tsx
|   |   |   `-- RegisterForm.tsx
|   |   |-- hooks/
|   |   |   `-- useSession.ts
|   |   |-- actions.ts            # 'use server' Server Actions
|   |   |-- schemas.ts            # Zod validation schemas
|   |   `-- types.ts
|   `-- products/
|       |-- components/
|       |-- hooks/
|       `-- api.ts                # Data fetching functions
|
|-- shared/                       # Cross-feature shared code
|   |-- components/ui/            # Design system primitives
|   |-- hooks/                    # useDebounce, useMediaQuery...
|   `-- utils/                    # cn(), formatDate(), etc.
|
`-- lib/                          # External integrations
    |-- db.ts                     # Prisma / Drizzle client
    |-- auth.ts                   # Better Auth / NextAuth config
    `-- email.ts                  # Resend / Nodemailer
```

**Pattern - thin page files:**
```tsx
// src/app/products/[id]/page.tsx
import { ProductDetail } from '@/features/products/components/ProductDetail'

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductDetail id={params.id} />
}
```
Pages are thin - they just wire up routes to feature components.
