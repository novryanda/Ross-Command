import 'dotenv/config';
import {
  assertUnitCommandersHaveActiveMembership,
  createKomandoAuthFromEnv,
  createSeedUser,
  daysAgo,
  guardSeedExecution,
  prisma,
  type SeedUser,
} from './seed-shared';

const UNIT_NAME = 'Pusat Siber TNI Angkatan Darat (Pussiberad)';
const BATCH_TAG = '[Pussiberad Demo]';

const commanderUser: SeedUser = {
  key: 'danpussiberad',
  fullName: 'Brigjen TNI Dr. Fransiscus Ari Susetio, S.E., M.Han.',
  username: 'danpussiberad',
  password: 'Komando@123!',
  role: 'member',
  identityNumber: 'NRP-PUSSIBERAD-0001',
  rank: 'Brigjen TNI',
};

async function ensureCommanderIdentity(commanderId: string) {
  const identityOwner = await prisma.user.findUnique({
    where: { identityNumber: commanderUser.identityNumber },
    select: { id: true },
  });

  if (identityOwner && identityOwner.id !== commanderId) {
    const fallbackIdentity = 'NRP-PUSSIBERAD-0002';
    const fallbackTaken = await prisma.user.findUnique({
      where: { identityNumber: fallbackIdentity },
      select: { id: true },
    });

    await prisma.user.update({
      where: { id: identityOwner.id },
      data: {
        identityNumber: fallbackTaken ? null : fallbackIdentity,
      },
    });
  }

  await prisma.user.update({
    where: { id: commanderId },
    data: {
      fullName: commanderUser.fullName,
      rank: commanderUser.rank,
      identityNumber: commanderUser.identityNumber,
    },
  });
}

async function main() {
  guardSeedExecution();
  console.log('Mengalihkan pimpinan dan pembuat perintah ke danpussiberad...\n');

  const auth = await createKomandoAuthFromEnv();
  const normalizedUsername = commanderUser.username.toLowerCase();

  let commander = await prisma.user.findUnique({
    where: { username: normalizedUsername },
    select: { id: true, fullName: true },
  });

  if (!commander) {
    const userId = await createSeedUser(auth, commanderUser);
    commander = { id: userId, fullName: commanderUser.fullName };
    console.log('1. User danpussiberad dibuat');
  } else {
    console.log('1. User danpussiberad sudah ada');
  }

  await ensureCommanderIdentity(commander.id);
  console.log('   Profil danpussiberad diperbarui');

  const unit = await prisma.unit.findFirst({
    where: { name: UNIT_NAME, deletedAt: null },
  });

  if (!unit) {
    throw new Error(`Satuan tidak ditemukan: ${UNIT_NAME}`);
  }

  await prisma.unit.update({
    where: { id: unit.id },
    data: { commanderId: commander.id },
  });
  console.log('2. Pimpinan satuan Pussiberad dialihkan ke danpussiberad');

  const existingMembership = await prisma.unitMember.findFirst({
    where: {
      unitId: unit.id,
      userId: commander.id,
      removedAt: null,
    },
  });

  if (!existingMembership) {
    await prisma.unitMember.create({
      data: {
        unitId: unit.id,
        userId: commander.id,
        joinedAt: daysAgo(90),
      },
    });
    console.log('3. Membership danpussiberad ditambahkan');
  } else {
    console.log('3. Membership danpussiberad sudah aktif');
  }

  await assertUnitCommandersHaveActiveMembership();

  const orders = await prisma.order.updateMany({
    where: {
      title: { startsWith: BATCH_TAG },
      deletedAt: null,
    },
    data: {
      createdById: commander.id,
    },
  });

  const activityLogs = await prisma.activityLog.updateMany({
    where: {
      order: {
        title: { startsWith: BATCH_TAG },
        deletedAt: null,
      },
      type: { in: ['order_created', 'order_sent'] },
    },
    data: {
      actorUserId: commander.id,
    },
  });

  console.log(`4. ${orders.count} perintah dialihkan ke danpussiberad`);
  console.log(`5. ${activityLogs.count} log aktivitas diperbarui`);
  console.log('\nSelesai. Login pimpinan: danpussiberad / Komando@123!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error('Gagal mengalihkan pimpinan Pussiberad', error);
    await prisma.$disconnect();
    process.exit(1);
  });
