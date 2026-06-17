# Better Auth — Framework Integration Patterns

## Next.js — App Router

```ts
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
export const { POST, GET } = toNextJsHandler(auth);
```

**Server component session access:**
```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
const session = await auth.api.getSession({ headers: await headers() });
```

---

## Next.js — Pages Router

```ts
// pages/api/auth/[...all].ts
import { auth } from "@/lib/auth";
import { toNodeHandler } from "better-auth/node";
export const config = { api: { bodyParser: false } };
export default toNodeHandler(auth.handler);
```

---

## Nuxt

```ts
// server/api/auth/[...all].ts
import { auth } from "~/utils/auth";
export default defineEventHandler((event) => {
  return auth.handler(toWebRequest(event));
});
```

---

## SvelteKit

```ts
// hooks.server.ts
import { auth } from "$lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from '$app/environment';

export async function handle({ event, resolve }) {
  return svelteKitHandler({ event, resolve, auth, building });
}
```

---

## Hono

```ts
import { Hono } from "hono";
import { auth } from "./auth";
import { cors } from "hono/cors";

const app = new Hono();
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));
```

---

## Express

```ts
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";

const app = express();
// ⚠️ Mount before express.json()
app.all("/api/auth/*", toNodeHandler(auth));
// Express v5: app.all('/api/auth/{*any}', toNodeHandler(auth));
app.use(express.json());
```

---

## Elysia

```ts
import { Elysia } from "elysia";
import { auth } from "./auth";

const app = new Elysia()
  .all("/api/auth/*", (ctx) => {
    if (["POST", "GET"].includes(ctx.request.method)) {
      return auth.handler(ctx.request);
    }
    ctx.error(405);
  })
  .listen(3000);
```

---

## Astro

```ts
// pages/api/auth/[...all].ts
import type { APIRoute } from "astro";
import { auth } from "@/auth";

export const GET: APIRoute = async (ctx) => auth.handler(ctx.request);
export const POST: APIRoute = async (ctx) => auth.handler(ctx.request);
```

---

## Solid Start

```ts
// routes/api/auth/*all.ts
import { auth } from "~/lib/auth";
import { toSolidStartHandler } from "better-auth/solid-start";
export const { GET, POST } = toSolidStartHandler(auth);
```

---

## TanStack Start

```ts
// src/routes/api/auth/$.ts
import { auth } from '@/lib/auth';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => auth.handler(request),
      POST: async ({ request }) => auth.handler(request),
    },
  },
});
```

> Requires `tanstackStartCookies()` as last plugin — see `references/plugins.md`

---

## Cloudflare Workers

```ts
// src/index.ts
import { auth } from "./auth";

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/auth")) {
      return auth.handler(request);
    }
    return new Response("Not found", { status: 404 });
  },
};
```

```toml
# wrangler.toml — REQUIRED for AsyncLocalStorage
compatibility_flags = ["nodejs_compat"]
compatibility_date = "2024-09-23"
```

---

## NestJS

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Mount Better Auth before NestJS middleware
  app.use('/api/auth/*', toNodeHandler(auth));
  await app.listen(3000);
}
```

---

## Expo (React Native)

```ts
// app/api/auth/[...all]+api.ts
import { auth } from '@/lib/server/auth';
const handler = auth.handler;
export { handler as GET, handler as POST };
```

Client setup with secure storage:
```ts
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: "http://localhost:8081",
  plugins: [expoClient({
    scheme: "myapp",
    storagePrefix: "myapp",
    storage: SecureStore,
  })],
});
```

Trusted origins for Expo dev:
```ts
trustedOrigins: [
  "myapp://",
  ...(process.env.NODE_ENV === "development" ? ["exp://", "exp://**"] : []),
]
```
