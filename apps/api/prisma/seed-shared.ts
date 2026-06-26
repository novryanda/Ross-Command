import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { createKomandoAuth } from '../src/auth/create-better-auth';

export type SeedRole = 'super_admin' | 'member';
export type SeedGender = 'pria' | 'wanita';
export type SeedEmploymentType = 'tni' | 'pns' | 'p3k';

export type SeedUser = {
  key: string;
  fullName: string;
  username: string;
  password: string;
  role: SeedRole;
  identityNumber?: string;
  gender?: SeedGender;
  employmentType?: SeedEmploymentType;
  rank?: string;
  grade?: string;
  religion?:
    | 'islam'
    | 'kristen_protestan'
    | 'katolik'
    | 'hindu'
    | 'buddha'
    | 'konghucu';
  phoneNumber?: string;
};

export type SeedUnit = {
  key: string;
  name: string;
  description: string;
  commanderKey: string;
  parentKey?: string;
};

export type SeedMembership = { userKey: string; unitKey: string };

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getEnvOrThrow('DATABASE_URL'),
    },
  },
});

export function guardSeedExecution() {
  const databaseUrl = getEnvOrThrow('DATABASE_URL');
  const allowProductionSeed = parseBoolean(process.env.ALLOW_PRODUCTION_SEED);
  const nodeEnv = process.env.NODE_ENV?.toLowerCase();
  const isProductionLike =
    nodeEnv === 'production' || !isLocalDatabaseUrl(databaseUrl);

  if (isProductionLike && !allowProductionSeed) {
    throw new Error(
      'Seed ke database production/non-local diblokir. Set ALLOW_PRODUCTION_SEED=true jika memang ingin reset dan seed database ini.',
    );
  }
}

export function validateSeedMembershipPlan(
  units: SeedUnit[],
  membershipPlan: SeedMembership[],
) {
  const activeMembershipKeys = new Set(
    membershipPlan.map((membership) =>
      [membership.userKey, membership.unitKey].join(':'),
    ),
  );
  const missingCommanders = units
    .filter(
      (unit) =>
        !activeMembershipKeys.has([unit.commanderKey, unit.key].join(':')),
    )
    .map((unit) => `${unit.name} -> ${unit.commanderKey}`);

  if (missingCommanders.length) {
    throw new Error(
      [
        'Seed tidak valid: setiap pimpinan satuan wajib menjadi anggota aktif langsung satuannya.',
        ...missingCommanders.map((item) => `- ${item}`),
      ].join('\n'),
    );
  }
}

export async function assertUnitCommandersHaveActiveMembership() {
  const unitsWithCommanders = await prisma.unit.findMany({
    select: {
      name: true,
      commanderId: true,
      commander: {
        select: {
          username: true,
        },
      },
      memberships: {
        where: {
          removedAt: null,
        },
        select: {
          userId: true,
        },
      },
    },
  });
  const invalidUnits = unitsWithCommanders.filter(
    (unit) =>
      unit.commanderId &&
      !unit.memberships.some(
        (membership) => membership.userId === unit.commanderId,
      ),
  );

  if (invalidUnits.length) {
    throw new Error(
      [
        'Seed gagal: ada pimpinan satuan yang bukan anggota aktif langsung satuannya.',
        ...invalidUnits.map(
          (unit) => `- ${unit.name} -> ${unit.commander?.username ?? '-'}`,
        ),
      ].join('\n'),
    );
  }
}

export async function teardownDatabase() {
  console.log('Membersihkan data lama...');

  await prisma.activityLog.deleteMany();
  await prisma.metricScrapeRun.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.orderTarget.deleteMany();
  await prisma.orderSocialTarget.deleteMany();
  await prisma.order.deleteMany();
  await prisma.socialAccount.deleteMany();
  await prisma.unitMember.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.loginAttempt.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.rateLimit.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();

  console.log('   OK Data lama dibersihkan');
}

export async function createKomandoAuthFromEnv() {
  return createKomandoAuth(prisma, {
    baseURL: getEnvOrThrow('BETTER_AUTH_URL'),
    secret: getEnvOrThrow('BETTER_AUTH_SECRET'),
    nodeEnv: process.env.NODE_ENV,
    trustedOrigins: parseTrustedOrigins(process.env.BETTER_AUTH_TRUSTED_ORIGINS),
    trustedProxyHeaders: parseBoolean(process.env.BETTER_AUTH_TRUST_PROXY_HEADERS),
  });
}

export async function createSeedUser(
  auth: Awaited<ReturnType<typeof createKomandoAuth>>,
  user: SeedUser,
) {
  const normalizedUsername = user.username.toLowerCase();
  const email = `${normalizedUsername}@internal.komando`;
  const employmentType = user.employmentType ?? 'tni';
  const rank =
    employmentType === 'tni' ? (user.rank ?? inferSeedRank(user.fullName)) : null;
  const grade = employmentType === 'tni' ? null : (user.grade ?? null);
  const gender = user.gender ?? inferSeedGender(user.fullName);

  await auth.api.createUser({
    body: {
      email,
      password: user.password,
      name: user.fullName,
      role: user.role,
      data: {
        username: normalizedUsername,
        identityNumber: user.identityNumber ?? null,
        gender,
        employmentType,
        rank,
        grade,
        religion: user.religion ?? null,
        phoneNumber: user.phoneNumber ?? null,
      },
    },
  });

  const createdUser = await prisma.user.findUnique({
    where: {
      username: normalizedUsername,
    },
  });

  if (!createdUser) {
    throw new Error(`User gagal dibuat: ${normalizedUsername}`);
  }

  await prisma.user.update({
    where: {
      id: createdUser.id,
    },
    data: {
      role: user.role,
      identityNumber: user.identityNumber ?? null,
      gender,
      employmentType,
      rank,
      grade,
      religion: user.religion ?? null,
      phoneNumber: user.phoneNumber ?? null,
      emailVerified: true,
      banned: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
      deletedAt: null,
    },
  });

  return createdUser.id;
}

export async function createSeedUnit(params: {
  name: string;
  description: string;
  parentId: string | null;
  commanderId: string;
}) {
  const id = randomUUID();
  const parent = params.parentId
    ? await prisma.unit.findUnique({
        where: {
          id: params.parentId,
        },
      })
    : null;

  const path = parent ? `${parent.path}${id}/` : `/${id}/`;
  const depthLevel = parent ? parent.depthLevel + 1 : 0;

  return prisma.unit.create({
    data: {
      id,
      name: params.name,
      description: params.description,
      parentId: params.parentId,
      commanderId: params.commanderId,
      path,
      depthLevel,
    },
  });
}

export function getRequiredMapValue(
  map: Map<string, string>,
  key: string,
  label: string,
) {
  const value = map.get(key);
  if (!value) {
    throw new Error(`${label} dengan key "${key}" tidak ditemukan`);
  }

  return value;
}

export function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function inferSeedGender(fullName: string): SeedGender {
  return /\b(dewi|lina)\b/i.test(fullName) ? 'wanita' : 'pria';
}

function inferSeedRank(fullName: string) {
  const rankMatch = fullName.match(
    /^(Jenderal TNI|Mayor Jenderal TNI|Brigadir Jenderal TNI|Kolonel [^.]+\.|Letnan Kolonel [^.]+\.|Sersan Mayor|Sersan Kepala|Sersan)\b/i,
  );

  return rankMatch?.[1] ?? 'Prajurit TNI';
}

function getEnvOrThrow(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} wajib diisi`);
  }

  return value;
}

function parseTrustedOrigins(rawValue: string | undefined) {
  return rawValue
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseBoolean(value: string | undefined) {
  if (!value) {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function isLocalDatabaseUrl(databaseUrl: string) {
  try {
    const parsed = new URL(databaseUrl);
    return ['localhost', '127.0.0.1'].includes(parsed.hostname);
  } catch {
    return false;
  }
}
