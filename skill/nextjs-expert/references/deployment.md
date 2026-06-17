# Deployment Reference

## Table of Contents
1. [Vercel (recommended)](#vercel-recommended)
2. [Docker / Self-hosted](#docker--self-hosted)
3. [Environment Variables](#environment-variables)
4. [next.config.ts Essentials](#nextconfigts-essentials)
5. [Output Modes](#output-modes)

---

## Vercel (recommended)

Zero-config deployment for Next.js. Push to Git, deploy automatically.

```bash
npm install -g vercel
vercel  # follow prompts
vercel --prod  # deploy to production
```

### Key Vercel features for Next.js:
- **ISR** works out of the box — each revalidated page is stored at the edge
- **Edge Functions** — automatic for `runtime = 'edge'` routes
- **Image Optimization** — handled by Vercel's CDN
- **Analytics** — add `@vercel/analytics` and `@vercel/speed-insights`

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

---

## Docker / Self-hosted

### Standalone output (smallest Docker image)
```ts
// next.config.ts
const config = {
  output: 'standalone',
}
```

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
    restart: unless-stopped
```

### Behind a reverse proxy (nginx)
```nginx
server {
  listen 80;
  server_name example.com;
  
  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

---

## Environment Variables

### Naming conventions
```bash
# Server-only (default) — never exposed to browser
DATABASE_URL=postgres://...
JWT_SECRET=supersecret
API_SECRET_KEY=...

# Public (exposed to browser) — MUST start with NEXT_PUBLIC_
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Files
```
.env                  # loaded in all environments
.env.local            # local overrides, NEVER commit
.env.development      # dev only
.env.production       # prod only
.env.test             # test only
```

### Accessing variables
```ts
// Server-only
const db = new PrismaClient({ url: process.env.DATABASE_URL })

// Client (must be NEXT_PUBLIC_)
const apiUrl = process.env.NEXT_PUBLIC_API_URL

// Type safety with T3 env validation
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
})
```

---

## next.config.ts Essentials

```ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  // Output mode
  output: 'standalone', // for Docker

  // Image domains
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.example.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true,  // 308 — SEO-friendly
      },
    ]
  },

  // Rewrites (proxy without redirect)
  async rewrites() {
    return [
      {
        source: '/api/legacy/:path*',
        destination: 'https://legacy-api.example.com/:path*',
      },
    ]
  },

  // Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },

  // Experimental
  experimental: {
    ppr: true, // Partial Pre-rendering (Next.js 14+)
  },
}

export default config
```

---

## Output Modes

| Mode | Config | Use Case |
|------|--------|----------|
| Default | (none) | Node.js server, full features |
| `standalone` | `output: 'standalone'` | Docker, minimal image |
| `export` | `output: 'export'` | Pure static HTML, no SSR/ISR |

### Static export limitations (`output: 'export'`)
- No Server Components with dynamic data
- No Route Handlers that depend on request
- No Middleware
- No ISR

Good for: documentation sites, marketing pages, apps deployed to S3/Cloudflare Pages.
