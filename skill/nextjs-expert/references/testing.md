# Testing Reference

## Table of Contents
1. [Jest + React Testing Library](#jest--react-testing-library)
2. [Testing Server Components](#testing-server-components)
3. [Testing Server Actions](#testing-server-actions)
4. [Testing API Routes](#testing-api-routes)
5. [Playwright E2E](#playwright-e2e)
6. [Mocking Next.js Features](#mocking-nextjs-features)

---

## Jest + React Testing Library

### Setup
```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

```ts
// jest.config.ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
```

```ts
// jest.setup.ts
import '@testing-library/jest-dom'
```

### Testing a Client Component
```tsx
// components/__tests__/Counter.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from '../Counter'

describe('Counter', () => {
  it('increments on click', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={0} />)
    
    const button = screen.getByRole('button', { name: /increment/i })
    await user.click(button)
    
    expect(screen.getByText('1')).toBeInTheDocument()
  })
  
  it('accepts initial count', () => {
    render(<Counter initialCount={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})
```

---

## Testing Server Components

Server Components are async functions — test them like async functions:

```tsx
// app/blog/__tests__/page.test.tsx
import { render, screen } from '@testing-library/react'
import PostsPage from '../page'

// Mock fetch or data access layer
jest.mock('@/lib/posts', () => ({
  getPosts: jest.fn().mockResolvedValue([
    { id: '1', title: 'Hello World', slug: 'hello-world' },
  ]),
}))

describe('PostsPage', () => {
  it('renders post titles', async () => {
    // Render the async server component
    const page = await PostsPage()
    render(page)
    
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
```

### Mocking the data layer
```ts
// lib/__mocks__/db.ts
export const db = {
  post: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}
```

---

## Testing Server Actions

```ts
// app/posts/__tests__/actions.test.ts
import { createPost } from '../actions'

// Mock db
jest.mock('@/lib/db', () => ({
  db: {
    post: { create: jest.fn().mockResolvedValue({ id: '1', title: 'Test' }) },
  },
}))

// Mock Next.js cache functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

describe('createPost', () => {
  it('creates a post from FormData', async () => {
    const formData = new FormData()
    formData.append('title', 'My Post')
    
    const result = await createPost(null, formData)
    
    expect(result?.success).toBe(true)
  })
  
  it('returns error for empty title', async () => {
    const formData = new FormData()
    
    const result = await createPost(null, formData)
    
    expect(result?.error).toBeDefined()
  })
})
```

---

## Testing API Routes

### App Router Route Handlers
```ts
// app/api/posts/__tests__/route.test.ts
import { GET, POST } from '../route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/db')

describe('GET /api/posts', () => {
  it('returns posts array', async () => {
    const req = new NextRequest('http://localhost/api/posts')
    const response = await GET(req)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })
})

describe('POST /api/posts', () => {
  it('creates a post', async () => {
    const req = new NextRequest('http://localhost/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title: 'New Post' }),
      headers: { 'Content-Type': 'application/json' },
    })
    
    const response = await POST(req)
    expect(response.status).toBe(201)
  })
})
```

---

## Playwright E2E

```bash
npm install -D @playwright/test
npx playwright install
```

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  baseURL: 'http://localhost:3000',
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

```ts
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('user can sign in and see dashboard', async ({ page }) => {
  await page.goto('/login')
  
  await page.fill('[name="email"]', 'user@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
})

test('redirects unauthenticated users', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL('/login')
})
```

### Playwright auth fixture (reuse auth state)
```ts
// e2e/fixtures.ts
import { test as base } from '@playwright/test'

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Log in once
    await page.goto('/login')
    await page.fill('[name="email"]', 'user@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('[type="submit"]')
    await page.waitForURL('/dashboard')
    await use(page)
  },
})
```

---

## Mocking Next.js Features

### Mock `next/navigation`
```ts
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/current-path'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({ id: '123' })),
  redirect: jest.fn(),
  notFound: jest.fn(),
}))
```

### Mock `next/headers`
```ts
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn((name: string) => ({ name, value: 'mock-value' })),
    set: jest.fn(),
    delete: jest.fn(),
  })),
  headers: jest.fn(() => ({
    get: jest.fn(),
  })),
}))
```

### Mock `next/cache`
```ts
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: jest.fn((fn) => fn), // pass-through
}))
```
