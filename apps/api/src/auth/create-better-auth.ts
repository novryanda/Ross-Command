import type { PrismaClient } from '@prisma/client';

export interface KomandoAuthConfig {
  baseURL: string;
  secret: string;
  secrets?: Array<{
    version: number;
    value: string;
  }>;
  nodeEnv?: string;
  trustedOrigins?: string[];
  trustedProxyHeaders?: boolean;
  ipAddressHeaders?: string[];
}

export async function createKomandoAuth(
  prisma: PrismaClient,
  config: KomandoAuthConfig,
) {
  const [{ betterAuth }, { prismaAdapter }, plugins, api, adminAccess] =
    await Promise.all([
      import('better-auth'),
      import('better-auth/adapters/prisma'),
      import('better-auth/plugins'),
      import('better-auth/api'),
      import('better-auth/plugins/admin/access'),
    ]);
  const { adminAc, userAc } = adminAccess;

  const trustedOrigins = new Set<string>(
    [
      normalizeTrustedOrigin(config.baseURL),
      ...(config.trustedOrigins ?? []),
    ].map(normalizeTrustedOrigin),
  );

  return betterAuth({
    appName: 'Komando Center',
    baseURL: config.baseURL,
    secret: config.secret,
    ...(config.secrets?.length ? { secrets: config.secrets } : {}),
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    trustedOrigins: Array.from(trustedOrigins),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
        strategy: 'jwe',
      },
    },
    rateLimit: {
      enabled: true,
      storage: 'database',
      window: 60,
      max: 100,
      customRules: {
        '/sign-in/username': {
          window: 60,
          max: 5,
        },
      },
    },
    user: {
      fields: {
        name: 'fullName',
        emailVerified: 'emailVerified',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      },
      additionalFields: {
        nip: {
          type: 'string',
          required: false,
          input: false,
        },
        failedLoginAttempts: {
          type: 'number',
          required: false,
          defaultValue: 0,
          input: false,
        },
        lockedUntil: {
          type: 'date',
          required: false,
          input: false,
        },
        lastLoginAt: {
          type: 'date',
          required: false,
          input: false,
        },
        deletedAt: {
          type: 'date',
          required: false,
          input: false,
        },
      },
    },
    advanced: {
      useSecureCookies: shouldUseSecureCookies(config.baseURL, config.nodeEnv),
      cookiePrefix: 'komando',
      trustedProxyHeaders: config.trustedProxyHeaders,
      ipAddress: {
        ipAddressHeaders: config.ipAddressHeaders,
      },
      database: {
        generateId: 'uuid',
      },
    },
    plugins: [
      plugins.admin({
        defaultRole: 'member',
        adminRoles: ['super_admin'],
        roles: {
          super_admin: adminAc,
          member: userAc,
        },
      }),
      plugins.username({
        minUsernameLength: 3,
        maxUsernameLength: 50,
      }),
    ],
    hooks: {
      before: api.createAuthMiddleware(async (ctx) => {
        if (ctx.path !== '/sign-in/username') {
          return;
        }

        const usernameInput = extractUsernameFromBody(ctx.body);
        if (!usernameInput) {
          return;
        }

        const username = usernameInput.toLowerCase();
        const user = await prisma.user.findFirst({
          where: {
            username,
            deletedAt: null,
          },
        });

        if (user?.lockedUntil && user.lockedUntil > new Date()) {
          return new Response(
            JSON.stringify({
              message:
                'Akun terkunci sementara. Hubungi Admin untuk membuka akses.',
              code: 'ACCOUNT_LOCKED',
              status: 423,
            }),
            {
              status: 423,
              headers: { 'content-type': 'application/json' },
            },
          );
        }
      }),
      after: api.createAuthMiddleware(async (ctx) => {
        if (ctx.path !== '/sign-in/username') {
          return;
        }

        const usernameInput = extractUsernameFromBody(ctx.body);
        const username = usernameInput?.toLowerCase();
        const ipAddress = extractIpAddress(ctx.headers);
        const currentUser = username
          ? await prisma.user.findFirst({
              where: {
                username,
                deletedAt: null,
              },
              select: {
                id: true,
                failedLoginAttempts: true,
              },
            })
          : null;

        if (ctx.context.newSession?.session?.userId) {
          await prisma.$transaction([
            prisma.loginAttempt.create({
              data: {
                userId: ctx.context.newSession.session.userId,
                ipAddress,
                isSuccess: true,
              },
            }),
            prisma.user.update({
              where: {
                id: ctx.context.newSession.session.userId,
              },
              data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
              },
            }),
          ]);
          return;
        }

        const failedAttemptCount = currentUser
          ? currentUser.failedLoginAttempts + 1
          : 0;
        const shouldLock = failedAttemptCount >= 5;

        if (currentUser) {
          await prisma.$transaction([
            prisma.loginAttempt.create({
              data: {
                userId: currentUser.id,
                ipAddress,
                isSuccess: false,
              },
            }),
            prisma.user.update({
              where: { id: currentUser.id },
              data: {
                failedLoginAttempts: failedAttemptCount,
                lockedUntil: shouldLock
                  ? new Date(Date.now() + 30 * 60 * 1000)
                  : null,
              },
            }),
          ]);
          return;
        }

        await prisma.loginAttempt.create({
          data: {
            userId: null,
            ipAddress,
            isSuccess: false,
          },
        });
      }),
    },
  });
}

function shouldUseSecureCookies(baseURL: string, nodeEnv?: string): boolean {
  if (nodeEnv === 'production') {
    return true;
  }

  try {
    return new URL(baseURL).protocol === 'https:';
  } catch {
    return false;
  }
}

function extractIpAddress(headers?: Headers): string {
  if (!headers) {
    return '0.0.0.0';
  }

  const headerNames = ['cf-connecting-ip', 'x-real-ip', 'x-forwarded-for'];
  for (const headerName of headerNames) {
    const value = headers.get(headerName);
    if (!value) {
      continue;
    }

    const [firstAddress] = value.split(',');
    const normalizedAddress = firstAddress?.trim();
    if (normalizedAddress) {
      return normalizedAddress;
    }
  }

  return '0.0.0.0';
}

function extractUsernameFromBody(body: unknown): string | null {
  if (
    typeof body === 'object' &&
    body !== null &&
    'username' in body &&
    typeof body.username === 'string'
  ) {
    return body.username;
  }

  return null;
}

function normalizeTrustedOrigin(value: string): string {
  const trimmedValue = value.trim();

  if (trimmedValue.includes('*')) {
    return trimmedValue.replace(/\/+$/, '');
  }

  try {
    return new URL(trimmedValue).origin;
  } catch {
    return trimmedValue.replace(/\/+$/, '');
  }
}
