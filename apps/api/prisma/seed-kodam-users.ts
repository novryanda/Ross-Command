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

type UnitSeedConfig = {
  unitName: string;
  unitDescription: string;
  parentUnitName: string;
  commander: SeedUser;
  staff: SeedUser[];
  memberNames: string[];
  memberUsernamePrefix: string;
  memberKeyPrefix: string;
  identityPrefix: string;
};

const platforms = ['instagram', 'facebook', 'twitter_x', 'tiktok', 'youtube'] as const;

const kodamIbbConfig: UnitSeedConfig = {
  unitName: 'Kodam I/Bukit Barisan',
  unitDescription: 'Komando Daerah Militer I/Bukit Barisan.',
  parentUnitName: 'Mabes AD',
  commander: {
    key: 'pangdam_ibb',
    fullName: 'Mayor Jenderal TNI Putranto Gatot',
    username: 'pangdam_ibb',
    password: 'Komando@123!',
    role: 'member',
    identityNumber: 'NRP-KODAMIBB-0001',
    rank: 'Mayor Jenderal TNI',
  },
  staff: [
    {
      key: 'kasdam_ibb',
      fullName: 'Brigadir Jenderal TNI Hendra Wijaya',
      username: 'kasdam_ibb',
      password: 'Komando@123!',
      role: 'member',
      identityNumber: 'NRP-KODAMIBB-0002',
      rank: 'Brigjen TNI',
    },
    {
      key: 'irdam_ibb',
      fullName: 'Kolonel Inf. Bambang Setiawan',
      username: 'irdam_ibb',
      password: 'Komando@123!',
      role: 'member',
      identityNumber: 'NRP-KODAMIBB-0003',
      rank: 'Kolonel Inf.',
    },
    {
      key: 'asops_kasdam',
      fullName: 'Kolonel Inf. Andi Prasetya',
      username: 'asops_kasdam',
      password: 'Komando@123!',
      role: 'member',
      identityNumber: 'NRP-KODAMIBB-0004',
      rank: 'Kolonel Inf.',
    },
    {
      key: 'asintel_kasdam',
      fullName: 'Kolonel Inf. Dedi Kurniawan',
      username: 'asintel_kasdam',
      password: 'Komando@123!',
      role: 'member',
      identityNumber: 'NRP-KODAMIBB-0005',
      rank: 'Kolonel Inf.',
    },
    {
      key: 'askom_ibb',
      fullName: 'Letnan Kolonel Inf. Rizky Mahendra',
      username: 'askom_ibb',
      password: 'Komando@123!',
      role: 'member',
      identityNumber: 'NRP-KODAMIBB-0006',
      rank: 'Letnan Kolonel Inf.',
    },
  ],
  memberNames: [
    'Letnan Kolonel Inf. Agus Wijaya',
    'Letnan Kolonel Inf. Bayu Nugroho',
    'Mayor Inf. Cahyo Pratama',
    'Mayor Inf. Dimas Ramadhan',
    'Kapten Inf. Eko Susilo',
    'Kapten Inf. Fajar Hidayat',
    'Kapten Inf. Galih Permana',
    'Kapten Inf. Hadi Kurniawan',
    'Kapten Inf. Indra Lesmana',
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
  ],
  memberUsernamePrefix: 'ibb',
  memberKeyPrefix: 'kodamibb_m',
  identityPrefix: 'NRP-KODAMIBB',
};

const kodamXxiiConfig: UnitSeedConfig = {
  unitName: 'Kodam XXII/Raden Inten',
  unitDescription: 'Komando Daerah Militer XXII/Raden Inten.',
  parentUnitName: 'Mabes AD',
  commander: {
    key: 'pangdam_xxii',
    fullName: 'Mayor Jenderal TNI Achmad Ridwan Lubis',
    username: 'pangdam_xxii',
    password: 'Komando@123!',
    role: 'member',
    identityNumber: 'NRP-KODAM22-0001',
    rank: 'Mayor Jenderal TNI',
  },
  staff: [
    {
      key: 'kasdam_xxii',
      fullName: 'Brigadir Jenderal TNI Yudi Nugraha',
      username: 'kasdam_xxii',
      password: 'Komando@123!',
      role: 'member',
      identityNumber: 'NRP-KODAM22-0002',
      rank: 'Brigjen TNI',
    },
    {
      key: 'irdam_xxii',
      fullName: 'Kolonel Inf. Wahyu Adi Pratama',
      username: 'irdam_xxii',
      password: 'Komando@123!',
      role: 'member',
      identityNumber: 'NRP-KODAM22-0003',
      rank: 'Kolonel Inf.',
    },
    {
      key: 'asops_xxii',
      fullName: 'Kolonel Inf. Yanto Kurniawan',
      username: 'asops_xxii',
      password: 'Komando@123!',
      role: 'member',
      identityNumber: 'NRP-KODAM22-0004',
      rank: 'Kolonel Inf.',
    },
    {
      key: 'asintel_xxii',
      fullName: 'Kolonel Inf. Zulkarnain Hidayat',
      username: 'asintel_xxii',
      password: 'Komando@123!',
      role: 'member',
      identityNumber: 'NRP-KODAM22-0005',
      rank: 'Kolonel Inf.',
    },
    {
      key: 'askom_xxii',
      fullName: 'Letnan Kolonel Inf. Arief Budiman',
      username: 'askom_xxii',
      password: 'Komando@123!',
      role: 'member',
      identityNumber: 'NRP-KODAM22-0006',
      rank: 'Letnan Kolonel Inf.',
    },
  ],
  memberNames: [
    'Letnan Kolonel Inf. Bagus Setiadi',
    'Letnan Kolonel Inf. Catur Nugraha',
    'Mayor Inf. Doni Prasetyo',
    'Mayor Inf. Edi Santoso',
    'Kapten Inf. Fikri Ramadhan',
    'Kapten Inf. Gunawan Wijaya',
    'Kapten Inf. Heru Nugroho',
    'Kapten Inf. Iwan Setiawan',
    'Kapten Inf. Jefri Kurniawan',
    'Kapten Inf. Krisna Adi',
    'Sersan Mayor Lutfi Hakim',
    'Sersan Kepala Mulyadi',
    'Sersan Nanda Wijaya',
    'Sersan Kepala Okta Pratama',
    'Sersan Pandu Lesmana',
    'Sersan Kepala Qori Saputra',
    'Sersan Rendi Atmaja',
    'Sersan Kepala Sandi Hartono',
    'Sersan Teguh Ramadhan',
    'Sersan Kepala Umar Fadillah',
  ],
  memberUsernamePrefix: 'k22',
  memberKeyPrefix: 'kodam22_m',
  identityPrefix: 'NRP-KODAM22',
};

function buildMemberUsers(config: UnitSeedConfig): SeedUser[] {
  const staffCount = config.staff.length;

  return config.memberNames.map((fullName, index) => {
    const slug = fullName
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .trim()
      .split(/\s+/)
      .slice(-2)
      .join('_');

    return {
      key: `${config.memberKeyPrefix}${String(index + 1).padStart(2, '0')}`,
      fullName,
      username: `${config.memberUsernamePrefix}_${slug}_${String(index + 1).padStart(2, '0')}`,
      password: 'Anggota@123!',
      role: 'member',
      identityNumber: `${config.identityPrefix}-${String(index + staffCount + 2).padStart(4, '0')}`,
    };
  });
}

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

async function seedUnitUsers(
  auth: Awaited<ReturnType<typeof createKomandoAuthFromEnv>>,
  config: UnitSeedConfig,
) {
  const memberUsers = buildMemberUsers(config);
  const allUsers = [config.commander, ...config.staff, ...memberUsers];
  const userIds = new Map<string, string>();

  console.log(`\n=== ${config.unitName} ===`);
  console.log('1. Memastikan user...');

  let createdUsers = 0;
  for (const user of allUsers) {
    if (await ensureUser(auth, user, userIds)) {
      createdUsers += 1;
    }
  }
  console.log(`   OK ${userIds.size} user siap (${createdUsers} baru)`);

  console.log('2. Memastikan satuan...');
  const parentUnit = await prisma.unit.findFirst({
    where: { name: config.parentUnitName, deletedAt: null },
    select: { id: true },
  });

  if (!parentUnit) {
    throw new Error(`Satuan induk tidak ditemukan: ${config.parentUnitName}`);
  }

  const commanderId = userIds.get(config.commander.key);
  if (!commanderId) {
    throw new Error(`Pimpinan tidak ditemukan: ${config.commander.key}`);
  }

  let unit = await prisma.unit.findFirst({
    where: { name: config.unitName, deletedAt: null },
  });

  if (!unit) {
    unit = await createSeedUnit({
      name: config.unitName,
      description: config.unitDescription,
      parentId: parentUnit.id,
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

  console.log('3. Memastikan membership...');
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
      unitId: unit.id,
      userId,
      joinedAt: daysAgo(90 - index),
    }));

  if (newMemberships.length) {
    await prisma.unitMember.createMany({ data: newMemberships });
  }
  console.log(`   OK ${memberIds.length} anggota aktif`);

  console.log('4. Membuat akun sosial media...');
  const socialRows = memberIds.flatMap((userId, index) => {
    const user = allUsers.find((item) => userIds.get(item.key) === userId);
    if (!user || user.key === config.commander.key) {
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

  console.log(`Selesai: ${config.unitName} (${memberIds.length} anggota)`);
  console.log(`   ${config.commander.username} / ${config.commander.password}`);
  console.log(`   ${config.memberUsernamePrefix}_* / Anggota@123!`);

  return { unitName: config.unitName, memberCount: memberIds.length, allUsers };
}

async function main() {
  guardSeedExecution();
  console.log('Menjalankan seed user Kodam...\n');

  const auth = await createKomandoAuthFromEnv();
  const results = [];

  for (const config of [kodamIbbConfig, kodamXxiiConfig]) {
    results.push(await seedUnitUsers(auth, config));
  }

  await assertUnitCommandersHaveActiveMembership();

  console.log('\nRingkasan seed Kodam:');
  for (const result of results) {
    console.log(`   ${result.unitName}: ${result.memberCount} anggota`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error('Seed Kodam gagal', error);
    await prisma.$disconnect();
    process.exit(1);
  });
