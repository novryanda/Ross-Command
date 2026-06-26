import 'dotenv/config';
import {
  assertUnitCommandersHaveActiveMembership,
  createKomandoAuthFromEnv,
  createSeedUnit,
  createSeedUser,
  daysAgo,
  guardSeedExecution,
  hoursFromNow,
  prisma,
  type SeedUser,
} from './seed-shared';

const UNIT_NAME = 'Pusat Siber TNI Angkatan Darat (Pussiberad)';
const UNIT_KEY = 'pussiberad';
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

const staffUsers: SeedUser[] = [
  {
    key: 'dansiberad',
    fullName: 'Kolonel Czi. Arif Wijaya',
    username: 'dansiberad',
    password: 'Komando@123!',
    role: 'member',
    identityNumber: 'NRP-PUSSIBERAD-0002',
    rank: 'Kolonel Czi.',
  },
  {
    key: 'waka_siber',
    fullName: 'Letnan Kolonel Inf. Bima Santoso',
    username: 'waka_siber',
    password: 'Komando@123!',
    role: 'member',
    identityNumber: 'NRP-PUSSIBERAD-0003',
    rank: 'Letnan Kolonel Inf.',
  },
  {
    key: 'kasiber_ops',
    fullName: 'Mayor Inf. Dimas Pratama',
    username: 'kasiber_ops',
    password: 'Komando@123!',
    role: 'member',
    identityNumber: 'NRP-PUSSIBERAD-0004',
    rank: 'Mayor Inf.',
  },
  {
    key: 'kasiber_intel',
    fullName: 'Mayor Inf. Fajar Nugroho',
    username: 'kasiber_intel',
    password: 'Komando@123!',
    role: 'member',
    identityNumber: 'NRP-PUSSIBERAD-0005',
    rank: 'Mayor Inf.',
  },
  {
    key: 'kasiber_kominfo',
    fullName: 'Kapten Inf. Gilang Ramadhan',
    username: 'kasiber_kominfo',
    password: 'Komando@123!',
    role: 'member',
    identityNumber: 'NRP-PUSSIBERAD-0006',
    rank: 'Kapten Inf.',
  },
];

const memberNames = [
  'Sersan Mayor Hendra Wijaya',
  'Sersan Kepala Rizky Mahendra',
  'Sersan Dwi Saputra',
  'Sersan Kepala Agus Setiawan',
  'Sersan Bayu Nugroho',
  'Sersan Kepala Cahyo Pratama',
  'Sersan Eko Susilo',
  'Sersan Kepala Fajar Hidayat',
  'Sersan Galih Permana',
  'Sersan Kepala Hadi Kurniawan',
  'Sersan Indra Lesmana',
  'Sersan Kepala Joko Santoso',
  'Sersan Kurniawan Adi',
  'Sersan Kepala Lukman Hakim',
  'Sersan Maman Suherman',
  'Sersan Kepala Nanda Pratama',
  'Sersan Oki Ramadhan',
  'Sersan Kepala Putra Wijaya',
  'Sersan Qomaruddin',
  'Sersan Kepala Rudi Hartanto',
  'Sersan Surya Atmaja',
  'Sersan Kepala Taufik Hidayat',
  'Sersan Umar Fadillah',
  'Sersan Kepala Vino Pratama',
  'Sersan Wahyu Adi',
  'Sersan Kepala Yanto Kurniawan',
  'Sersan Zulkarnain',
  'Sersan Kepala Arief Budiman',
  'Sersan Bagus Setiadi',
  'Sersan Kepala Catur Nugraha',
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
    key: `pussiberad_m${String(index + 1).padStart(2, '0')}`,
    fullName,
    username: `psb_${slug}_${String(index + 1).padStart(2, '0')}`,
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: `NRP-PUSSIBERAD-${String(index + 6).padStart(4, '0')}`,
  };
});

const allUsers = [commanderUser, ...staffUsers, ...memberUsers];

const platforms = ['instagram', 'facebook', 'twitter_x', 'tiktok', 'youtube'] as const;

type DemoOrder = {
  title: string;
  orderType: 'posting' | 'counter' | 'report_akun';
  description: string;
  narration?: string;
  reportReason?: string;
  postingSourceUrl?: string;
  postingTargetPlatforms?: Array<(typeof platforms)[number]>;
  socialTargets?: Array<{ platform: (typeof platforms)[number] | 'other'; url: string }>;
  status: 'draft' | 'aktif' | 'selesai' | 'expired';
  deadline: Date;
  sentAt: Date | null;
  submissionRate: number;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildOrders(): DemoOrder[] {
  const orders: DemoOrder[] = [];

  const postingTopics = [
    'Sosialisasi Literasi Digital Prajurit',
    'Kampanye Anti Hoaks Wilayah Kodam',
    'Dukungan Program MBG di Media Sosial',
    'Apresiasi Kesiapan Operasi Siber',
    'Edukasi Keamanan Akun Media Sosial',
    'Narasi Positif Kedisiplinan Prajurit',
    'Promosi Event Webinar Cyber Awareness',
    'Publikasi Capaian Pusat Siber AD',
  ];

  const counterTopics = [
    'Counter Narasi Provokasi Luar Negeri',
    'Kontra Disinformasi Harga Pangan',
    'Penangkal Hoaks Kesehatan Publik',
    'Counter Narasi SARA di Ruang Digital',
    'Kontra Berita Palsu Pemilu Daerah',
    'Penangkal Provokasi Kerusuhan Massa',
    'Counter Narasi Negatif Institusi TNI',
    'Kontra Hoaks Bencana Alam',
  ];

  const reportTopics = [
    'Laporan Akun Penyebar Hoaks BBM',
    'Report Akun Provokator SARA',
    'Monitoring Akun Penipuan Online',
    'Laporan Akun Impersonasi Pimpinan',
    'Report Akun Penyebar Deepfake',
    'Monitoring Akun Spam Politik',
    'Laporan Akun Ujaran Kebencian',
    'Report Akun Scam Investasi Ilegal',
  ];

  postingTopics.forEach((topic, index) => {
    const statusCycle: DemoOrder['status'][] = ['aktif', 'aktif', 'selesai', 'expired', 'aktif', 'draft', 'selesai', 'aktif'];
    const status = statusCycle[index % statusCycle.length];
    const sentAt =
      status === 'draft' ? null : daysAgo(index % 5 === 0 ? 10 : index % 3 === 0 ? 3 : 1);
    const deadline =
      status === 'expired'
        ? daysAgo(2)
        : status === 'selesai'
          ? daysAgo(1)
          : hoursFromNow(12 + index * 6);

    orders.push({
      title: `${BATCH_TAG} Posting — ${topic}`,
      orderType: 'posting',
      description: `Laksanakan posting narasi positif terkait ${topic.toLowerCase()} di akun media sosial masing-masing sesuai platform yang ditentukan.`,
      narration: `Mari dukung ${topic.toLowerCase()} dengan konten yang kredibel, sopan, dan sesuai kaidah komunikasi digital TNI AD.`,
      postingSourceUrl: `https://drive.google.com/file/d/pussiberad-posting-${index + 1}/view`,
      postingTargetPlatforms: [
        platforms[index % 3],
        platforms[(index + 1) % 3],
        platforms[(index + 2) % 3],
      ],
      socialTargets: [
        {
          platform: platforms[index % platforms.length],
          url: `https://instagram.com/p/pussiberad-post-${index + 1}`,
        },
        {
          platform: 'facebook',
          url: `https://facebook.com/pussiberad/posts/${index + 1}`,
        },
      ],
      status,
      deadline,
      sentAt,
      submissionRate: status === 'draft' ? 0 : 0.45 + (index % 4) * 0.12,
    });
  });

  counterTopics.forEach((topic, index) => {
    const statusCycle: DemoOrder['status'][] = ['aktif', 'selesai', 'aktif', 'expired', 'aktif', 'aktif', 'selesai', 'aktif'];
    const status = statusCycle[index % statusCycle.length];
    const sentAt = status === 'draft' ? null : daysAgo(index % 2 === 0 ? 2 : 4);
    const deadline =
      status === 'expired'
        ? daysAgo(1)
        : status === 'selesai'
          ? daysAgo(2)
          : hoursFromNow(18 + index * 4);

    orders.push({
      title: `${BATCH_TAG} Counter — ${topic}`,
      orderType: 'counter',
      description: `Terapkan counter narasi terkait ${topic.toLowerCase()} dengan konten penyeimbang yang kredibel dan tidak provokatif.`,
      narration: `Gunakan data faktual dan bahasa yang menenangkan. Fokus pada edukasi publik dan stabilitas sosial.`,
      socialTargets: [
        {
          platform: 'youtube',
          url: `https://youtube.com/watch?v=pussiberad-counter-${index + 1}`,
        },
        {
          platform: 'twitter_x',
          url: `https://x.com/monitoring/status/pussiberad-counter-${index + 1}`,
        },
        {
          platform: 'tiktok',
          url: `https://tiktok.com/@pussiberad/video/counter-${index + 1}`,
        },
      ],
      status,
      deadline,
      sentAt,
      submissionRate: status === 'draft' ? 0 : 0.5 + (index % 3) * 0.1,
    });
  });

  reportTopics.forEach((topic, index) => {
    const statusCycle: DemoOrder['status'][] = ['aktif', 'aktif', 'selesai', 'aktif', 'expired', 'aktif', 'selesai', 'aktif'];
    const status = statusCycle[index % statusCycle.length];
    const sentAt = status === 'draft' ? null : daysAgo(index % 3 === 0 ? 1 : 3);
    const deadline =
      status === 'expired'
        ? daysAgo(3)
        : status === 'selesai'
          ? daysAgo(1)
          : hoursFromNow(24 + index * 3);

    orders.push({
      title: `${BATCH_TAG} Report — ${topic}`,
      orderType: 'report_akun',
      description: `Pantau dan laporkan akun yang terindikasi terkait ${topic.toLowerCase()} sesuai prosedur pelaporan platform.`,
      reportReason: topic,
      socialTargets: [
        {
          platform: 'other',
          url: `https://www.kompas.com/tag/pussiberad-report-${index + 1}`,
        },
        {
          platform: 'instagram',
          url: `https://instagram.com/accounts/report/pussiberad-${index + 1}`,
        },
      ],
      status,
      deadline,
      sentAt,
      submissionRate: status === 'draft' ? 0 : 0.4 + (index % 5) * 0.1,
    });
  });

  return orders;
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

async function resolveUnitMemberIds(unitId: string) {
  const unit = await prisma.unit.findUnique({ where: { id: unitId } });
  if (!unit) {
    throw new Error(`Unit tidak ditemukan: ${unitId}`);
  }

  const memberships = await prisma.unitMember.findMany({
    where: {
      removedAt: null,
      unit: {
        deletedAt: null,
        path: { startsWith: unit.path },
      },
      user: { deletedAt: null },
    },
    distinct: ['userId'],
    select: { userId: true },
    orderBy: { joinedAt: 'asc' },
  });

  return memberships.map((item) => item.userId);
}

async function main() {
  guardSeedExecution();
  console.log(`Menjalankan seed demo ${UNIT_NAME}...\n`);

  const expectedOrderCount = 24;
  const existingBatch = await prisma.order.count({
    where: {
      title: { startsWith: BATCH_TAG },
      deletedAt: null,
    },
  });

  if (existingBatch >= expectedOrderCount) {
    console.log(`Batch sudah lengkap (${existingBatch} tugas). Lewati pembuatan order.`);
    return;
  }

  if (existingBatch > 0) {
    console.log(`Membersihkan batch tidak lengkap (${existingBatch} tugas)...`);
    await prisma.order.deleteMany({
      where: {
        title: { startsWith: BATCH_TAG },
      },
    });
  }

  const auth = await createKomandoAuthFromEnv();
  const userIds = new Map<string, string>();

  console.log('1. Memastikan user Pussiberad...');
  let createdUsers = 0;
  for (const user of allUsers) {
    if (await ensureUser(auth, user, userIds)) {
      createdUsers += 1;
    }
  }
  console.log(`   OK ${userIds.size} user siap (${createdUsers} baru)`);

  console.log('\n2. Memastikan satuan Pussiberad...');
  let unit = await prisma.unit.findFirst({
    where: {
      name: UNIT_NAME,
      deletedAt: null,
    },
  });

  const commanderId = userIds.get(commanderUser.key);
  if (!commanderId) {
    throw new Error('Commander Pussiberad tidak ditemukan');
  }

  if (!unit) {
    unit = await createSeedUnit({
      name: UNIT_NAME,
      description: 'Pusat operasi siber TNI AD untuk monitoring, counter narasi, dan pelaporan akun.',
      parentId: null,
      commanderId,
    });
    console.log('   OK satuan baru dibuat');
  } else {
    await prisma.unit.update({
      where: { id: unit.id },
      data: { commanderId },
    });
    console.log('   OK satuan sudah ada, commander diperbarui');
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
      joinedAt: daysAgo(60 - index),
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

  console.log('\n5. Membuat tugas posting, counter, dan report...');
  const orders = buildOrders();
  const resolvedMembers = await resolveUnitMemberIds(unit.id);
  let assignmentCount = 0;
  let submissionCount = 0;

  for (const [orderIndex, order] of orders.entries()) {
    const createdOrder = await prisma.order.create({
      data: {
        title: order.title,
        orderType: order.orderType,
        description: order.description,
        narration: order.narration ?? null,
        reportReason: order.reportReason ?? null,
        postingSourceUrl: order.postingSourceUrl ?? null,
        postingTargetPlatforms: order.postingTargetPlatforms ?? undefined,
        status: order.status,
        deadline: order.deadline,
        sentAt: order.sentAt,
        createdAt: daysAgo(7 + (orderIndex % 5)),
        createdById: commanderId,
        socialTargets: order.socialTargets?.length
          ? {
              create: order.socialTargets.map((target, index) => ({
                platform: target.platform,
                url: target.url,
                sortOrder: index,
              })),
            }
          : undefined,
      },
    });

    await prisma.orderTarget.create({
      data: {
        orderId: createdOrder.id,
        targetType: 'unit',
        targetAudience: 'all_members',
        unitId: unit.id,
        resolvedMemberCount: resolvedMembers.length,
      },
    });

    if (order.sentAt) {
      await prisma.activityLog.create({
        data: {
          activityKey: `order_sent-${createdOrder.id}`,
          type: 'order_sent',
          actorUserId: commanderId,
          orderId: createdOrder.id,
          createdAt: order.sentAt,
        },
      });
    }

    const submitCount = Math.floor(resolvedMembers.length * order.submissionRate);

    for (const [memberIndex, memberId] of resolvedMembers.entries()) {
      const shouldSubmit =
        order.status !== 'draft' &&
        order.sentAt &&
        memberIndex < submitCount;

      const status = shouldSubmit
        ? order.status === 'expired'
          ? 'terlambat'
          : 'selesai'
        : 'belum_dikerjakan';

      const assignedAt = order.sentAt ?? createdOrder.createdAt;
      const completedAt = shouldSubmit
        ? new Date(assignedAt.getTime() + (memberIndex + 1) * 45 * 60 * 1000)
        : null;

      const assignment = await prisma.taskAssignment.create({
        data: {
          orderId: createdOrder.id,
          userId: memberId,
          status,
          assignedAt,
          completedAt,
        },
      });
      assignmentCount += 1;

      if (!shouldSubmit) {
        continue;
      }

      const driveLink = `https://drive.google.com/file/d/${slugify(createdOrder.id)}-${memberIndex}/view`;
      const metrics = {
        views: 500 + memberIndex * 37 + orderIndex * 11,
        likes: 40 + (memberIndex % 17),
        comments: memberIndex % 9,
        shares: memberIndex % 6,
        reposts: memberIndex % 4,
      };

      await prisma.submission.create({
        data: {
          assignmentId: assignment.id,
          userId: memberId,
          submittedByUserId: memberId,
          submissionSource: 'self',
          driveLink:
            order.orderType === 'posting' || order.orderType === 'counter'
              ? driveLink
              : null,
          platformLinks:
            order.orderType === 'posting'
              ? order.postingTargetPlatforms?.map((platform) => ({
                  platform,
                  url: `https://${platform === 'twitter_x' ? 'x.com' : `${platform}.com`}/pussiberad/${slugify(createdOrder.title)}/${memberIndex}`,
                }))
              : undefined,
          views: metrics.views,
          likes: metrics.likes,
          comments: metrics.comments,
          shares: metrics.shares,
          reposts: metrics.reposts,
          notes:
            order.orderType === 'counter'
              ? 'Bukti counter narasi sudah diunggah.'
              : order.orderType === 'report_akun'
                ? 'Laporan akun sudah dikirim sesuai prosedur.'
                : 'Bukti posting sudah diunggah.',
          submittedAt: completedAt ?? assignedAt,
          isLatest: true,
        },
      });
      submissionCount += 1;
    }
  }

  console.log(`   OK ${orders.length} tugas dibuat`);
  console.log(`   OK ${assignmentCount} assignment`);
  console.log(`   OK ${submissionCount} submission`);

  console.log('\nSeed Pussiberad selesai');
  console.log(`   Satuan : ${UNIT_NAME}`);
  console.log(`   Anggota: ${memberIds.length}`);
  console.log(`   Tugas  : ${orders.length} (posting/counter/report)`);
  console.log('\nLogin contoh:');
  console.log('   danpussiberad / Komando@123!');
  console.log('   psb_* / Anggota@123!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error('Seed Pussiberad gagal', error);
    await prisma.$disconnect();
    process.exit(1);
  });
