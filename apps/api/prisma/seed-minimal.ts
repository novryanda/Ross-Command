import 'dotenv/config';
import {
  createKomandoAuthFromEnv,
  createSeedUser,
  guardSeedExecution,
  prisma,
  teardownDatabase,
} from './seed-shared';
import { coreUsers } from './seed-data/org-minimal';

async function main() {
  guardSeedExecution();
  console.log('Menjalankan seed minimal (superadmin saja)...\n');

  const auth = await createKomandoAuthFromEnv();
  await teardownDatabase();

  console.log('1. Membuat superadmin melalui Better Auth...');
  const userIds = new Map<string, string>();
  for (const user of coreUsers) {
    const userId = await createSeedUser(auth, user);
    userIds.set(user.key, userId);
  }
  console.log(`   OK ${userIds.size} user dibuat`);

  console.log('\nSeed minimal selesai');
  console.log(`   User: ${userIds.size}`);
  console.log('\nLogin:');
  console.log('   superadmin / Admin@1234!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error('Seed minimal gagal', error);
    await prisma.$disconnect();
    process.exit(1);
  });
