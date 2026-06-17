# Better Auth — Security Hardening Reference

## Password Hashing
- Default: `scrypt` (memory-hard, CPU-intensive — resistant to brute force)
- Custom hash function: set `password.hash` and `password.verify` in config

## Secret Management
- Use `BETTER_AUTH_SECRET` env var (min 32 chars, high entropy)
- Generate: `openssl rand -base64 32`
- Rotate without invalidating data: use `BETTER_AUTH_SECRETS` (plural) with versioned secrets:

```ts
secrets: [
  { version: 2, value: "new-secret" },  // new
  { version: 1, value: "old-secret" },  // legacy fallback
]
```

---

## Session Security

```ts
session: {
  expiresIn: 60 * 60 * 24 * 7,  // 7 days default
  updateAge: 60 * 60 * 24,       // refresh threshold: 1 day
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60,              // 5 min cache
    strategy: "jwe",             // max security: encrypted, unreadable by client
    // "compact" = HMAC-signed, smallest size
    // "jwt"     = standard JWT, signed but readable
    // "jwe"     = encrypted, unreadable — use for compliance/sensitive data
  },
}
```

For sensitive operations, force DB re-validation:
```ts
await auth.api.getSession({ query: { disableCookieCache: true }, headers });
```

---

## Cookie Security

All cookies are:
- `httpOnly` — JS cannot access
- `secure` in production
- `sameSite: lax` by default (CSRF protection)
- HMAC-signed using your secret

Force secure cookies always (even in dev over HTTPS):
```ts
advanced: { useSecureCookies: true }
```

Custom cookie prefix (reduce fingerprinting):
```ts
advanced: { cookiePrefix: "myapp" }
```

Cross-subdomain cookies (e.g. auth.example.com → app.example.com):
```ts
advanced: {
  crossSubDomainCookies: {
    enabled: true,
    domain: "example.com",
  }
}
```

---

## CSRF Protection

Better Auth provides two layers:
1. **Non-simple request enforcement** — only accepts `application/json` Content-Type
2. **Origin header validation** — validates `Origin` against `trustedOrigins`

```ts
trustedOrigins: ["https://yourdomain.com", "https://app.yourdomain.com"]
// Wildcards supported: "https://*.example.com"
```

> Never set `disableCSRFCheck: true` or `disableOriginCheck: true` in production.

---

## Email Enumeration Protection

Enabled automatically when `requireEmailVerification: true` or `autoSignIn: false`.

- Sign-up returns same 200 response whether email exists or not (OWASP best practice)
- Password hashing is simulated on duplicate attempts to mitigate timing attacks
- `change-email` endpoint never reveals if target email is already registered

```ts
emailAndPassword: {
  requireEmailVerification: true,
}
```

---

## Rate Limiting

Built-in defaults:
- `/sign-in/email`: 3 requests / 10 seconds
- `/two-factor/verify`: 3 requests / 10 seconds

Override and add custom rules:
```ts
rateLimit: {
  enabled: true,
  window: 10,
  max: 100,
  storage: "secondary-storage", // use Redis in production — not "memory"
  customRules: {
    "/sign-in/email": { window: 10, max: 3 },
    "/sign-up/email": { window: 60, max: 5 },
    "/two-factor/*":  { window: 10, max: 3 },
  },
}
```

Client-side handling:
```ts
await authClient.signIn.email({ email, password }, {
  onError: (ctx) => {
    if (ctx.response.status === 429) {
      const retryAfter = ctx.response.headers.get("X-Retry-After");
    }
  }
});
```

---

## Trusted Proxy Headers

Only enable if your reverse proxy correctly sets these headers and clients cannot forge them:
```ts
advanced: {
  trustedProxyHeaders: true,
  // Resolves baseURL from X-Forwarded-Host + X-Forwarded-Proto
}
```

Priority order when `trustedProxyHeaders: true`:
1. Static `baseURL` config (ignores proxy)
2. `BETTER_AUTH_URL` env var
3. `X-Forwarded-Host` + `X-Forwarded-Proto` headers
4. Request URL origin (final fallback)

---

## IP Address Tracking

```ts
advanced: {
  ipAddress: {
    ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
    disableIpTracking: false,
  }
}
```

---

## Session Revocation

```ts
// Revoke all sessions on password reset
emailAndPassword: {
  revokeSessionsOnPasswordReset: true,
}

// Revoke specific session (server)
await auth.api.revokeSession({ body: { token: sessionToken } });

// Revoke all sessions for user (server)
await auth.api.revokeSessions({ headers });
```

---

## Production Checklist

- [ ] `BETTER_AUTH_SECRET` ≥ 32 chars (never hardcoded)
- [ ] `BETTER_AUTH_URL` explicitly set
- [ ] `requireEmailVerification: true`
- [ ] `revokeSessionsOnPasswordReset: true`
- [ ] `useSecureCookies: true`
- [ ] `trustedOrigins` configured
- [ ] Rate limit storage = `"database"` or `"secondary-storage"` (not `"memory"`)
- [ ] Cookie cache strategy = `"jwe"` for sensitive apps
- [ ] CSRF/origin checks NOT disabled
- [ ] Email sends use `void` (not awaited) to prevent timing attacks
- [ ] Cloudflare Workers: `nodejs_compat` flag set in wrangler.toml
