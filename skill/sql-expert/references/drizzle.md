# Drizzle ORM — Query Reference

Drizzle adalah SQL-first ORM — sintaksnya sangat dekat dengan SQL mentah, cocok untuk developer yang familiar dengan SQL.

## Setup

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)
```

---

## Schema Definition

```typescript
import { pgTable, serial, varchar, integer, timestamp, boolean, decimal, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at')
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
  activeIdx: index('active_idx').on(table.isActive, table.createdAt)
}))

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  authorId: integer('author_id').references(() => users.id),
  publishedAt: timestamp('published_at')
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts)
}))

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] })
}))
```

---

## CRUD

```typescript
import { eq, and, or, like, gte, lte, inArray, isNull, sql } from 'drizzle-orm'

// Insert
const [user] = await db.insert(users)
  .values({ name: 'Budi', email: 'budi@example.com' })
  .returning()

// Insert many
await db.insert(users).values([
  { name: 'A', email: 'a@example.com' },
  { name: 'B', email: 'b@example.com' }
])

// Select
const allUsers = await db.select().from(users)

// Select kolom spesifik
const userNames = await db
  .select({ id: users.id, name: users.name })
  .from(users)

// Where
const activeUsers = await db
  .select()
  .from(users)
  .where(
    and(
      eq(users.isActive, true),
      isNull(users.deletedAt),
      gte(users.createdAt, new Date('2024-01-01'))
    )
  )
  .orderBy(desc(users.createdAt))
  .limit(20)
  .offset(0)

// Update
await db.update(users)
  .set({ name: 'Updated', updatedAt: new Date() })
  .where(eq(users.id, 1))

// Delete
await db.delete(users).where(eq(users.id, 1))
```

---

## JOIN

```typescript
import { desc, asc, count, sum, avg } from 'drizzle-orm'

// Inner Join
const postsWithAuthor = await db
  .select({
    postId: posts.id,
    title: posts.title,
    authorName: users.name,
    authorEmail: users.email
  })
  .from(posts)
  .innerJoin(users, eq(posts.authorId, users.id))
  .where(isNull(users.deletedAt))

// Left Join
const usersWithPostCount = await db
  .select({
    userId: users.id,
    name: users.name,
    postCount: count(posts.id)
  })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId))
  .groupBy(users.id, users.name)
  .orderBy(desc(count(posts.id)))
```

---

## Aggregasi

```typescript
const stats = await db
  .select({
    categoryId: orders.categoryId,
    totalRevenue: sum(orders.total),
    orderCount: count(orders.id),
    avgOrder: avg(orders.total)
  })
  .from(orders)
  .where(eq(orders.status, 'COMPLETED'))
  .groupBy(orders.categoryId)
  .having(gte(sum(orders.total), 1000000))
  .orderBy(desc(sum(orders.total)))
```

---

## Subquery & CTE

```typescript
// Subquery
const subquery = db
  .select({ userId: orders.userId, total: sum(orders.total).as('ltv') })
  .from(orders)
  .groupBy(orders.userId)
  .as('user_ltv')

const highValueUsers = await db
  .select()
  .from(users)
  .innerJoin(subquery, eq(users.id, subquery.userId))
  .where(gte(subquery.ltv, 5000000))

// CTE (with)
import { with: withCTE } from 'drizzle-orm'

const rankedOrders = db.$with('ranked_orders').as(
  db.select({
    userId: orders.userId,
    orderId: orders.id,
    total: orders.total,
    rn: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${orders.userId} ORDER BY ${orders.createdAt} DESC)`.as('rn')
  })
  .from(orders)
)

const result = await db
  .with(rankedOrders)
  .select()
  .from(rankedOrders)
  .where(eq(rankedOrders.rn, 1))
```

---

## Raw SQL dengan Drizzle

```typescript
// Untuk query yang sangat kompleks
const result = await db.execute(sql`
  SELECT 
    u.id,
    u.name,
    COUNT(o.id) as order_count,
    SUM(o.total) FILTER (WHERE o.status = 'COMPLETED') as revenue
  FROM users u
  LEFT JOIN orders o ON o.user_id = u.id
  WHERE u.created_at >= ${startDate}
  GROUP BY u.id, u.name
  HAVING COUNT(o.id) >= ${minOrders}
`)

// sql helper untuk ekspresi dinamis
const searchTerm = '%laptop%'
const products = await db
  .select()
  .from(products)
  .where(
    or(
      like(products.name, sql`${searchTerm}`),
      sql`to_tsvector('english', ${products.description}) @@ plainto_tsquery('english', ${keyword})`
    )
  )
```

---

## Transactions

```typescript
const result = await db.transaction(async (tx) => {
  const [order] = await tx.insert(orders)
    .values({ userId, total })
    .returning()

  await tx.update(inventory)
    .set({ quantity: sql`${inventory.quantity} - 1` })
    .where(inArray(inventory.productId, productIds))

  return order
})
```

---

## Upsert

```typescript
await db.insert(userSettings)
  .values({ userId, key: 'theme', value: 'dark' })
  .onConflictDoUpdate({
    target: [userSettings.userId, userSettings.key],
    set: { value: 'dark', updatedAt: new Date() }
  })
```
