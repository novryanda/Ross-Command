import 'dotenv/config';
import {
  assertUnitCommandersHaveActiveMembership,
  createKomandoAuthFromEnv,
  createSeedUnit,
  createSeedUser,
  daysAgo,
  guardSeedExecution,
  prisma,
  type SeedUser,
} from './seed-shared';

const UNIT_NAME = 'Mabes AD';

const commanderUser: SeedUser = {
  key: 'kasad',
  fullName: 'Jenderal TNI Maruli Simanjuntak',
  username: 'kasad',
  password: 'Komando@123!',
  role: 'member',
  identityNumber: 'NRP-MABESAD-0001',
  rank: 'Jenderal TNI',
};

const staffUsers: SeedUser[] = [
  {
    key: 'waka_mabesad',
    fullName: 'Letjen TNI Bambang Hariyanto',
    username: 'waka_mabesad',
    password: 'Komando@123!',
    role: 'member',
    identityNumber: 'NRP-MABESAD-0002',
    rank: 'Letjen TNI',
  },
  {
    key: 'asren_mabesad',
    fullName: 'Mayor Jenderal TNI Agus Subiyanto',
    username: 'asren_mabesad',
    password: 'Komando@123!',
    role: 'member',
    identityNumber: 'NRP-MABESAD-0003',
    rank: 'Mayor Jenderal TNI',
  },
  {
    key: 'asops_mabesad',
    fullName: 'Mayor Jenderal TNI Dudung Abdurachman',
    username: 'asops_mabesad',
    password: 'Komando@123!',
    role: 'member',
    identityNumber: 'NRP-MABESAD-0004',
    rank: 'Mayor Jenderal TNI',
  },
  {
    key: 'asintel_mabesad',
    fullName: 'Mayor Jenderal TNI Nugroho Budi Wiryanto',
    username: 'asintel_mabesad',
    password: 'Komando@123!',
    role: 'member',
    identityNumber: 'NRP-MABESAD-0005',
    rank: 'Mayor Jenderal TNI',
  },
  {
    key: 'askom_mabesad',
    fullName: 'Brigjen TNI Budiman',
    username: 'askom_mabesad',
    password: 'Komando@123!',
    role: 'member',
    identityNumber: 'NRP-MABESAD-0006',
    rank: 'Brigjen TNI',
  },
];

const memberNames = [
  'Kolonel Inf. Aditya Pratama',
  'Kolonel Inf. Bambang Setiawan',
  'Letnan Kolonel Inf. Cahyo Nugroho',
  'Letnan Kolonel Inf. Dedi Kurniawan',
  'Mayor Inf. Eko Prasetyo',
  'Mayor Inf. Fajar Ramadhan',
  'Kapten Inf. Galih Wibowo',
  'Kapten Inf. Hendra Lesmana',
  'Kapten Inf. Indra Wijaya',
  'Kapten Inf. Joko Santoso',
  'Sersan Mayor Kurniawan Adi',
  'Sersan Kepala Lukman Hakim',
  'Sersan Maman Suherman',
  'Sersan Kepala Nanda Pratama',
  'Sersan Oki Ramadhan',
  'Sersan Kepala Putra Wijaya',
  'Sersan Qomaruddin',
  'Sersan Kepala Rudi Hartanto',
  'Sersan Surya Atmaja',
  'Sersan Kepala Taufik Hidayat',
];

const memberUsers: SeedUser[] = memberNames.map((fullName, index) => {
  const slug = fullName
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(-2)
    .join('_');

  return {
    key: `mabesad_m${String(index + 1).padStart(2, '0')}`,
    fullName,
    username: `mad_${slug}_${String(index + 1).padStart(2, '0')}`,
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: `NRP-MABESAD-${String(index + 7).padStart(4, '0')}`,
  };
});

const allUsers = [commanderUser, ...staffUsers, ...memberUsers];

const platforms = ['instagram', 'facebook', 'twitter_x', 'tiktok', 'youtube'] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function freeIdentityNumber(identityNumber: string, reservedForUserId?: string) {
  const owner = await prisma.user.findUnique({
    where: { identityNumber },
    select: { id: true },
  });

  if (owner && owner.id !== reservedForUserId) {
    await prisma.user.update({
      where: { id: owner.id },
      data: { identityNumber: null },
    });
  }
}

async function ensureUser(
  auth: Awaited<ReturnType<typeof createKomandoAuthFromEnv>>,
  user: SeedUser,
  userIds: Map<string, string>,
) {
  const normalizedUsername = user.username.toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { username: normalizedUsername },
    select: { id: true },
  });

  if (existing) {
    if (user.identityNumber) {
      await freeIdentityNumber(user.identityNumber, existing.id);
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          fullName: user.fullName,
          rank: user.rank ?? null,
          identityNumber: user.identityNumber,
        },
      });
    }
    userIds.set(user.key, existing.id);
    return false;
  }

  if (user.identityNumber) {
    await freeIdentityNumber(user.identityNumber);
  }

  const userId = await createSeedUser(auth, user);
  userIds.set(user.key, userId);
  return true;
}

async function main() {
  guardSeedExecution();
  console.log(`Menjalankan seed user ${UNIT_NAME}...\n`);

  const auth = await createKomandoAuthFromEnv();
  const userIds = new Map<string, string>();

  console.log('1. Memastikan user Mabes AD...');
  let createdUsers = 0;
  for (const user of allUsers) {
    if (await ensureUser(auth, user, userIds)) {
      createdUsers += 1;
    }
  }
  console.log(`   OK ${userIds.size} user siap (${createdUsers} baru)`);

  console.log('\n2. Memastikan satuan Mabes AD...');
  let unit = await prisma.unit.findFirst({
    where: {
      name: UNIT_NAME,
      deletedAt: null,
    },
  });

  const commanderId = userIds.get(commanderUser.key);
  if (!commanderId) {
    throw new Error('Pimpinan Mabes AD tidak ditemukan');
  }

  if (!unit) {
    unit = await createSeedUnit({
      name: UNIT_NAME,
      description: 'Markas Besar Angkatan Darat.',
      parentId: null,
      commanderId,
    });
    console.log('   OK satuan baru dibuat');
  } else {
    await prisma.unit.update({
      where: { id: unit.id },
      data: { commanderId },
    });
    console.log('   OK satuan sudah ada, pimpinan diperbarui');
  }

  console.log('\n3. Memastikan membership...');
  const memberIds = allUsers.map((user) => userIds.get(user.key)!);
  const existingMemberships = await prisma.unitMember.findMany({
    where: {
      unitId: unit.id,
      userId: { in: memberIds },
      removedAt: null,
    },
    select: { userId: true },
  });
  const existingMemberSet = new Set(existingMemberships.map((item) => item.userId));
  const newMemberships = memberIds
    .filter((userId) => !existingMemberSet.has(userId))
    .map((userId, index) => ({
      unitId: unit!.id,
      userId,
      joinedAt: daysAgo(90 - index),
    }));

  if (newMemberships.length) {
    await prisma.unitMember.createMany({ data: newMemberships });
  }
  await assertUnitCommandersHaveActiveMembership();
  console.log(`   OK ${memberIds.length} anggota aktif`);

  console.log('\n4. Membuat akun sosial media...');
  const socialRows = memberIds.flatMap((userId, index) => {
    const user = allUsers.find((item) => userIds.get(item.key) === userId);
    if (!user || user.key === commanderUser.key) {
      return [];
    }

    const platform = platforms[index % platforms.length];
    const domain = platform === 'twitter_x' ? 'x.com' : `${platform}.com`;
    const handle = slugify(user.username);

    return [
      {
        userId,
        platform,
        username: `@${handle}`,
        profileUrl: `https://${domain}/${handle}`,
      },
    ];
  });

  const existingSocial = await prisma.socialAccount.findMany({
    where: { userId: { in: memberIds }, deletedAt: null },
    select: { userId: true, platform: true },
  });
  const socialKey = new Set(existingSocial.map((item) => `${item.userId}:${item.platform}`));
  const socialToCreate = socialRows.filter(
    (row) => !socialKey.has(`${row.userId}:${row.platform}`),
  );

  if (socialToCreate.length) {
    await prisma.socialAccount.createMany({ data: socialToCreate });
  }
  console.log(`   OK ${socialToCreate.length} akun sosial baru`);

  console.log('\nSeed Mabes AD selesai');
  console.log(`   Satuan : ${UNIT_NAME}`);
  console.log(`   Anggota: ${memberIds.length}`);
  console.log('\nLogin contoh:');
  console.log('   kasad / Komando@123!');
  console.log('   mad_* / Anggota@123!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error('Seed Mabes AD gagal', error);
    await prisma.$disconnect();
    process.exit(1);
  });
