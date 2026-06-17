import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { createKomandoAuth } from '../src/auth/create-better-auth';
import { PrismaClient } from '@prisma/client';

type SeedRole = 'super_admin' | 'member';
type SeedPlatform =
  | 'instagram'
  | 'twitter_x'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'other';
type SeedOrderStatus = 'draft' | 'aktif' | 'expired';
type SeedAssignmentStatus = 'belum_dikerjakan' | 'selesai' | 'terlambat';

type SeedUser = {
  key: string;
  fullName: string;
  username: string;
  password: string;
  role: SeedRole;
  nip?: string;
};

type SeedUnit = {
  key: string;
  name: string;
  description: string;
  commanderKey: string;
  parentKey?: string;
};

type SeedSocialAccount = {
  userKey: string;
  platform: SeedPlatform;
  username: string;
  profileUrl: string;
};

type SeedOrder = {
  key: string;
  title: string;
  orderType: 'posting' | 'engagement' | 'komentar' | 'report_akun';
  description: string;
  targetUrls?: Array<{ platform: SeedPlatform; url: string }>;
  postingSourceUrl?: string;
  postingTargetPlatforms?: SeedPlatform[];
  narration?: string;
  sentiment?: 'positive' | 'negative';
  engagementActions?: Array<'like' | 'share' | 'repost'>;
  reportReason?: string;
  status: SeedOrderStatus;
  deadline: Date;
  sentAt: Date | null;
  createdByKey: string;
  targetUnitKeys: string[];
};

type SeedSubmission = {
  driveLink?: string;
  platformLinks?: Array<{ platform: SeedPlatform; url: string }>;
  notes?: string;
  submittedAt: Date;
};

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getEnvOrThrow('DATABASE_URL'),
    },
  },
});

const users: SeedUser[] = [
  {
    key: 'superadmin',
    fullName: 'Super Admin Sistem',
    username: 'superadmin',
    password: 'Admin@1234!',
    role: 'super_admin',
  },
  {
    key: 'jend_ahmad',
    fullName: 'Jenderal Ahmad Wiranto',
    username: 'jend_ahmad',
    password: 'Jenderal@123!',
    role: 'member',
    nip: 'NIP0000001',
  },
  {
    key: 'kol_budi',
    fullName: 'Kolonel Budi Hartono',
    username: 'kol_budi',
    password: 'Kolonel@123!',
    role: 'member',
    nip: 'NIP0000002',
  },
  {
    key: 'kol_hendra',
    fullName: 'Kolonel Hendra Kusuma',
    username: 'kol_hendra',
    password: 'Kolonel@123!',
    role: 'member',
    nip: 'NIP0000003',
  },
  {
    key: 'kpt_sari',
    fullName: 'Kapten Sari Dewi',
    username: 'kpt_sari',
    password: 'Kapten@123!',
    role: 'member',
    nip: 'NIP0000004',
  },
  {
    key: 'kpt_rudi',
    fullName: 'Kapten Rudi Hermawan',
    username: 'kpt_rudi',
    password: 'Kapten@123!',
    role: 'member',
    nip: 'NIP0000005',
  },
  {
    key: 'kpt_lisa',
    fullName: 'Kapten Lisa Amelia',
    username: 'kpt_lisa',
    password: 'Kapten@123!',
    role: 'member',
    nip: 'NIP0000006',
  },
  {
    key: 'budi_santoso',
    fullName: 'Sersan Budi Santoso',
    username: 'budi_santoso',
    password: 'Anggota@123!',
    role: 'member',
    nip: 'NIP0000007',
  },
  {
    key: 'andi_kurnia',
    fullName: 'Kopral Andi Kurnia',
    username: 'andi_kurnia',
    password: 'Anggota@123!',
    role: 'member',
    nip: 'NIP0000008',
  },
  {
    key: 'deni_pratama',
    fullName: 'Prajurit Deni Pratama',
    username: 'deni_pratama',
    password: 'Anggota@123!',
    role: 'member',
    nip: 'NIP0000009',
  },
  {
    key: 'eko_saputro',
    fullName: 'Prajurit Eko Saputro',
    username: 'eko_saputro',
    password: 'Anggota@123!',
    role: 'member',
    nip: 'NIP0000010',
  },
  {
    key: 'tono_wijaya',
    fullName: 'Sersan Tono Wijaya',
    username: 'tono_wijaya',
    password: 'Anggota@123!',
    role: 'member',
    nip: 'NIP0000011',
  },
  {
    key: 'yudi_prasetyo',
    fullName: 'Kopral Yudi Prasetyo',
    username: 'yudi_prasetyo',
    password: 'Anggota@123!',
    role: 'member',
    nip: 'NIP0000012',
  },
  {
    key: 'agus_setiawan',
    fullName: 'Prajurit Agus Setiawan',
    username: 'agus_setiawan',
    password: 'Anggota@123!',
    role: 'member',
    nip: 'NIP0000013',
  },
  {
    key: 'wahyu_nugroho',
    fullName: 'Sersan Wahyu Nugroho',
    username: 'wahyu_nugroho',
    password: 'Anggota@123!',
    role: 'member',
    nip: 'NIP0000014',
  },
  {
    key: 'rina_marlina',
    fullName: 'Kopral Rina Marlina',
    username: 'rina_marlina',
    password: 'Anggota@123!',
    role: 'member',
    nip: 'NIP0000015',
  },
];

const units: SeedUnit[] = [
  {
    key: 'komando_pusat',
    name: 'Komando Pusat',
    description: 'Markas komando pusat nasional.',
    commanderKey: 'jend_ahmad',
  },
  {
    key: 'batalyon_alpha',
    name: 'Batalyon Alpha',
    description: 'Batalyon Alpha untuk operasi wilayah barat.',
    commanderKey: 'kol_budi',
    parentKey: 'komando_pusat',
  },
  {
    key: 'batalyon_beta',
    name: 'Batalyon Beta',
    description: 'Batalyon Beta untuk operasi wilayah timur.',
    commanderKey: 'kol_hendra',
    parentKey: 'komando_pusat',
  },
  {
    key: 'kompi_a',
    name: 'Kompi A',
    description: 'Kompi A di bawah Batalyon Alpha.',
    commanderKey: 'kpt_sari',
    parentKey: 'batalyon_alpha',
  },
  {
    key: 'kompi_b',
    name: 'Kompi B',
    description: 'Kompi B di bawah Batalyon Alpha.',
    commanderKey: 'kpt_rudi',
    parentKey: 'batalyon_alpha',
  },
  {
    key: 'kompi_c',
    name: 'Kompi C',
    description: 'Kompi C di bawah Batalyon Beta.',
    commanderKey: 'kpt_lisa',
    parentKey: 'batalyon_beta',
  },
];

const socialAccounts: SeedSocialAccount[] = [
  {
    userKey: 'budi_santoso',
    platform: 'instagram',
    username: '@budi_santoso',
    profileUrl: 'https://instagram.com/budi_santoso',
  },
  {
    userKey: 'budi_santoso',
    platform: 'twitter_x',
    username: '@budi_tw',
    profileUrl: 'https://twitter.com/budi_tw',
  },
  {
    userKey: 'andi_kurnia',
    platform: 'instagram',
    username: '@andi.kurnia',
    profileUrl: 'https://instagram.com/andi.kurnia',
  },
  {
    userKey: 'andi_kurnia',
    platform: 'tiktok',
    username: '@andi_tiktok',
    profileUrl: 'https://tiktok.com/@andi_tiktok',
  },
  {
    userKey: 'deni_pratama',
    platform: 'instagram',
    username: '@deni_prtm',
    profileUrl: 'https://instagram.com/deni_prtm',
  },
  {
    userKey: 'tono_wijaya',
    platform: 'instagram',
    username: '@tono.wijaya',
    profileUrl: 'https://instagram.com/tono.wijaya',
  },
  {
    userKey: 'tono_wijaya',
    platform: 'facebook',
    username: 'Tono Wijaya',
    profileUrl: 'https://facebook.com/tono.wijaya',
  },
  {
    userKey: 'yudi_prasetyo',
    platform: 'twitter_x',
    username: '@yudi_pras',
    profileUrl: 'https://twitter.com/yudi_pras',
  },
  {
    userKey: 'wahyu_nugroho',
    platform: 'instagram',
    username: '@wahyu_ngrh',
    profileUrl: 'https://instagram.com/wahyu_ngrh',
  },
  {
    userKey: 'wahyu_nugroho',
    platform: 'tiktok',
    username: '@wahyu.nugroho',
    profileUrl: 'https://tiktok.com/@wahyu.nugroho',
  },
  {
    userKey: 'rina_marlina',
    platform: 'instagram',
    username: '@rina_marlina',
    profileUrl: 'https://instagram.com/rina_marlina',
  },
];

const membershipPlan: Array<{ userKey: string; unitKey: string }> = [
  { userKey: 'kol_budi', unitKey: 'komando_pusat' },
  { userKey: 'kol_hendra', unitKey: 'komando_pusat' },
  { userKey: 'kpt_sari', unitKey: 'kompi_a' },
  { userKey: 'kpt_rudi', unitKey: 'kompi_b' },
  { userKey: 'kpt_lisa', unitKey: 'kompi_c' },
  { userKey: 'budi_santoso', unitKey: 'kompi_a' },
  { userKey: 'andi_kurnia', unitKey: 'kompi_a' },
  { userKey: 'deni_pratama', unitKey: 'kompi_a' },
  { userKey: 'eko_saputro', unitKey: 'kompi_a' },
  { userKey: 'tono_wijaya', unitKey: 'kompi_b' },
  { userKey: 'yudi_prasetyo', unitKey: 'kompi_b' },
  { userKey: 'agus_setiawan', unitKey: 'kompi_b' },
  { userKey: 'wahyu_nugroho', unitKey: 'kompi_c' },
  { userKey: 'rina_marlina', unitKey: 'kompi_c' },
];

const orders: SeedOrder[] = [
  {
    key: 'order_1',
    title: 'Serbu Postingan @target_akun',
    orderType: 'komentar',
    description:
      'Berikan komentar positif dan terkoordinasi pada postingan target.',
    targetUrls: [
      { platform: 'instagram', url: 'https://instagram.com/p/target-serbu-001' },
      { platform: 'facebook', url: 'https://facebook.com/komandopusat/posts/mirror-001' },
    ],
    narration:
      'Dukung kebijakan terbaru dengan bahasa yang sopan, tegas, dan seragam.',
    sentiment: 'positive',
    status: 'aktif',
    deadline: hoursFromNow(3),
    sentAt: hoursFromNow(-1),
    createdByKey: 'kol_budi',
    targetUnitKeys: ['batalyon_alpha'],
  },
  {
    key: 'order_2',
    title: 'Like & Share Postingan Resmi',
    orderType: 'engagement',
    description:
      'Lakukan like dan share untuk meningkatkan jangkauan postingan resmi.',
    targetUrls: [{ platform: 'facebook', url: 'https://facebook.com/komandopusat/posts/official-002' }],
    engagementActions: ['like', 'share'],
    status: 'aktif',
    deadline: hoursFromNow(25),
    sentAt: hoursFromNow(-2),
    createdByKey: 'kol_budi',
    targetUnitKeys: ['batalyon_alpha'],
  },
  {
    key: 'order_3',
    title: 'Upload Konten Kampanye Juni',
    orderType: 'posting',
    description:
      'Unggah materi kampanye Juni ke akun masing-masing sesuai brief pusat.',
    postingSourceUrl: 'https://drive.google.com/file/d/kampanye-juni-brief/view',
    postingTargetPlatforms: ['instagram', 'facebook', 'tiktok'],
    narration: 'Pastikan caption mengikuti tone resmi satuan.',
    status: 'expired',
    deadline: daysAgo(2),
    sentAt: daysAgo(5),
    createdByKey: 'jend_ahmad',
    targetUnitKeys: ['komando_pusat'],
  },
  {
    key: 'order_4',
    title: 'Report Akun Penyebar Hoaks',
    orderType: 'report_akun',
    description:
      'Laporkan akun penyebar hoaks secara massal untuk mempercepat penindakan.',
    targetUrls: [{ platform: 'twitter_x', url: 'https://twitter.com/akun_hoaks_target' }],
    reportReason: 'Menyebarkan hoaks dan ujaran kebencian.',
    status: 'aktif',
    deadline: hoursFromNow(48),
    sentAt: hoursFromNow(-4),
    createdByKey: 'kol_hendra',
    targetUnitKeys: ['batalyon_beta'],
  },
  {
    key: 'order_5',
    title: 'Komentar Positif Kebijakan Baru',
    orderType: 'komentar',
    description:
      'Tinggalkan komentar yang mendukung kebijakan baru pada postingan resmi.',
    targetUrls: [{ platform: 'instagram', url: 'https://instagram.com/p/kebijakan-baru-003' }],
    narration:
      'Komentar harus singkat, positif, dan menekankan dampak baik kebijakan.',
    sentiment: 'positive',
    status: 'expired',
    deadline: daysAgo(1),
    sentAt: daysAgo(3),
    createdByKey: 'kpt_sari',
    targetUnitKeys: ['kompi_a'],
  },
  {
    key: 'order_6',
    title: 'Draft - Rencana Operasi Berikutnya',
    orderType: 'posting',
    description: 'Draft perintah untuk rencana operasi berikutnya yang belum dikirim.',
    postingSourceUrl: 'https://drive.google.com/file/d/draft-rencana-operasi/view',
    postingTargetPlatforms: ['instagram', 'youtube'],
    status: 'draft',
    deadline: hoursFromNow(7 * 24),
    sentAt: null,
    createdByKey: 'kol_budi',
    targetUnitKeys: [],
  },
];

const assignmentStatuses: Record<
  string,
  Partial<Record<string, SeedAssignmentStatus>>
> = {
  order_1: {
    budi_santoso: 'selesai',
    andi_kurnia: 'selesai',
    tono_wijaya: 'selesai',
  },
  order_3: {
    kol_budi: 'selesai',
    kol_hendra: 'selesai',
    kpt_sari: 'selesai',
    kpt_rudi: 'selesai',
    kpt_lisa: 'selesai',
    budi_santoso: 'selesai',
    andi_kurnia: 'terlambat',
    deni_pratama: 'terlambat',
    wahyu_nugroho: 'selesai',
    rina_marlina: 'selesai',
  },
  order_5: {
    budi_santoso: 'selesai',
    andi_kurnia: 'selesai',
    eko_saputro: 'terlambat',
  },
};

const submissionSpecs: Record<
  string,
  Partial<Record<string, SeedSubmission>>
> = {
  order_1: {
    budi_santoso: {
      driveLink: 'https://drive.google.com/file/d/seed-sub-001/view',
      notes: 'Sudah dikerjakan di 2 akun',
      submittedAt: hoursFromNow(-1),
    },
    andi_kurnia: {
      driveLink: 'https://drive.google.com/file/d/seed-sub-002/view',
      submittedAt: hoursFromNow(-2),
    },
    tono_wijaya: {
      driveLink: 'https://drive.google.com/file/d/seed-sub-003/view',
      submittedAt: hoursFromNow(-0.5),
    },
  },
  order_3: {
    budi_santoso: {
      platformLinks: [
        { platform: 'instagram', url: 'https://instagram.com/p/seed-post-ig-001' },
        { platform: 'facebook', url: 'https://facebook.com/seed-post-fb-001' },
        { platform: 'tiktok', url: 'https://tiktok.com/@seed/video-001' },
      ],
      submittedAt: daysAgo(3),
    },
    andi_kurnia: {
      platformLinks: [
        { platform: 'instagram', url: 'https://instagram.com/p/seed-post-ig-002' },
        { platform: 'facebook', url: 'https://facebook.com/seed-post-fb-002' },
      ],
      notes: 'TikTok belum sempat diunggah',
      submittedAt: daysAgo(1),
    },
    deni_pratama: {
      platformLinks: [
        { platform: 'instagram', url: 'https://instagram.com/p/seed-post-ig-003' },
        { platform: 'facebook', url: 'https://facebook.com/seed-post-fb-003' },
        { platform: 'tiktok', url: 'https://tiktok.com/@seed/video-003' },
      ],
      submittedAt: daysAgo(1),
    },
    wahyu_nugroho: {
      platformLinks: [
        { platform: 'instagram', url: 'https://instagram.com/p/seed-post-ig-004' },
        { platform: 'facebook', url: 'https://facebook.com/seed-post-fb-004' },
        { platform: 'tiktok', url: 'https://tiktok.com/@seed/video-004' },
      ],
      submittedAt: daysAgo(3),
    },
    rina_marlina: {
      platformLinks: [
        { platform: 'instagram', url: 'https://instagram.com/p/seed-post-ig-005' },
        { platform: 'tiktok', url: 'https://tiktok.com/@seed/video-005' },
      ],
      submittedAt: daysAgo(3),
    },
    kpt_sari: {
      platformLinks: [
        { platform: 'instagram', url: 'https://instagram.com/p/seed-post-ig-006' },
        { platform: 'facebook', url: 'https://facebook.com/seed-post-fb-006' },
        { platform: 'tiktok', url: 'https://tiktok.com/@seed/video-006' },
      ],
      submittedAt: daysAgo(3),
    },
    kpt_rudi: {
      platformLinks: [
        { platform: 'instagram', url: 'https://instagram.com/p/seed-post-ig-007' },
        { platform: 'facebook', url: 'https://facebook.com/seed-post-fb-007' },
        { platform: 'tiktok', url: 'https://tiktok.com/@seed/video-007' },
      ],
      submittedAt: daysAgo(3),
    },
    kpt_lisa: {
      platformLinks: [
        { platform: 'instagram', url: 'https://instagram.com/p/seed-post-ig-008' },
        { platform: 'facebook', url: 'https://facebook.com/seed-post-fb-008' },
        { platform: 'tiktok', url: 'https://tiktok.com/@seed/video-008' },
      ],
      submittedAt: daysAgo(3),
    },
    kol_budi: {
      platformLinks: [
        { platform: 'instagram', url: 'https://instagram.com/p/seed-post-ig-009' },
        { platform: 'facebook', url: 'https://facebook.com/seed-post-fb-009' },
        { platform: 'tiktok', url: 'https://tiktok.com/@seed/video-009' },
      ],
      submittedAt: daysAgo(3),
    },
    kol_hendra: {
      platformLinks: [
        { platform: 'instagram', url: 'https://instagram.com/p/seed-post-ig-010' },
        { platform: 'facebook', url: 'https://facebook.com/seed-post-fb-010' },
        { platform: 'tiktok', url: 'https://tiktok.com/@seed/video-010' },
      ],
      submittedAt: daysAgo(3),
    },
  },
  order_5: {
    budi_santoso: {
      driveLink: 'https://drive.google.com/file/d/seed-sub-014/view',
      submittedAt: daysAgo(2),
    },
    andi_kurnia: {
      driveLink: 'https://drive.google.com/file/d/seed-sub-015/view',
      submittedAt: daysAgo(2),
    },
    eko_saputro: {
      driveLink: 'https://drive.google.com/file/d/seed-sub-016/view',
      notes: 'Maaf terlambat',
      submittedAt: hoursFromNow(-12),
    },
  },
};

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed tidak boleh dijalankan di production.');
  }

  console.log('Menjalankan seed Komando Center...\n');

  const auth = await createKomandoAuth(prisma, {
    baseURL: getEnvOrThrow('BETTER_AUTH_URL'),
    secret: getEnvOrThrow('BETTER_AUTH_SECRET'),
    nodeEnv: process.env.NODE_ENV,
    trustedOrigins: parseTrustedOrigins(
      process.env.BETTER_AUTH_TRUSTED_ORIGINS,
    ),
  });

  await teardown();

  console.log('1. Membuat users melalui Better Auth...');
  const userIds = new Map<string, string>();
  for (const user of users) {
    const createdUserId = await createSeedUser(auth, user);
    userIds.set(user.key, createdUserId);
  }
  console.log(`   OK ${userIds.size} user dibuat`);

  console.log('\n2. Membuat struktur satuan...');
  const unitIds = new Map<string, string>();
  for (const unit of units) {
    const createdUnit = await createSeedUnit({
      ...unit,
      parentId: unit.parentKey ? (unitIds.get(unit.parentKey) ?? null) : null,
      commanderId: userIds.get(unit.commanderKey) ?? null,
    });
    unitIds.set(unit.key, createdUnit.id);
  }
  console.log(`   OK ${unitIds.size} satuan dibuat`);

  console.log('\n3. Membuat membership satuan...');
  await prisma.unitMember.createMany({
    data: membershipPlan.map((membership, index) => ({
      userId: getRequiredMapValue(userIds, membership.userKey, 'user'),
      unitId: getRequiredMapValue(unitIds, membership.unitKey, 'unit'),
      joinedAt: hoursFromNow(-(users.length + index + 1)),
    })),
  });
  console.log(`   OK ${membershipPlan.length} membership dibuat`);

  console.log('\n4. Membuat akun sosial media...');
  await prisma.socialAccount.createMany({
    data: socialAccounts.map((account) => ({
      userId: getRequiredMapValue(userIds, account.userKey, 'user'),
      platform: account.platform,
      username: account.username,
      profileUrl: account.profileUrl,
    })),
  });
  console.log(`   OK ${socialAccounts.length} akun sosial media dibuat`);

  console.log('\n5. Membuat orders dan targets...');
  const orderIds = new Map<string, string>();
  const resolvedOrderMemberIds = new Map<string, string[]>();

  for (const order of orders) {
    const createdOrder = await prisma.order.create({
      data: {
        title: order.title,
        orderType: order.orderType,
        description: order.description,
        narration: order.narration ?? null,
        sentiment: order.sentiment ?? null,
        engagementActions: order.engagementActions ?? undefined,
        reportReason: order.reportReason ?? null,
        postingSourceUrl: order.postingSourceUrl ?? null,
        postingTargetPlatforms: order.postingTargetPlatforms ?? undefined,
        status: order.status,
        deadline: order.deadline,
        sentAt: order.sentAt,
        createdById: getRequiredMapValue(userIds, order.createdByKey, 'user'),
        ...(order.orderType !== 'posting' && order.targetUrls?.length
          ? {
              socialTargets: {
                create: order.targetUrls.map((target, index) => ({
                  platform: target.platform,
                  url: target.url,
                  sortOrder: index,
                })),
              },
            }
          : {}),
      },
    });

    orderIds.set(order.key, createdOrder.id);

    const memberIds = new Set<string>();
    for (const targetUnitKey of order.targetUnitKeys) {
      const unitId = getRequiredMapValue(unitIds, targetUnitKey, 'unit');
      const resolvedMembers = await resolveUnitMemberIds(unitId);
      resolvedMembers.forEach((memberId) => memberIds.add(memberId));

      await prisma.orderTarget.create({
        data: {
          orderId: createdOrder.id,
          targetType: 'unit',
          unitId,
          resolvedMemberCount: resolvedMembers.length,
        },
      });
    }

    resolvedOrderMemberIds.set(order.key, Array.from(memberIds));
  }
  console.log(`   OK ${orders.length} order dibuat`);

  console.log('\n6. Membuat assignments...');
  const assignmentIdByOrderAndUser = new Map<string, string>();
  let totalAssignments = 0;

  for (const order of orders) {
    const orderId = getRequiredMapValue(orderIds, order.key, 'order');
    const memberIds = resolvedOrderMemberIds.get(order.key) ?? [];

    for (const memberId of memberIds) {
      const userKey = getUserKeyById(userIds, memberId);
      const status =
        assignmentStatuses[order.key]?.[userKey] ?? 'belum_dikerjakan';
      const submittedAt = submissionSpecs[order.key]?.[userKey]?.submittedAt;

      const assignment = await prisma.taskAssignment.create({
        data: {
          orderId,
          userId: memberId,
          status,
          assignedAt: order.sentAt ?? order.deadline,
          completedAt:
            status === 'belum_dikerjakan' ? null : (submittedAt ?? new Date()),
        },
      });

      assignmentIdByOrderAndUser.set(`${order.key}:${userKey}`, assignment.id);
      totalAssignments += 1;
    }
  }
  console.log(`   OK ${totalAssignments} assignment dibuat`);

  console.log('\n7. Membuat submissions...');
  const submissionRows = Object.entries(submissionSpecs).flatMap(
    ([orderKey, perUser]) =>
      Object.entries(perUser).flatMap(([userKey, submission]) => {
        if (!submission) {
          return [];
        }

        return [
          {
            assignmentId: getRequiredMapValue(
              assignmentIdByOrderAndUser,
              `${orderKey}:${userKey}`,
              'assignment',
            ),
            userId: getRequiredMapValue(userIds, userKey, 'user'),
            driveLink: submission.driveLink ?? null,
            platformLinks: submission.platformLinks ?? undefined,
            notes: submission.notes ?? null,
            submittedAt: submission.submittedAt,
            isLatest: true,
          },
        ];
      }),
  );

  if (submissionRows.length) {
    await prisma.submission.createMany({
      data: submissionRows,
    });
  }
  console.log(`   OK ${submissionRows.length} submission dibuat`);

  console.log('\nSeed selesai');
  console.log(`   User            : ${userIds.size}`);
  console.log(`   Satuan          : ${unitIds.size}`);
  console.log(`   Social Accounts : ${socialAccounts.length}`);
  console.log(`   Orders          : ${orders.length}`);
  console.log(`   Assignments     : ${totalAssignments}`);
  console.log(`   Submissions     : ${submissionRows.length}`);
}

async function teardown() {
  console.log('Membersihkan data lama...');

  await prisma.submission.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.orderTarget.deleteMany();
  await prisma.order.deleteMany();
  await prisma.socialAccount.deleteMany();
  await prisma.unitMember.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.loginAttempt.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();

  console.log('   OK Data lama dibersihkan');
}

async function createSeedUser(
  auth: Awaited<ReturnType<typeof createKomandoAuth>>,
  user: SeedUser,
) {
  const normalizedUsername = user.username.toLowerCase();
  const email = `${normalizedUsername}@internal.komando`;

  await auth.api.createUser({
    body: {
      email,
      password: user.password,
      name: user.fullName,
      role: user.role,
      data: {
        username: normalizedUsername,
        nip: user.nip ?? null,
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

  if (
    createdUser.role !== user.role ||
    createdUser.nip !== (user.nip ?? null)
  ) {
    await prisma.user.update({
      where: {
        id: createdUser.id,
      },
      data: {
        role: user.role,
        nip: user.nip ?? null,
      },
    });
  }

  return createdUser.id;
}

async function createSeedUnit(params: {
  name: string;
  description: string;
  parentId: string | null;
  commanderId: string | null;
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

async function resolveUnitMemberIds(unitId: string) {
  const unit = await prisma.unit.findUnique({
    where: {
      id: unitId,
    },
  });

  if (!unit) {
    throw new Error(`Unit tidak ditemukan: ${unitId}`);
  }

  const memberships = await prisma.unitMember.findMany({
    where: {
      removedAt: null,
      unit: {
        deletedAt: null,
        path: {
          startsWith: unit.path,
        },
      },
      user: {
        deletedAt: null,
      },
    },
    distinct: ['userId'],
    select: {
      userId: true,
    },
  });

  return memberships.map((membership) => membership.userId);
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

function getRequiredMapValue(
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

function getUserKeyById(userIds: Map<string, string>, userId: string) {
  for (const [key, value] of userIds.entries()) {
    if (value === userId) {
      return key;
    }
  }

  throw new Error(`User key untuk id "${userId}" tidak ditemukan`);
}

function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error('Seed gagal', error);
    await prisma.$disconnect();
    process.exit(1);
  });
