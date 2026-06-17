# Better Auth — Database Adapters Reference

## Raw Database Drivers

### SQLite
```ts
import Database from "better-sqlite3";
export const auth = betterAuth({
  database: new Database("./sqlite.db"),
});
```

### PostgreSQL
```ts
import { Pool } from "pg";
export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
});
```

### MySQL
```ts
import { createPool } from "mysql2/promise";
export const auth = betterAuth({
  database: createPool({ uri: process.env.DATABASE_URL }),
});
```

---

## ORM Adapters

### Drizzle ORM
```ts
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql" | "sqlite"
  }),
});
```

### Prisma
```ts
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql" | "sqlite"
  }),
});
```

After configuring, run:
```bash
npx @better-auth/cli generate  # creates Prisma schema additions
npx prisma migrate dev         # apply to DB
```

### MongoDB
```ts
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "@/db"; // MongoClient instance

export const auth = betterAuth({
  database: mongodbAdapter(client),
});
```

---

## Secondary Storage (Redis / KV)

Use secondary storage for sessions and rate limits in production/serverless:

```ts
import { betterAuth } from "better-auth";
import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

export const auth = betterAuth({
  secondaryStorage: {
    get: async (key) => {
      const val = await redis.get(key);
      return val ? JSON.parse(val) : null;
    },
    set: async (key, value, ttl) => {
      if (ttl) await redis.setex(key, ttl, JSON.stringify(value));
      else await redis.set(key, JSON.stringify(value));
    },
    delete: async (key) => { await redis.del(key); },
  },
  rateLimit: {
    storage: "secondary-storage", // use Redis for rate limits
  },
});
```

---

## Schema Management CLI

```bash
# Generate ORM schema or SQL migration file
npx @better-auth/cli generate

# Apply migration directly (Kysely adapter only)
npx @better-auth/cli migrate

# Re-run after adding any plugin that requires new tables
```
