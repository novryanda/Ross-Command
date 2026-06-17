# Better Auth — Plugin Reference

> Always add client plugin counterpart alongside server plugin.
> Always run `npx @better-auth/cli generate` or `migrate` after adding plugins.

---

## Two-Factor Authentication (2FA)

```ts
// server
import { twoFactor } from "better-auth/plugins";
plugins: [twoFactor()]

// client
import { twoFactorClient } from "better-auth/client/plugins";
plugins: [twoFactorClient()]
```

---

## Passkey

```ts
import { passkey } from "better-auth/plugins";
import { passkeyClient } from "better-auth/client/plugins";

// server
plugins: [passkey()]
// client
plugins: [passkeyClient()]
```

---

## Magic Link

```ts
import { magicLink } from "better-auth/plugins";
import { magicLinkClient } from "better-auth/client/plugins";

// server
plugins: [magicLink({
  sendMagicLink: async ({ email, url }) => {
    void sendEmail({ to: email, subject: "Your magic link", text: url });
  },
})]
// client
plugins: [magicLinkClient()]
```

---

## Email OTP

```ts
import { emailOTP } from "better-auth/plugins";
import { emailOTPClient } from "better-auth/client/plugins";

// server
plugins: [emailOTP({
  otpLength: 6,
  expiresIn: 300,       // 5 minutes
  allowedAttempts: 3,
  async sendVerificationOTP({ email, otp, type }) {
    void sendEmail({ to: email, subject: "Your OTP", text: `Code: ${otp}` });
  },
})]
// client
plugins: [emailOTPClient()]
```

---

## Admin

```ts
import { admin } from "better-auth/plugins";
import { adminClient } from "better-auth/client/plugins";

// server
plugins: [admin()]
// client
plugins: [adminClient()]
```

---

## Organization (Multi-tenancy)

```ts
import { organization } from "better-auth/plugins";
import { organizationClient } from "better-auth/client/plugins";

// server
plugins: [organization()]
// client
plugins: [organizationClient()]
```

---

## API Keys

```ts
import { apiKey } from "better-auth/plugins";
import { apiKeyClient } from "better-auth/client/plugins";

// server
plugins: [apiKey()]
// client
plugins: [apiKeyClient()]
```

---

## Multi Session

```ts
import { multiSession } from "better-auth/plugins";
import { multiSessionClient } from "better-auth/client/plugins";

// server
plugins: [multiSession({
  maximumSessions: 5, // default: 5 per device
})]
// client
plugins: [multiSessionClient()]
```

---

## JWT Plugin

```ts
import { jwt } from "better-auth/plugins";
import { jwtClient } from "better-auth/client/plugins";

// server
plugins: [jwt()]
// client
plugins: [jwtClient()]
```

---

## HIBP (Have I Been Pwned)

```ts
import { haveibeenpwned } from "better-auth/plugins";
plugins: [haveibeenpwned()] // blocks compromised passwords
```

---

## Captcha

```ts
import { captcha } from "better-auth/plugins";
plugins: [captcha({
  provider: "cloudflare-turnstile", // or "google-recaptcha" | "hcaptcha"
  secretKey: process.env.TURNSTILE_SECRET_KEY!,
})]
```

---

## Bearer Token (for API / mobile)

```ts
import { bearer } from "better-auth/plugins";
import { bearerClient } from "better-auth/client/plugins";

// server
plugins: [bearer()]
// client
plugins: [bearerClient()]
```

---

## SSO / SAML / OIDC Provider

```ts
import { sso } from "better-auth/plugins";
plugins: [sso()] // enterprise SSO

import { oidcProvider } from "better-auth/plugins";
plugins: [oidcProvider({ /* config */ })] // use Better Auth as OIDC provider
```

---

## TanStack Start Cookies (Required for TanStack)

```ts
import { tanstackStartCookies } from "better-auth/tanstack-start";
plugins: [
  // other plugins...
  tanstackStartCookies() // must be LAST plugin
]
```

---

## Next.js Cookies (for server-side calls in Next.js)

```ts
import { nextCookies } from "better-auth/next-js";
plugins: [nextCookies()] // enables server-side auth.api calls to set cookies
```

---

## Plugin Order Note

When using `tanstackStartCookies` or `nextCookies`, they must be the **last** plugin in the array.
