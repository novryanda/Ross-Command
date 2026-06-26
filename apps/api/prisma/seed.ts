import 'dotenv/config';
import { encryptSecret } from '../src/common/utils/encryption.util';
import {
  coreMembershipPlan,
  coreUsers,
  seedUnits,
} from './seed-data/org';
import {
  assertUnitCommandersHaveActiveMembership,
  createKomandoAuthFromEnv,
  createSeedUnit,
  createSeedUser,
  daysAgo,
  getRequiredMapValue,
  guardSeedExecution,
  hoursFromNow,
  prisma,
  teardownDatabase,
  validateSeedMembershipPlan,
  type SeedGender,
  type SeedUser,
} from './seed-shared';

type SeedRole = 'super_admin' | 'member';
type SeedPlatform =
  | 'instagram'
  | 'twitter_x'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'other';
type SeedOrderType = 'posting' | 'engagement' | 'counter' | 'report_akun';
type SeedOrderStatus = 'draft' | 'aktif' | 'expired' | 'selesai';
type SeedAssignmentStatus = 'belum_dikerjakan' | 'selesai' | 'terlambat';
type SeedActivityType = 'order_created' | 'order_sent' | 'submission_sent';

type SeedSocialAccount = {
  userKey: string;
  platform: SeedPlatform;
  username: string;
  profileUrl?: string;
};

type SeedOrder = {
  key: string;
  title: string;
  orderType: SeedOrderType;
  description: string;
  narration?: string;
  engagementActions?: Array<'like' | 'share' | 'repost'>;
  reportReason?: string;
  postingSourceUrl?: string;
  postingTargetPlatforms?: SeedPlatform[];
  socialTargets?: Array<{ platform: SeedPlatform; url: string }>;
  status: SeedOrderStatus;
  deadline: Date;
  sentAt: Date | null;
  createdAt?: Date;
  // Porsi anggota yang mengirim bukti (0..1). Mengatur sebaran progres.
  completionRate?: number;
  createdByKey: string;
  targetUnitKeys: string[];
  targetLeaderUnitKeys?: string[];
  targetUserKeys?: string[];
  apifyScrapes?: SeedApifyScrape[];
};

type SeedSubmission = {
  driveLink?: string;
  platformLinks?: Array<{ platform: SeedPlatform; url: string }>;
  metrics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    reposts: number;
  };
  notes?: string;
  submittedByUserKey?: string;
  submittedAt: Date;
};

type SeedMetricSnapshot = {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  reposts: number;
};

type SeedApifyScrape = {
  targetIndex: number;
  baselineMetrics: SeedMetricSnapshot;
  finalMetrics?: SeedMetricSnapshot;
  baselineScrapedAt: Date;
  finalScrapedAt?: Date;
};


const users: SeedUser[] = [...coreUsers];
const units = seedUnits;
const membershipPlan = [...coreMembershipPlan];

const socialAccounts: SeedSocialAccount[] = [
  {
    userKey: 'joko_susilo',
    platform: 'instagram',
    username: '@joko.susilo_tni',
    profileUrl: 'https://instagram.com/joko.susilo_tni',
  },
  {
    userKey: 'joko_susilo',
    platform: 'twitter_x',
    username: '@joko_tni022',
    profileUrl: 'https://x.com/joko_tni022',
  },
  {
    userKey: 'agus_salim',
    platform: 'tiktok',
    username: '@agus.salim.tni',
    profileUrl: 'https://tiktok.com/@agus.salim.tni',
  },
  {
    userKey: 'rudi_hartanto',
    platform: 'instagram',
    username: '@rudi_korem023',
    profileUrl: 'https://instagram.com/rudi_korem023',
  },
  {
    userKey: 'hadi_purnomo',
    platform: 'instagram',
    username: '@hadi.purnomo31',
    profileUrl: 'https://instagram.com/hadi.purnomo31',
  },
  {
    userKey: 'hadi_purnomo',
    platform: 'facebook',
    username: 'Hadi Purnomo TNI',
    profileUrl: 'https://facebook.com/hadi.purnomo31',
  },
  {
    userKey: 'doni_saputro',
    platform: 'twitter_x',
    username: '@doni_denintel',
    profileUrl: 'https://x.com/doni_denintel',
  },
  {
    userKey: 'bagus_setiadi',
    platform: 'instagram',
    username: '@bagus.zidam',
    profileUrl: 'https://instagram.com/bagus.zidam',
  },
];

// === Anggota tambahan (skala besar) agar agregat & distribusi terlihat penuh ===
const extraMemberNamePool: Array<{ name: string; gender: SeedGender }> = [
  { name: 'Bambang Nugroho', gender: 'pria' },
  { name: 'Slamet Riyadi', gender: 'pria' },
  { name: 'Hendra Gunawan', gender: 'pria' },
  { name: 'Agung Prabowo', gender: 'pria' },
  { name: 'Rizal Maulana', gender: 'pria' },
  { name: 'Teguh Santoso', gender: 'pria' },
  { name: 'Anton Wijaya', gender: 'pria' },
  { name: 'Dimas Aryanto', gender: 'pria' },
  { name: 'Faisal Rahman', gender: 'pria' },
  { name: 'Gilang Pratama', gender: 'pria' },
  { name: 'Hari Setiawan', gender: 'pria' },
  { name: 'Irfan Hidayat', gender: 'pria' },
  { name: 'Joni Saputra', gender: 'pria' },
  { name: 'Krisna Adiputra', gender: 'pria' },
  { name: 'Lukman Hakim', gender: 'pria' },
  { name: 'Mahesa Putra', gender: 'pria' },
  { name: 'Nanda Pratomo', gender: 'pria' },
  { name: 'Oki Firmansyah', gender: 'pria' },
  { name: 'Panji Kusuma', gender: 'pria' },
  { name: 'Reza Fahlevi', gender: 'pria' },
  { name: 'Sandi Permadi', gender: 'pria' },
  { name: 'Taufik Hidayat', gender: 'pria' },
  { name: 'Umar Syahputra', gender: 'pria' },
  { name: 'Vino Ramadhan', gender: 'pria' },
  { name: 'Wawan Setiabudi', gender: 'pria' },
  { name: 'Yoga Pratama', gender: 'pria' },
  { name: 'Zaki Abdullah', gender: 'pria' },
  { name: 'Bayu Anggara', gender: 'pria' },
  { name: 'Candra Wirawan', gender: 'pria' },
  { name: 'Dani Kurnia', gender: 'pria' },
  { name: 'Siti Rahmawati', gender: 'wanita' },
  { name: 'Putri Lestari', gender: 'wanita' },
  { name: 'Rina Marwati', gender: 'wanita' },
  { name: 'Maya Anjani', gender: 'wanita' },
  { name: 'Nurul Aisyah', gender: 'wanita' },
  { name: 'Fitri Handayani', gender: 'wanita' },
  { name: 'Eko Wahyudi', gender: 'pria' },
  { name: 'Galang Saputra', gender: 'pria' },
  { name: 'Hafiz Ramadhan', gender: 'pria' },
  { name: 'Ilham Nugraha', gender: 'pria' },
];

const anggotaRanks = [
  'Sersan Mayor',
  'Sersan Kepala',
  'Sersan',
  'Kopral Kepala',
  'Kopral Satu',
  'Praka',
  'Pratu',
];

const extraSocialPlatforms: SeedPlatform[] = [
  'instagram',
  'tiktok',
  'facebook',
  'twitter_x',
  'youtube',
];

const extraMemberUnits: Array<{ unitKey: string; prefix: string; count: number }> = [
  { unitKey: 'korem_022', prefix: 'REM022', count: 5 },
  { unitKey: 'korem_023', prefix: 'REM023', count: 5 },
  { unitKey: 'korem_031', prefix: 'REM031', count: 5 },
  { unitKey: 'korem_032', prefix: 'REM032', count: 5 },
  { unitKey: 'denintel', prefix: 'DENINTEL', count: 4 },
  { unitKey: 'denpom', prefix: 'DENPOM', count: 4 },
  { unitKey: 'denkesyah', prefix: 'DENKES', count: 4 },
  { unitKey: 'zidam', prefix: 'ZIDAM', count: 4 },
];

let extraNameCursor = 0;
for (const spec of extraMemberUnits) {
  for (let i = 1; i <= spec.count; i += 1) {
    const pool = extraMemberNamePool[extraNameCursor % extraMemberNamePool.length];
    const rank = anggotaRanks[extraNameCursor % anggotaRanks.length];
    extraNameCursor += 1;

    const slug = pool.name.toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_|_$/g, '');
    const key = `${spec.unitKey}_m${i}`;
    const host = spec.prefix.toLowerCase();

    users.push({
      key,
      fullName: `${rank} ${pool.name}`,
      username: `${slug}_${host}`,
      password: 'Anggota@123!',
      role: 'member',
      identityNumber: `NRP-${spec.prefix}-1${String(i).padStart(2, '0')}`,
      gender: pool.gender,
      rank,
    });

    membershipPlan.push({ userKey: key, unitKey: spec.unitKey });

    if (i % 2 === 1) {
      const platform = extraSocialPlatforms[extraNameCursor % extraSocialPlatforms.length];
      const domain = platform === 'twitter_x' ? 'x' : platform;
      socialAccounts.push({
        userKey: key,
        platform,
        username: `@${slug}_tni`,
        profileUrl: `https://${domain}.com/${slug}`,
      });
    }
  }
}

const baseOrders: SeedOrder[] = [
  {
    key: 'order_1',
    title: 'Counter Narasi Provokasi Konflik AS-Iran',
    orderType: 'counter',
    description:
      'Laksanakan kontra narasi yang menenangkan situasi dan mengarahkan audiens untuk tetap fokus menjaga persatuan nasional.',
    narration:
      'Mari kita bijak menyikapi pemberitaan internasional. Fokus pada kondisi dalam negeri yang kondusif dan terus jaga persatuan.',
    socialTargets: [
      {
        platform: 'youtube',
        url: 'https://youtube.com/watch?v=as-iran-kembali-panas',
      },
      {
        platform: 'twitter_x',
        url: 'https://x.com/monitoring/status/iran-001',
      },
      {
        platform: 'tiktok',
        url: 'https://tiktok.com/@monitoring/video/iran-001',
      },
    ],
    status: 'aktif',
    deadline: hoursFromNow(6),
    sentAt: hoursFromNow(-1),
    createdByKey: 'pangdam_ibb',
    targetUnitKeys: ['kodam_ibb'],
  },
  {
    key: 'order_2',
    title: 'Monitoring Sebaran Isu Kenaikan Harga BBM',
    orderType: 'report_akun',
    description:
      'Pantau akun-akun yang menyebarkan narasi provokatif terkait kenaikan BBM dan laporkan akun yang melanggar.',
    reportReason: 'Provokasi / Disinformasi Harga',
    status: 'aktif',
    deadline: hoursFromNow(24),
    sentAt: hoursFromNow(-2),
    createdByKey: 'kasdam_ibb',
    targetUnitKeys: ['korem_022', 'korem_023'],
    socialTargets: [
      {
        platform: 'other',
        url: 'https://www.kompas.com/tag/harga-bbm',
      },
    ],
  },
  {
    key: 'order_3',
    title: 'Sosialisasi Positif Program MBG di Wilayah',
    orderType: 'posting',
    description:
      'Unggah narasi dukungan Program Makan Bergizi Gratis di akun resmi masing-masing sesuai platform yang ditentukan.',
    postingSourceUrl: 'https://facebook.com/official/posts/mbg-luhut-001',
    postingTargetPlatforms: ['instagram', 'facebook', 'twitter_x'],
    narration:
      'Program Makan Bergizi Gratis terus dibenahi untuk masa depan generasi bangsa. Mari kita dukung program positif untuk anak-anak Indonesia! #MBG #BersamaMajuBangsa',
    socialTargets: [
      {
        platform: 'instagram',
        url: 'https://instagram.com/p/mbg-reference-001',
      },
      {
        platform: 'facebook',
        url: 'https://facebook.com/official/posts/mbg-reference-001',
      },
      {
        platform: 'twitter_x',
        url: 'https://x.com/official/status/mbg-reference-001',
      },
    ],
    status: 'aktif',
    deadline: hoursFromNow(48),
    sentAt: hoursFromNow(-6),
    createdByKey: 'pangdam_ibb',
    targetUnitKeys: ['korem_022', 'korem_023', 'korem_031', 'korem_032'],
  },
  {
    key: 'order_4',
    title: 'Engagement Klarifikasi Rapat Tertutup Komisi I DPR',
    orderType: 'engagement',
    description:
      'Lakukan like dan share pada sumber klarifikasi resmi agar narasi yang beredar tetap terarah.',
    engagementActions: ['like', 'share'],
    socialTargets: [
      {
        platform: 'other',
        url: 'https://www.liputan6.com/news/read/rapat-tertutup-komisi-i-dpr',
      },
    ],
    apifyScrapes: [
      {
        targetIndex: 0,
        baselineMetrics: {
          views: 12400,
          likes: 820,
          comments: 156,
          shares: 430,
          reposts: 95,
        },
        finalMetrics: {
          views: 28750,
          likes: 2140,
          comments: 402,
          shares: 1180,
          reposts: 310,
        },
        baselineScrapedAt: hoursFromNow(-24),
        finalScrapedAt: hoursFromNow(-10),
      },
    ],
    status: 'expired',
    deadline: hoursFromNow(-12),
    sentAt: hoursFromNow(-24),
    createdByKey: 'asintel_kasdam',
    targetUnitKeys: ['denintel'],
  },
  {
    key: 'order_5',
    title: 'Monitoring Akun Penyebar Hoaks Isu Militer AS-Iran',
    orderType: 'report_akun',
    description:
      'Lakukan pemantauan dan pelaporan akun yang menyebarkan hoaks seputar eskalasi isu militer internasional.',
    reportReason: 'Informasi Palsu / Hoaks Isu Pertahanan',
    socialTargets: [
      {
        platform: 'twitter_x',
        url: 'https://x.com/search?q=isu%20militer%20iran',
      },
    ],
    status: 'expired',
    deadline: daysAgo(1),
    sentAt: daysAgo(2),
    createdByKey: 'danrem_031',
    targetUnitKeys: ['korem_031'],
  },
  {
    key: 'order_6',
    title: 'Draft - Apresiasi Kinerja Pemerintah Triwulan II',
    orderType: 'posting',
    description:
      'Rancangan narasi apresiasi kinerja pemerintah untuk periode triwulan II yang belum dikirim ke jajaran.',
    postingSourceUrl: 'https://drive.google.com/file/d/draft-apresiasi-triwulan-ii/view',
    postingTargetPlatforms: ['instagram', 'facebook'],
    status: 'draft',
    deadline: hoursFromNow(7 * 24),
    sentAt: null,
    createdByKey: 'pangdam_ibb',
    targetUnitKeys: [],
  },
  {
    key: 'order_blasting_apify_demo',
    title: 'Blasting Dukungan Program Digitalisasi Kodam',
    orderType: 'engagement',
    description:
      'Like dan share konten resmi program digitalisasi untuk memperkuat jangkauan narasi positif.',
    engagementActions: ['like', 'share', 'repost'],
    socialTargets: [
      {
        platform: 'instagram',
        url: 'https://instagram.com/p/digitalisasi-kodam-demo',
      },
      {
        platform: 'twitter_x',
        url: 'https://x.com/kodam/status/digitalisasi-kodam-demo',
      },
    ],
    apifyScrapes: [
      {
        targetIndex: 0,
        baselineMetrics: {
          views: 5200,
          likes: 340,
          comments: 48,
          shares: 120,
          reposts: 22,
        },
        finalMetrics: {
          views: 14800,
          likes: 1260,
          comments: 188,
          shares: 540,
          reposts: 96,
        },
        baselineScrapedAt: hoursFromNow(-72),
        finalScrapedAt: hoursFromNow(-4),
      },
      {
        targetIndex: 1,
        baselineMetrics: {
          views: 3100,
          likes: 210,
          comments: 35,
          shares: 88,
          reposts: 41,
        },
        finalMetrics: {
          views: 9200,
          likes: 780,
          comments: 124,
          shares: 310,
          reposts: 155,
        },
        baselineScrapedAt: hoursFromNow(-72),
        finalScrapedAt: hoursFromNow(-4),
      },
    ],
    status: 'expired',
    deadline: hoursFromNow(-6),
    sentAt: hoursFromNow(-70),
    createdByKey: 'pangdam_ibb',
    targetUnitKeys: ['korem_022', 'korem_023'],
    completionRate: 0.75,
  },
  {
    key: 'order_blasting_apify_active',
    title: 'Blasting Klarifikasi Isu Latihan Gabungan',
    orderType: 'engagement',
    description:
      'Distribusikan like dan share pada konten klarifikasi resmi terkait latihan gabungan.',
    engagementActions: ['like', 'share'],
    socialTargets: [
      {
        platform: 'facebook',
        url: 'https://facebook.com/official/posts/latihan-gabungan-klarifikasi',
      },
    ],
    apifyScrapes: [
      {
        targetIndex: 0,
        baselineMetrics: {
          views: 8900,
          likes: 560,
          comments: 92,
          shares: 210,
          reposts: 0,
        },
        baselineScrapedAt: hoursFromNow(-8),
      },
    ],
    status: 'aktif',
    deadline: hoursFromNow(36),
    sentAt: hoursFromNow(-8),
    createdByKey: 'asintel_kasdam',
    targetUnitKeys: ['denintel'],
    completionRate: 0.4,
  },
];

const scenarioTargetSets: Array<{
  key: string;
  label: string;
  createdByKey: string;
  targetUnitKeys: string[];
  targetLeaderUnitKeys: string[];
}> = [
  {
    key: 'root_kodam',
    label: 'Root ke Kodam',
    createdByKey: 'kasad',
    targetUnitKeys: ['kodam_ibb'],
    targetLeaderUnitKeys: ['kodam_ibb'],
  },
  {
    key: 'kodam_korem',
    label: 'Kodam ke Korem',
    createdByKey: 'pangdam_ibb',
    targetUnitKeys: ['korem_022', 'korem_023', 'korem_031', 'korem_032'],
    targetLeaderUnitKeys: ['korem_022', 'korem_023', 'korem_031', 'korem_032'],
  },
  {
    key: 'kodam_satbalak',
    label: 'Kodam ke Satbalakdam',
    createdByKey: 'pangdam_ibb',
    targetUnitKeys: ['denintel', 'denpom', 'denkesyah', 'zidam'],
    targetLeaderUnitKeys: ['denintel', 'denpom', 'denkesyah', 'zidam'],
  },
];

const scenarioTypeTemplates: Record<
  SeedOrderType,
  {
    label: string;
    title: string;
    description: string;
  }
> = {
  posting: {
    label: 'Posting',
    title: 'Publikasi Narasi Positif Terpadu',
    description:
      'Laksanakan publikasi narasi positif sesuai bahan dan platform yang ditentukan.',
  },
  engagement: {
    label: 'Blasting',
    title: 'Blasting Penguatan Narasi Resmi',
    description:
      'Input hasil blasting berupa views, like, comment, share, dan repost pada target yang ditentukan.',
  },
  counter: {
    label: 'Counter',
    title: 'Counter Penyejuk Isu Publik',
    description:
      'Berikan counter narasi yang menyejukkan dan menjaga kondusivitas ruang digital.',
  },
  report_akun: {
    label: 'Report',
    title: 'Report Penyebar Disinformasi',
    description:
      'Laporkan akun atau konten yang terindikasi menyebarkan disinformasi sesuai arahan.',
  },
};

function createScenarioOrders(): SeedOrder[] {
  const targetModes: Array<{
    key: 'satuan' | 'pimpinan' | 'campuran';
    label: string;
  }> = [
    { key: 'satuan', label: 'Satuan' },
    { key: 'pimpinan', label: 'Pimpinan Satuan' },
    { key: 'campuran', label: 'Satuan dan Pimpinan' },
  ];
  const orderTypes: SeedOrderType[] = [
    'posting',
    'engagement',
    'counter',
    'report_akun',
  ];
  const scenarios: SeedOrder[] = [];
  let index = 7;

  for (const targetSet of scenarioTargetSets) {
    for (const orderType of orderTypes) {
      for (const targetMode of targetModes) {
        const template = scenarioTypeTemplates[orderType];

        // Sebar order ke 8 minggu terakhir agar tren perintah membentuk kurva.
        const weekOffset = index % 8; // 0 (minggu ini) .. 7 (8 minggu lalu)
        const jitterHours = (index % 5) * 5;
        const sentHoursAgo = weekOffset * 7 * 24 + 18 + jitterHours;

        // Order terbaru cenderung masih berjalan, yang lama sudah selesai/expired.
        const cycle = index % 10;
        const status: SeedOrderStatus =
          cycle === 0
            ? 'draft'
            : weekOffset <= 1
              ? 'aktif'
              : cycle % 2 === 0
                ? 'selesai'
                : 'expired';

        const createdAt = hoursFromNow(-(sentHoursAgo + 3));
        const sentAt = status === 'draft' ? null : hoursFromNow(-sentHoursAgo);

        let deadline: Date;
        let completionRate: number;
        if (status === 'aktif') {
          deadline = hoursFromNow(12 + (index % 6) * 18); // masih akan datang
          // Variasikan capaian agar distribusi progres terisi semua bucket.
          completionRate = [0.3, 0.6, 0.85, 0.45, 0.95][index % 5];
        } else if (status === 'selesai') {
          deadline = hoursFromNow(-(sentHoursAgo - 36)); // ~1,5 hari setelah dikirim (lampau)
          completionRate = 1;
        } else if (status === 'expired') {
          deadline = hoursFromNow(-(sentHoursAgo - 30)); // lampau
          completionRate = [0.35, 0.55, 0.75][index % 3];
        } else {
          deadline = hoursFromNow(7 * 24);
          completionRate = 0;
        }

        scenarios.push({
          key: `scenario_${String(index).padStart(2, '0')}_${targetSet.key}_${orderType}_${targetMode.key}`,
          title: `${template.label} - ${targetSet.label} - ${targetMode.label}`,
          orderType,
          description: template.description,
          narration:
            orderType === 'counter'
              ? 'Tetap gunakan bahasa yang santun, faktual, dan menenangkan.'
              : orderType === 'posting'
                ? 'Gunakan narasi resmi, hindari opini personal, dan sertakan tagar sesuai arahan.'
                : undefined,
          engagementActions:
            orderType === 'engagement' ? ['like', 'share', 'repost'] : undefined,
          reportReason:
            orderType === 'report_akun'
              ? 'Disinformasi / provokasi ruang digital'
              : undefined,
          postingSourceUrl:
            orderType === 'posting'
              ? `https://drive.google.com/file/d/seed-posting-${index}/view`
              : undefined,
          postingTargetPlatforms:
            orderType === 'posting'
              ? ['instagram', 'facebook', 'twitter_x']
              : undefined,
          socialTargets:
            orderType === 'posting'
              ? [
                  {
                    platform: 'instagram',
                    url: `https://instagram.com/p/seed-posting-${index}`,
                  },
                  {
                    platform: 'facebook',
                    url: `https://facebook.com/official/posts/seed-posting-${index}`,
                  },
                  {
                    platform: 'twitter_x',
                    url: `https://x.com/official/status/seed-posting-${index}`,
                  },
                ]
              : [
                  {
                    platform: orderType === 'engagement' ? 'instagram' : 'other',
                    url: `https://monitoring.internal/target/${index}`,
                  },
                ],
          status,
          deadline,
          sentAt,
          createdAt,
          completionRate,
          createdByKey: targetSet.createdByKey,
          targetUnitKeys:
            targetMode.key === 'pimpinan' ? [] : targetSet.targetUnitKeys,
          targetLeaderUnitKeys:
            targetMode.key === 'satuan' ? [] : targetSet.targetLeaderUnitKeys,
        });

        index += 1;
      }
    }
  }

  return scenarios;
}

const scenarioOrders = createScenarioOrders();
const orders: SeedOrder[] = [...baseOrders, ...scenarioOrders];

const assignmentStatuses: Record<
  string,
  Partial<Record<string, SeedAssignmentStatus>>
> = {
  order_1: {
    joko_susilo: 'selesai',
    agus_salim: 'selesai',
    rudi_hartanto: 'selesai',
  },
  order_2: {
    joko_susilo: 'selesai',
    agus_salim: 'selesai',
    dwi_cahyono: 'selesai',
    rudi_hartanto: 'terlambat',
  },
  order_3: {
    danrem_022: 'selesai',
    danrem_023: 'selesai',
    danrem_031: 'selesai',
    danrem_032: 'terlambat',
    joko_susilo: 'selesai',
    agus_salim: 'selesai',
    dwi_cahyono: 'terlambat',
    rudi_hartanto: 'selesai',
    bayu_pamungkas: 'selesai',
    hadi_purnomo: 'selesai',
    fajar_sidiq: 'terlambat',
  },
  order_4: {
    doni_saputro: 'terlambat',
  },
  order_5: {
    danrem_031: 'selesai',
    hadi_purnomo: 'selesai',
    fajar_sidiq: 'terlambat',
  },
};

const submissionSpecs: Record<
  string,
  Partial<Record<string, SeedSubmission>>
> = {
  order_1: {
    joko_susilo: {
      platformLinks: [
        {
          platform: 'youtube',
          url: 'https://youtube.com/watch?v=submission-joko-iran',
        },
        {
          platform: 'twitter_x',
          url: 'https://x.com/joko_tni022/status/iran-counter-001',
        },
        {
          platform: 'tiktok',
          url: 'https://tiktok.com/@joko.tni022/video/iran-counter-001',
        },
      ],
      notes: 'Counter narasi sudah diposting di tiga platform.',
      submittedAt: hoursFromNow(-0.5),
    },
    agus_salim: {
      platformLinks: [
        {
          platform: 'youtube',
          url: 'https://youtube.com/watch?v=submission-agus-iran',
        },
        {
          platform: 'tiktok',
          url: 'https://tiktok.com/@agus.salim.tni/video/iran-counter-001',
        },
      ],
      submittedAt: hoursFromNow(-1),
    },
    rudi_hartanto: {
      platformLinks: [
        {
          platform: 'twitter_x',
          url: 'https://x.com/rudi_korem023/status/iran-counter-001',
        },
      ],
      submittedAt: hoursFromNow(-2),
    },
  },
  order_2: {
    joko_susilo: {
      driveLink: 'https://drive.google.com/file/d/order2-joko/view',
      submittedAt: hoursFromNow(-1),
    },
    agus_salim: {
      driveLink: 'https://drive.google.com/file/d/order2-agus/view',
      submittedAt: hoursFromNow(-1.5),
    },
    dwi_cahyono: {
      driveLink: 'https://drive.google.com/file/d/order2-dwi/view',
      submittedAt: hoursFromNow(-3),
    },
    rudi_hartanto: {
      driveLink: 'https://drive.google.com/file/d/order2-rudi/view',
      notes: 'Laporan masuk melewati batas waktu.',
      submittedAt: hoursFromNow(2),
    },
  },
  order_3: {
    danrem_022: {
      platformLinks: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/p/mbg-danrem022',
        },
        {
          platform: 'facebook',
          url: 'https://facebook.com/posts/mbg-danrem022',
        },
      ],
      submittedAt: hoursFromNow(-4),
    },
    danrem_023: {
      platformLinks: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/p/mbg-danrem023',
        },
        {
          platform: 'facebook',
          url: 'https://facebook.com/posts/mbg-danrem023',
        },
      ],
      submittedAt: hoursFromNow(-5),
    },
    danrem_031: {
      platformLinks: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/p/mbg-danrem031',
        },
        {
          platform: 'twitter_x',
          url: 'https://x.com/danrem_031/status/mbg-001',
        },
      ],
      submittedAt: hoursFromNow(-3),
    },
    danrem_032: {
      platformLinks: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/p/mbg-danrem032',
        },
      ],
      notes: 'Upload lintas platform selesai melewati deadline internal.',
      submittedAt: hoursFromNow(50),
    },
    joko_susilo: {
      platformLinks: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/p/mbg-joko-001',
        },
        {
          platform: 'facebook',
          url: 'https://facebook.com/posts/mbg-joko-001',
        },
        {
          platform: 'twitter_x',
          url: 'https://x.com/joko_tni022/status/mbg-001',
        },
      ],
      submittedAt: hoursFromNow(-4),
    },
    agus_salim: {
      platformLinks: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/p/mbg-agus-001',
        },
        {
          platform: 'facebook',
          url: 'https://facebook.com/posts/mbg-agus-001',
        },
      ],
      submittedAt: hoursFromNow(-3),
    },
    dwi_cahyono: {
      platformLinks: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/p/mbg-dwi-001',
        },
      ],
      notes: 'Twitter/X menyusul setelah jadwal awal.',
      submittedAt: hoursFromNow(49),
    },
    rudi_hartanto: {
      platformLinks: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/p/mbg-rudi-001',
        },
      ],
      submittedAt: hoursFromNow(-3),
    },
    bayu_pamungkas: {
      platformLinks: [
        {
          platform: 'facebook',
          url: 'https://facebook.com/posts/mbg-bayu-001',
        },
      ],
      submittedAt: hoursFromNow(-2),
    },
    hadi_purnomo: {
      platformLinks: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/p/mbg-hadi-001',
        },
        {
          platform: 'facebook',
          url: 'https://facebook.com/posts/mbg-hadi-001',
        },
      ],
      submittedAt: hoursFromNow(-6),
    },
    fajar_sidiq: {
      platformLinks: [
        {
          platform: 'instagram',
          url: 'https://instagram.com/p/mbg-fajar-001',
        },
      ],
      submittedAt: hoursFromNow(52),
    },
  },
  order_4: {
    doni_saputro: {
      driveLink: 'https://drive.google.com/file/d/order4-doni/view',
      notes: 'Engagement dilakukan setelah deadline.',
      submittedAt: hoursFromNow(-1),
    },
  },
  order_5: {
    danrem_031: {
      driveLink: 'https://drive.google.com/file/d/order5-danrem031/view',
      submittedAt: hoursFromNow(-30),
    },
    hadi_purnomo: {
      driveLink: 'https://drive.google.com/file/d/order5-hadi/view',
      submittedAt: hoursFromNow(-28),
    },
    fajar_sidiq: {
      driveLink: 'https://drive.google.com/file/d/order5-fajar/view',
      notes: 'Pelaporan susulan setelah order berakhir.',
      submittedAt: hoursFromNow(-10),
    },
  },
};

function defaultCompletionRate(status: SeedOrderStatus): number {
  if (status === 'selesai') {
    return 1;
  }
  if (status === 'aktif') {
    return 0.75;
  }
  if (status === 'expired') {
    return 0.6;
  }
  return 0;
}

function resolveAutoSubmittedAt(order: SeedOrder, memberIndex: number): Date {
  const sentMs = (order.sentAt ?? order.createdAt ?? new Date()).getTime();
  const deadlineMs = order.deadline.getTime();

  // Expired: anggota yang submit melakukannya setelah deadline (terlambat).
  if (order.status === 'expired') {
    return new Date(deadlineMs + ((memberIndex % 6) + 1) * 60 * 60 * 1000);
  }

  // Selesai/aktif: submit di antara waktu kirim dan deadline (tepat waktu).
  const span = Math.max(60 * 60 * 1000, deadlineMs - sentMs);
  let submittedMs = sentMs + span * (0.2 + (memberIndex % 5) * 0.13);
  const ceiling = Math.min(deadlineMs - 30 * 60 * 1000, Date.now() - 30 * 60 * 1000);
  if (submittedMs > ceiling) {
    submittedMs = ceiling;
  }
  return new Date(submittedMs);
}

function createAutoSubmission(
  order: SeedOrder,
  userKey: string,
  memberIndex: number,
  totalMembers: number,
): SeedSubmission | undefined {
  if (order.status === 'draft') {
    return undefined;
  }

  const rate = order.completionRate ?? defaultCompletionRate(order.status);
  const submitCount = Math.round(totalMembers * rate);
  if (memberIndex >= submitCount) {
    return undefined;
  }

  const submittedAt = resolveAutoSubmittedAt(order, memberIndex);
  const submittedByUserKey = resolveRepresentedSubmitterKey(
    order,
    userKey,
    memberIndex,
  );

  if (order.orderType === 'posting') {
    const platforms = order.postingTargetPlatforms?.length
      ? order.postingTargetPlatforms
      : (['instagram'] as SeedPlatform[]);

    return {
      platformLinks: platforms.map((platform) => ({
        platform,
        url: `https://${platform}.com/seed/${order.key}/${userKey}`,
      })),
      notes: submittedByUserKey
        ? 'Bukti posting diinput oleh pimpinan satuan.'
        : 'Bukti posting diinput mandiri.',
      submittedByUserKey,
      submittedAt,
    };
  }

  if (order.orderType === 'engagement') {
    // Tiap personel hanya menyumbang 1-2 interaksi (blasting perorangan).
    const oneOrTwo = (offset: number) => ((memberIndex + offset) % 2) + 1;

    return {
      metrics: {
        views: oneOrTwo(0),
        likes: oneOrTwo(1),
        comments: oneOrTwo(2),
        shares: oneOrTwo(0),
        reposts: oneOrTwo(1),
      },
      notes: submittedByUserKey
        ? 'Metrik blasting direkap dan diinput oleh pimpinan satuan.'
        : 'Metrik blasting diinput mandiri.',
      submittedByUserKey,
      submittedAt,
    };
  }

  return {
    driveLink: `https://drive.google.com/file/d/${order.key}-${userKey}/view`,
    notes:
      order.orderType === 'counter'
        ? 'Screenshot counter narasi pelaksanaan sudah diunggah.'
        : 'Bukti pelaporan akun sudah diunggah.',
    submittedByUserKey,
    submittedAt,
  };
}

function resolveRepresentedSubmitterKey(
  order: SeedOrder,
  userKey: string,
  memberIndex: number,
) {
  if (!order.targetUnitKeys.length || memberIndex % 3 !== 1) {
    return undefined;
  }

  const unitKey = getUnitKeyForUser(userKey);
  const commanderKey = units.find((unit) => unit.key === unitKey)?.commanderKey;

  if (!commanderKey || commanderKey === userKey) {
    return undefined;
  }

  return commanderKey;
}

async function main() {
  guardSeedExecution();
  validateSeedMembershipPlan(units, membershipPlan);

  console.log('Menjalankan seed Komando Center TNI...\n');

  const auth = await createKomandoAuthFromEnv();

  await teardownDatabase();

  ensureSeedEncryptionKey();

  console.log('1. Membuat users melalui Better Auth...');
  const userIds = new Map<string, string>();
  for (const user of users) {
    const userId = await createSeedUser(auth, user);
    userIds.set(user.key, userId);
  }
  console.log(`   OK ${userIds.size} user dibuat`);

  await seedSystemSettings(userIds);

  console.log('\n2. Membuat struktur satuan...');
  const unitIds = new Map<string, string>();
  for (const unit of units) {
    const createdUnit = await createSeedUnit({
      name: unit.name,
      description: unit.description,
      parentId: unit.parentKey ? unitIds.get(unit.parentKey) ?? null : null,
      commanderId: getRequiredMapValue(userIds, unit.commanderKey, 'user'),
    });
    unitIds.set(unit.key, createdUnit.id);
  }
  console.log(`   OK ${unitIds.size} satuan dibuat`);

  console.log('\n3. Membuat membership satuan...');
  await prisma.unitMember.createMany({
    data: membershipPlan.map((membership, index) => ({
      userId: getRequiredMapValue(userIds, membership.userKey, 'user'),
      unitId: getRequiredMapValue(unitIds, membership.unitKey, 'unit'),
      joinedAt: hoursFromNow(-(membershipPlan.length + index + 1)),
    })),
  });
  await assertUnitCommandersHaveActiveMembership();
  console.log(`   OK ${membershipPlan.length} membership dibuat`);

  console.log('\n4. Membuat akun sosial media...');
  await prisma.socialAccount.createMany({
    data: socialAccounts.map((account) => ({
      userId: getRequiredMapValue(userIds, account.userKey, 'user'),
      platform: account.platform,
      username: account.username,
      profileUrl: account.profileUrl ?? null,
    })),
  });
  console.log(`   OK ${socialAccounts.length} akun sosial media dibuat`);

  console.log('\n5. Membuat orders, targets, assignments, submissions...');
  const orderIds = new Map<string, string>();
  const assignmentIds = new Map<string, string>();
  const createdActivityLogs: Array<{
    activityKey: string;
    type: SeedActivityType;
    actorUserKey?: string;
    orderId?: string;
    assignmentId?: string;
    submissionId?: string;
    createdAt: Date;
  }> = [];

  let totalAssignments = 0;
  let totalSubmissions = 0;

  for (const order of orders) {
    const createdOrder = await prisma.order.create({
      data: {
        title: order.title,
        orderType: order.orderType,
        description: order.description,
        narration: order.narration ?? null,
        engagementActions: order.engagementActions ?? undefined,
        reportReason: order.reportReason ?? null,
        postingSourceUrl: order.postingSourceUrl ?? null,
        postingTargetPlatforms: order.postingTargetPlatforms ?? undefined,
        status: order.status,
        deadline: order.deadline,
        sentAt: order.sentAt,
        createdAt: order.createdAt ?? undefined,
        createdById: getRequiredMapValue(userIds, order.createdByKey, 'user'),
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

    orderIds.set(order.key, createdOrder.id);
    createdActivityLogs.push({
      activityKey: `order_created-${createdOrder.id}`,
      type: 'order_created',
      actorUserKey: order.createdByKey,
      orderId: createdOrder.id,
      createdAt: createdOrder.createdAt,
    });

    if (order.sentAt) {
      createdActivityLogs.push({
        activityKey: `order_sent-${createdOrder.id}`,
        type: 'order_sent',
        actorUserKey: order.createdByKey,
        orderId: createdOrder.id,
        createdAt: order.sentAt,
      });
    }

    if (order.apifyScrapes?.length) {
      const socialTargetRows = await prisma.orderSocialTarget.findMany({
        where: { orderId: createdOrder.id },
        orderBy: { sortOrder: 'asc' },
      });

      for (const scrape of order.apifyScrapes) {
        const target = socialTargetRows[scrape.targetIndex];
        if (!target) {
          continue;
        }

        await prisma.orderSocialTarget.update({
          where: { id: target.id },
          data: {
            baselineMetrics: scrape.baselineMetrics,
            baselineScrapedAt: scrape.baselineScrapedAt,
            ...(scrape.finalMetrics
              ? {
                  finalMetrics: scrape.finalMetrics,
                  finalScrapedAt: scrape.finalScrapedAt ?? null,
                }
              : {}),
          },
        });

        await prisma.metricScrapeRun.create({
          data: {
            orderId: createdOrder.id,
            orderSocialTargetId: target.id,
            phase: 'baseline',
            status: 'succeeded',
            metrics: scrape.baselineMetrics,
            startedAt: scrape.baselineScrapedAt,
            completedAt: scrape.baselineScrapedAt,
          },
        });

        if (scrape.finalMetrics) {
          await prisma.metricScrapeRun.create({
            data: {
              orderId: createdOrder.id,
              orderSocialTargetId: target.id,
              phase: 'deadline',
              status: 'succeeded',
              metrics: scrape.finalMetrics,
              startedAt: scrape.finalScrapedAt ?? scrape.baselineScrapedAt,
              completedAt: scrape.finalScrapedAt ?? scrape.baselineScrapedAt,
            },
          });
        }
      }
    }

    const resolvedMemberIds = new Set<string>();

    for (const unitKey of order.targetUnitKeys) {
      const unitId = getRequiredMapValue(unitIds, unitKey, 'unit');
      const memberIds = await resolveUnitMemberIds(unitId);
      memberIds.forEach((memberId) => resolvedMemberIds.add(memberId));

      await prisma.orderTarget.create({
        data: {
          orderId: createdOrder.id,
          targetType: 'unit',
          targetAudience: 'all_members',
          unitId,
          resolvedMemberCount: memberIds.length,
        },
      });
    }

    for (const userKey of order.targetUserKeys ?? []) {
      const userId = getRequiredMapValue(userIds, userKey, 'user');
      resolvedMemberIds.add(userId);

      await prisma.orderTarget.create({
        data: {
          orderId: createdOrder.id,
          targetType: 'individual',
          targetAudience: 'direct_user',
          userId,
          resolvedMemberCount: 1,
        },
      });
    }

    for (const unitKey of order.targetLeaderUnitKeys ?? []) {
      const unitId = getRequiredMapValue(unitIds, unitKey, 'unit');
      const leaderIds = await resolveUnitLeaderIds(unitId);
      leaderIds.forEach((leaderId) => resolvedMemberIds.add(leaderId));

      await prisma.orderTarget.create({
        data: {
          orderId: createdOrder.id,
          targetType: 'unit',
          targetAudience: 'unit_leaders',
          unitId,
          resolvedMemberCount: leaderIds.length,
        },
      });
    }

    const orderedMemberIds = Array.from(resolvedMemberIds);
    for (const [memberIndex, memberId] of orderedMemberIds.entries()) {
      const userKey = getUserKeyById(userIds, memberId);
      const explicitSubmission = submissionSpecs[order.key]?.[userKey];
      const autoSubmission =
        explicitSubmission ??
        createAutoSubmission(order, userKey, memberIndex, orderedMemberIds.length);
      const submission = explicitSubmission ?? autoSubmission;
      const status =
        assignmentStatuses[order.key]?.[userKey] ??
        (submission
          ? order.status === 'expired'
            ? 'terlambat'
            : 'selesai'
          : 'belum_dikerjakan');

      const assignment = await prisma.taskAssignment.create({
        data: {
          orderId: createdOrder.id,
          userId: memberId,
          status,
          assignedAt: order.sentAt ?? createdOrder.createdAt,
          completedAt:
            status === 'belum_dikerjakan' ? null : submission?.submittedAt ?? null,
        },
      });

      assignmentIds.set(`${order.key}:${userKey}`, assignment.id);
      totalAssignments += 1;

      if (!submission) {
        continue;
      }

      const submittedByUserKey = submission.submittedByUserKey ?? userKey;
      const submittedByUserId = getRequiredMapValue(
        userIds,
        submittedByUserKey,
        'user',
      );
      const metrics = submission.metrics ?? {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        reposts: 0,
      };
      const createdSubmission = await prisma.submission.create({
        data: {
          assignmentId: assignment.id,
          userId: memberId,
          submittedByUserId,
          submissionSource:
            submittedByUserId === memberId ? 'self' : 'pimpinan',
          driveLink: submission.driveLink ?? null,
          platformLinks: submission.platformLinks ?? undefined,
          views: metrics.views,
          likes: metrics.likes,
          comments: metrics.comments,
          shares: metrics.shares,
          reposts: metrics.reposts,
          notes: submission.notes ?? null,
          submittedAt: submission.submittedAt,
          isLatest: true,
        },
      });

      totalSubmissions += 1;
      createdActivityLogs.push({
        activityKey: `submission_sent-${createdSubmission.id}`,
        type: 'submission_sent',
        actorUserKey: userKey,
        orderId: createdOrder.id,
        assignmentId: assignment.id,
        submissionId: createdSubmission.id,
        createdAt: submission.submittedAt,
      });
    }
  }

  console.log(`   OK ${orders.length} order dibuat`);
  console.log(`   OK ${totalAssignments} assignment dibuat`);
  console.log(`   OK ${totalSubmissions} submission dibuat`);

  console.log('\n6. Membuat activity logs...');
  await prisma.activityLog.createMany({
    data: createdActivityLogs.map((log) => ({
      activityKey: log.activityKey,
      type: log.type,
      actorUserId: log.actorUserKey
        ? getRequiredMapValue(userIds, log.actorUserKey, 'user')
        : null,
      orderId: log.orderId ?? null,
      assignmentId: log.assignmentId ?? null,
      submissionId: log.submissionId ?? null,
      createdAt: log.createdAt,
    })),
  });
  console.log(`   OK ${createdActivityLogs.length} activity log dibuat`);

  console.log('\nSeed selesai');
  console.log(`   User            : ${userIds.size}`);
  console.log(`   Satuan          : ${unitIds.size}`);
  console.log(`   Membership      : ${membershipPlan.length}`);
  console.log(`   Social Accounts : ${socialAccounts.length}`);
  console.log(`   Orders          : ${orders.length}`);
  console.log(`   Assignments     : ${totalAssignments}`);
  console.log(`   Submissions     : ${totalSubmissions}`);
  console.log(`   Activity Logs   : ${createdActivityLogs.length}`);
}

function ensureSeedEncryptionKey() {
  if (!process.env.SETTINGS_ENCRYPTION_KEY) {
    process.env.SETTINGS_ENCRYPTION_KEY =
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  }
}

async function seedSystemSettings(userIds: Map<string, string>) {
  const superAdminId = userIds.get('superadmin');
  await prisma.systemSetting.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      apifyApiTokenEnc: encryptSecret('apify_api_seed_token_placeholder'),
      apifyWebhookSecretEnc: encryptSecret('apify_webhook_seed_secret'),
      apifyActors: {
        instagram: 'apify~instagram-post-scraper',
        twitter_x: 'apify~twitter-scraper',
        facebook: 'apify~facebook-posts-scraper',
        tiktok: 'apify~tiktok-scraper',
        youtube: 'apify~youtube-scraper',
        other: 'apify~website-content-crawler',
      },
      updatedById: superAdminId ?? null,
    },
    update: {
      apifyApiTokenEnc: encryptSecret('apify_api_seed_token_placeholder'),
      apifyWebhookSecretEnc: encryptSecret('apify_webhook_seed_secret'),
      apifyActors: {
        instagram: 'apify~instagram-post-scraper',
        twitter_x: 'apify~twitter-scraper',
        facebook: 'apify~facebook-posts-scraper',
        tiktok: 'apify~tiktok-scraper',
        youtube: 'apify~youtube-scraper',
        other: 'apify~website-content-crawler',
      },
      updatedById: superAdminId ?? null,
    },
  });
  console.log('\n1b. Konfigurasi sistem Apify di-seed');
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

async function resolveUnitLeaderIds(unitId: string) {
  const unit = await prisma.unit.findUnique({
    where: {
      id: unitId,
    },
  });

  if (!unit) {
    throw new Error(`Unit tidak ditemukan: ${unitId}`);
  }

  const units = await prisma.unit.findMany({
    where: {
      deletedAt: null,
      commanderId: {
        not: null,
      },
      path: {
        startsWith: unit.path,
      },
      commander: {
        deletedAt: null,
      },
    },
    distinct: ['commanderId'],
    select: {
      commanderId: true,
    },
  });

  return units
    .map((unit) => unit.commanderId)
    .filter((commanderId): commanderId is string => Boolean(commanderId));
}

function getUserKeyById(userIds: Map<string, string>, userId: string) {
  for (const [key, value] of userIds.entries()) {
    if (value === userId) {
      return key;
    }
  }

  throw new Error(`User key untuk id "${userId}" tidak ditemukan`);
}

function getUnitKeyForUser(userKey: string) {
  const membership = membershipPlan.find((item) => item.userKey === userKey);
  if (!membership) {
    throw new Error(`Membership untuk user "${userKey}" tidak ditemukan`);
  }

  return membership.unitKey;
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


