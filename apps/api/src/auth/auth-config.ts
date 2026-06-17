import { ConfigService } from '@nestjs/config';
import type { KomandoAuthConfig } from './create-better-auth';

const DEFAULT_IP_ADDRESS_HEADERS = [
  'x-forwarded-for',
  'x-real-ip',
  'cf-connecting-ip',
];

export function buildKomandoAuthConfig(
  configService: ConfigService,
): KomandoAuthConfig {
  const baseURL = configService.getOrThrow<string>('BETTER_AUTH_URL').trim();

  return {
    baseURL,
    secret: configService.getOrThrow<string>('BETTER_AUTH_SECRET').trim(),
    secrets: parseVersionedSecrets(
      configService.get<string>('BETTER_AUTH_SECRETS'),
    ),
    nodeEnv: configService.get<string>('NODE_ENV'),
    trustedOrigins: buildTrustedOrigins(
      baseURL,
      configService.get<string>('BETTER_AUTH_TRUSTED_ORIGINS'),
    ),
    trustedProxyHeaders: parseBooleanEnv(
      configService.get<string>('BETTER_AUTH_TRUST_PROXY_HEADERS'),
    ),
    ipAddressHeaders:
      parseCsvEnv(configService.get<string>('BETTER_AUTH_IP_HEADERS')) ??
      DEFAULT_IP_ADDRESS_HEADERS,
  };
}

function buildTrustedOrigins(baseURL: string, rawValue?: string): string[] {
  const origins = new Set<string>([normalizeTrustedOrigin(baseURL)]);

  for (const value of parseCsvEnv(rawValue) ?? []) {
    origins.add(normalizeTrustedOrigin(value));
  }

  return Array.from(origins);
}

function parseVersionedSecrets(rawValue?: string) {
  if (!rawValue?.trim()) {
    return undefined;
  }

  return rawValue
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separatorIndex = entry.indexOf(':');
      if (separatorIndex === -1) {
        throw new Error(
          `Format BETTER_AUTH_SECRETS tidak valid untuk entry "${entry}". Gunakan format "<version>:<secret>".`,
        );
      }

      const version = Number(entry.slice(0, separatorIndex));
      const value = entry.slice(separatorIndex + 1).trim();

      if (!Number.isInteger(version) || version < 0 || value.length === 0) {
        throw new Error(
          `Entry BETTER_AUTH_SECRETS tidak valid: "${entry}". Gunakan format "<version>:<secret>".`,
        );
      }

      return { version, value };
    });
}

function parseBooleanEnv(value?: string): boolean | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  throw new Error(
    `Nilai boolean tidak valid: "${value}". Gunakan "true" atau "false".`,
  );
}

function parseCsvEnv(value?: string): string[] | undefined {
  const items = value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return items?.length ? items : undefined;
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
