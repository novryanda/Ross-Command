import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createKomandoAuth } from '../src/auth/create-better-auth';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getEnvOrThrow('DATABASE_URL'),
    },
  },
});

const testAccounts = [{ username: 'superadmin', password: 'Admin@1234!' }] as const;

async function main() {
  console.log('Verifikasi login akun seed...\n');

  const auth = await createKomandoAuth(prisma, {
    baseURL: getEnvOrThrow('BETTER_AUTH_URL'),
    secret: getEnvOrThrow('BETTER_AUTH_SECRET'),
    nodeEnv: process.env.NODE_ENV,
    trustedOrigins: parseTrustedOrigins(process.env.BETTER_AUTH_TRUSTED_ORIGINS),
  });

  let successCount = 0;

  for (const account of testAccounts) {
    try {
      const result = await auth.api.signInUsername({
        body: {
          username: account.username,
          password: account.password,
        },
      });

      if (result?.user?.id) {
        successCount += 1;
        console.log(
          `OK ${account.username} - Login berhasil (id: ${result.user.id})`,
        );
      } else {
        console.log(
          `FAIL ${account.username} - Login gagal (user tidak ada di response)`,
        );
      }
    } catch (error) {
      console.log(
        `FAIL ${account.username} - Error: ${formatErrorMessage(error)}`,
      );
    }
  }

  console.log(`\nRingkasan: ${successCount}/${testAccounts.length} akun berhasil login`);

  if (successCount !== testAccounts.length) {
    process.exitCode = 1;
  }
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

function formatErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error) => {
    console.error('Verifikasi login gagal total', error);
    process.exit(1);
  });
