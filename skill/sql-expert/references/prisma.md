# Prisma ORM — Query Reference

## Setup
```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```

---

## CRUD Dasar

```typescript
// Create
const user = await prisma.user.create({
  data: { name: 'Budi', email: 'budi@example.com' }
})

// Find one
const user = await prisma.user.findUnique({
  where: { id: 1 }
})

// Find many dengan filter
const users = await prisma.user.findMany({
  where: {
    AND: [
      { isActive: true },
      { createdAt: { gte: new Date('2024-01-01') } }
    ]
  },
  orderBy: { createdAt: 'desc' },
  skip: 0,
  take: 20
})

// Update
const updated = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Budi Updated' }
})

// Upsert
const upserted = await prisma.user.upsert({
  where: { email: 'budi@example.com' },
  update: { name: 'Budi' },
  create: { name: 'Budi', email: 'budi@example.com' }
})

// Delete
await prisma.user.delete({ where: { id: 1 } })
```

---

## Relasi & Include

```typescript
// Include relasi (eager loading — hindari N+1)
const posts = await prisma.post.findMany({
  include: {
    author: { select: { name: true, email: true } },
    comments: {
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
      take: 5
    },
    _count: { select: { likes: true } }
  }
})

// Nested create
const post = await prisma.post.create({
  data: {
    title: 'Hello World',
    author: { connect: { id: userId } },
    tags: {
      connectOrCreate: tags.map(tag => ({
        where: { name: tag },
        create: { name: tag }
      }))
    }
  }
})
```

---

## Filtering Lanjutan

```typescript
// OR condition
const results = await prisma.product.findMany({
  where: {
    OR: [
      { name: { contains: 'laptop', mode: 'insensitive' } },
      { description: { contains: 'laptop', mode: 'insensitive' } }
    ],
    price: { gte: 1000000, lte: 5000000 },
    categoryId: { in: [1, 2, 3] },
    deletedAt: null
  }
})

// Relasi filter
const usersWithPosts = await prisma.user.findMany({
  where: {
    posts: {
      some: { // at least one post matches
        published: true,
        createdAt: { gte: new Date('2024-01-01') }
      }
    }
  }
})
```

---

## Aggregasi

```typescript
// Count, sum, avg, min, max
const stats = await prisma.order.aggregate({
  where: { userId: 1 },
  _count: { id: true },
  _sum: { total: true },
  _avg: { total: true },
  _min: { total: true },
  _max: { total: true }
})

// Group by
const salesByCategory = await prisma.order.groupBy({
  by: ['categoryId'],
  where: { status: 'COMPLETED' },
  _sum: { total: true },
  _count: { id: true },
  having: {
    total: { _sum: { gt: 1000000 } }
  },
  orderBy: { _sum: { total: 'desc' } }
})
```

---

## Raw Query (`$queryRaw`)

Gunakan ketika Prisma tidak support query yang dibutuhkan:

```typescript
// Raw query dengan parameter (SELALU gunakan Prisma.sql atau $queryRaw template literal)
const users = await prisma.$queryRaw<User[]>`
  SELECT u.*, 
    COUNT(o.id) as order_count,
    COALESCE(SUM(o.total), 0) as lifetime_value
  FROM users u
  LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'COMPLETED'
  WHERE u.created_at >= ${startDate}
  GROUP BY u.id
  HAVING COUNT(o.id) > ${minOrders}
  ORDER BY lifetime_value DESC
  LIMIT ${limit}
`

// Execute (untuk INSERT/UPDATE/DELETE raw)
const result = await prisma.$executeRaw`
  UPDATE users SET last_seen = NOW() WHERE id = ${userId}
`
```

**⚠️ JANGAN gunakan string interpolasi biasa di `$queryRaw` — selalu gunakan template literal untuk keamanan.**

---

## Transactions

```typescript
// Interactive transaction (bisa pakai prisma client di dalamnya)
const result = await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({
    data: { userId, total }
  })
  
  await tx.inventory.updateMany({
    where: { productId: { in: productIds } },
    data: { reserved: { increment: 1 } }
  })
  
  return order
})

// Batch transaction (lebih performant untuk operasi independen)
const [users, posts] = await prisma.$transaction([
  prisma.user.findMany(),
  prisma.post.findMany()
])
```

---

## Cursor-based Pagination

```typescript
// Halaman pertama
const firstPage = await prisma.post.findMany({
  take: 20,
  orderBy: { id: 'asc' }
})

// Halaman berikutnya
const nextPage = await prisma.post.findMany({
  take: 20,
  skip: 1,
  cursor: { id: lastId },
  orderBy: { id: 'asc' }
})
```

---

## Select Spesifik (Performa)

```typescript
// Jangan SELECT * — pilih kolom yang dibutuhkan
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    _count: { select: { posts: true } }
  }
})
```
