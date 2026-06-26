import 'dotenv/config';
import { guardSeedExecution, prisma, teardownDatabase } from './seed-shared';

async function main() {
  guardSeedExecution();
  await teardownDatabase();
  console.log('\nDatabase dikosongkan. Jalankan seed dengan: npm run prisma:seed:minimal');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error('Gagal membersihkan database', error);
    await prisma.$disconnect();
    process.exit(1);
  });
