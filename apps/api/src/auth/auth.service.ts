import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common/interfaces';
import { IncomingHttpHeaders } from 'http';
import { PrismaService } from '../common/prisma.service';
import { ApiException } from '../common/utils/api-exception.util';
import { User } from '@prisma/client';
import { buildKomandoAuthConfig } from './auth-config';
import { createKomandoAuth } from './create-better-auth';

type BetterAuthInstance = Awaited<ReturnType<typeof createKomandoAuth>>;
type SessionLookupOptions = {
  disableCookieCache?: boolean;
};

export interface AuthenticatedUser {
  session: Awaited<ReturnType<BetterAuthInstance['api']['getSession']>>;
  user: User;
}

@Injectable()
export class AuthService {
  private authPromise?: Promise<BetterAuthInstance>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async mount(app: INestApplication): Promise<void> {
    const auth = await this.getAuth();
    const { toNodeHandler } = await import('better-auth/node');
    app.use('/api/auth', toNodeHandler(auth));
  }

  async getAuth(): Promise<BetterAuthInstance> {
    this.authPromise ??= createKomandoAuth(
      this.prisma,
      buildKomandoAuthConfig(this.configService),
    );
    return this.authPromise;
  }

  async getSessionFromHeaders(
    headers: IncomingHttpHeaders,
    options: SessionLookupOptions = {},
  ): Promise<Awaited<ReturnType<BetterAuthInstance['api']['getSession']>>> {
    const auth = await this.getAuth();
    return auth.api.getSession({
      headers: this.toHeaders(headers),
      ...(options.disableCookieCache
        ? {
            query: {
              disableCookieCache: true,
            },
          }
        : {}),
    });
  }

  async requireUser(
    headers: IncomingHttpHeaders,
    options: SessionLookupOptions = {},
  ): Promise<AuthenticatedUser> {
    const session = await this.getSessionFromHeaders(headers, options);
    if (!session?.user?.id) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'UNAUTHORIZED',
        'Session tidak valid atau sudah berakhir',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.deletedAt) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'UNAUTHORIZED',
        'Akun tidak aktif',
      );
    }

    return { session, user };
  }

  toHeaders(headers: IncomingHttpHeaders): Headers {
    const normalized = new Headers();
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'string') {
        normalized.set(key, value);
      } else if (Array.isArray(value)) {
        normalized.set(key, value.join(', '));
      }
    }
    return normalized;
  }
}
