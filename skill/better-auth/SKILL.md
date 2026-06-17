---
name: better-auth
description: >
  Best practice implementation guide for Better Auth — a framework-agnostic TypeScript authentication library.
  Use this skill whenever the user mentions "better-auth", "betterAuth", wants to add authentication to a TypeScript/Next.js/Nuxt/SvelteKit/Hono/Express/NestJS/Astro project, set up login/signup/session, configure social OAuth providers, add 2FA/passkeys/magic links, integrate email verification, or asks how to secure auth routes. Also trigger for database adapter setup (Prisma, Drizzle, MongoDB), plugin configuration, or any pattern involving `betterAuth({...})` configuration. Always use this skill — even if the user just says "help me set up auth" without specifying the library, this skill applies if the stack is TypeScript.
---

# Better Auth — Best Practice Implementation Guide

> Source: https://better-auth.com/docs (docs as of March 2026, v1.4+)

## Quick Reference

Read this file fully before writing any code. For complex topics, load the relevant reference file from `references/`.

**Reference files:**
- `references/adapters.md` — Database & ORM adapter patterns
- `references/plugins.md` — Plugin ecosystem (2FA, passkey, magic link, org, API keys, etc.)
- `references/integrations.md` — Framework-specific mount handler patterns
- `references/security.md` — Security hardening checklist

---

## 1. Installation

```bash
npm install better-auth
# or: pnpm add / yarn add / bun add
```

> If client and server are separate projects, install `better-auth` in **both**.

---

## 2. Environment Variables (Required)

```env
# .env
BETTER_AUTH_SECRET=<min 32 chars, high entropy>
BETTER_AUTH_URL=http://localhost:3000   # full base URL of your app

# Generate secret:  openssl rand -base64 32
```

**Best practices:**
- Never hardcode secret — always use `BETTER_AUTH_SECRET` env var.
- Always set `BETTER_AUTH_URL` explicitly. Relying on request inference is not recommended.
- To rotate secret without invalidating sessions, use `BETTER_AUTH_SECRETS` (plural) with versioned secrets.

---

## 3. Server Instance — `auth.ts`

Place in `lib/auth.ts`, `utils/auth.ts`, or project root (can nest under `src/`, `app/`, `server/`).

```ts
// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  // ── Core ──────────────────────────────────────────
  appName: "My App",
  // baseURL & secret are read from env vars automatically

  // ── Database ──────────────────────────────────────
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  // ── Auth Methods ──────────────────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,      // ✅ OWASP best practice
    minPasswordLength: 8,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true, // ✅ security: invalidate old sessions
  },

  // ── Email Verification ────────────────────────────
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({ to: user.email, subject: "Verify your email", text: url });
      // ✅ use void/don't await to prevent timing attacks
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // 1 hour
  },

  // ── Session ───────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7,  // 7 days
    updateAge: 60 * 60 * 24,       // refresh if used after 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,              // 5 min cache
      strategy: "compact",         // "compact" | "jwt" | "jwe"
      // Use "jwe" for maximum security / sensitive compliance requirements
    },
  },

  // ── Social Providers ──────────────────────────────
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  // ── Rate Limiting ─────────────────────────────────
  rateLimit: {
    enabled: true,            // true by default in production
    window: 10,               // seconds
    max: 100,
    storage: "secondary-storage", // prefer over "memory" in production
    customRules: {
      "/sign-in/email": { window: 10, max: 3 },
      "/two-factor/*":  { window: 10, max: 3 },
    },
  },

  // ── Security ──────────────────────────────────────
  trustedOrigins: ["https://yourdomain.com"],
  advanced: {
    useSecureCookies: true,   // force HTTPS cookies always
    // disableCSRFCheck: false   ⚠️ never disable
    // disableOriginCheck: false ⚠️ never disable
    cookiePrefix: "myapp",    // minimize fingerprinting
  },

  // ── Plugins ───────────────────────────────────────
  plugins: [
    // add plugins here — see references/plugins.md
  ],
});
```

> **Export must be named `auth` or be a default export** — required by the CLI and some adapters.

---

## 4. Database Setup

### Run CLI to generate/migrate schema:

```bash
# Generate ORM schema / SQL migration
npx @better-auth/cli generate

# Apply migration directly (Kysely only)
npx @better-auth/cli migrate
```

### Supported databases — see `references/adapters.md` for full patterns:
- **Raw**: SQLite (`better-sqlite3`), PostgreSQL (`pg`), MySQL (`mysql2/promise`)
- **ORM**: Drizzle, Prisma, MongoDB

---

## 5. Mount Handler (Route Setup)

Mount at `/api/auth/*` (default path). See `references/integrations.md` for all frameworks.

**Next.js App Router:**
```ts
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
export const { POST, GET } = toNextJsHandler(auth);
```

**Next.js Pages Router:**
```ts
// pages/api/auth/[...all].ts
import { auth } from "@/lib/auth";
import { toNodeHandler } from "better-auth/node";
export const config = { api: { bodyParser: false } };
export default toNodeHandler(auth.handler);
```

**Hono:**
```ts
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));
```

**Express:**
```ts
// Note: Express v5 requires: app.all('/api/auth/{*any}', toNodeHandler(auth))
app.all("/api/auth/*", toNodeHandler(auth));
app.use(express.json()); // mount AFTER better-auth handler
```

---

## 6. Client Setup

```ts
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react"; // or /vue /svelte /solid /client

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // omit if same domain
});

// Named exports for convenience:
export const { signIn, signUp, signOut, useSession } = authClient;
```

**Client usage pattern:**
```ts
// Sign up
const { data, error } = await authClient.signUp.email({ email, password, name });

// Sign in
const { data, error } = await authClient.signIn.email({ email, password });

// Sign out
await authClient.signOut();

// Session (React hook)
const { data: session, isPending } = authClient.useSession();

// Get session (server-side)
const session = await auth.api.getSession({ headers: await headers() });
```

---

## 7. Security Hardening Checklist

| Rule | Config |
|------|--------|
| ✅ Strong secret (≥32 chars) | `BETTER_AUTH_SECRET` env var |
| ✅ Set base URL explicitly | `BETTER_AUTH_URL` env var |
| ✅ Require email verification | `emailAndPassword.requireEmailVerification: true` |
| ✅ Revoke sessions on password reset | `emailAndPassword.revokeSessionsOnPasswordReset: true` |
| ✅ Use HTTPS cookies | `advanced.useSecureCookies: true` |
| ✅ Set trusted origins | `trustedOrigins: [...]` |
| ✅ Rate limit in production | `rateLimit.enabled: true`, use DB/Redis storage |
| ✅ Don't await email sends | Use `void sendEmail(...)` to avoid timing leaks |
| ✅ Never disable CSRF check | `disableCSRFCheck` must remain `false` |
| ✅ Never disable origin check | `disableOriginCheck` must remain `false` |
| ✅ Rotate secrets safely | `BETTER_AUTH_SECRETS` env var with versioned objects |
| ✅ Use `jwe` cookie cache for sensitive apps | `session.cookieCache.strategy: "jwe"` |

> Full details in `references/security.md`

---

## 8. Common Patterns

### Protect server routes (Next.js example):
```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return <div>Hello {session.user.name}</div>;
}
```

### Force re-validation (bypass cookie cache):
```ts
// Server
await auth.api.getSession({ query: { disableCookieCache: true }, headers: ... });
// Client
await authClient.getSession({ query: { disableCookieCache: true } });
```

### Add plugin (2FA example):
```ts
import { twoFactor } from "better-auth/plugins";
import { twoFactorClient } from "better-auth/client/plugins";

// server: auth.ts
plugins: [twoFactor()]

// client: auth-client.ts
plugins: [twoFactorClient()]
```

After adding plugins always re-run `npx @better-auth/cli generate` or `migrate`.

---

## 9. Key Pitfalls to Avoid

- **Never call client methods from server** — use `auth.api.*` on server side.
- **Mount express.json() AFTER** the Better Auth handler, not before.
- **CommonJS (CJS) is not supported** — Better Auth is ESM only.
- **Don't rely on request inference for baseURL** — always set `BETTER_AUTH_URL`.
- **Rate limit storage defaults to memory** — switch to `"database"` or `"secondary-storage"` in production/serverless.
- **Cloudflare Workers** require `nodejs_compat` flag in `wrangler.toml` for `AsyncLocalStorage`.
- **TanStack Start** requires `tanstackStartCookies()` as the **last plugin** for cookie handling.
- **Safari ITP** blocks third-party cookies — use a reverse proxy or shared parent domain if API is on a different domain.

---

## 10. NestJS Integration

See the NestJS skill (`nestjs-prisma-patterns`) in combination with this skill for full patterns. Quick setup:

```ts
// auth.module.ts — expose auth as a provider
// Use global middleware to mount the handler:
import { toNodeHandler } from "better-auth/node";

// In main.ts or a middleware:
app.use("/api/auth", toNodeHandler(auth));
```

For full NestJS patterns, see `references/integrations.md`.
