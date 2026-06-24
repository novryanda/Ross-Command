import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { createKomandoAuth } from '../src/auth/create-better-auth';

type SeedRole = 'super_admin' | 'member';
type SeedPlatform =
  | 'instagram'
  | 'twitter_x'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'other';
type SeedOrderType = 'posting' | 'engagement' | 'counter' | 'report_akun';
type SeedOrderStatus = 'draft' | 'aktif' | 'expired';
type SeedAssignmentStatus = 'belum_dikerjakan' | 'selesai' | 'terlambat';
type SeedActivityType = 'order_created' | 'order_sent' | 'submission_sent';
type SeedGender = 'pria' | 'wanita';
type SeedEmploymentType = 'tni' | 'pns' | 'p3k';

type SeedUser = {
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
  religion?: 'islam' | 'kristen_protestan' | 'katolik' | 'hindu' | 'buddha' | 'konghucu';
  phoneNumber?: string;
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
  createdByKey: string;
  targetUnitKeys: string[];
  targetLeaderUnitKeys?: string[];
  targetUserKeys?: string[];
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
    key: 'kasad',
    fullName: 'Jenderal TNI Maruli Simanjuntak',
    username: 'kasad',
    password: 'Komando@123!',
    role: 'member',
    identityNumber: 'NRP-AD-0001',
  },
  {
    key: 'pangdam_ibb',
    fullName: 'Mayor Jenderal TNI Putranto Gatot',
    username: 'pangdam_ibb',
    password: 'Komando@123!',
    role: 'member',
    identityNumber: 'NRP-KODAM-0001',
  },
  {
    key: 'kasdam_ibb',
    fullName: 'Brigadir Jenderal TNI Hendra Wijaya',
    username: 'kasdam_ibb',
    password: 'Komando@123!',
    role: 'member',
    identityNumber: 'NRP-KODAM-0002',
  },
  {
    key: 'irdam_ibb',
    fullName: 'Kolonel Inf. Bambang Setiawan',
    username: 'irdam_ibb',
    password: 'Komando@123!',
    role: 'member',
    identityNumber: 'NRP-KODAM-0003',
  },
  {
    key: 'asops_kasdam',
    fullName: 'Kolonel Inf. Andi Prasetya',
    username: 'asops_kasdam',
    password: 'Komando@123!',
    role: 'member',
    identityNumber: 'NRP-KODAM-0004',
  },
  {
    key: 'asintel_kasdam',
    fullName: 'Kolonel Inf. Dedi Kurniawan',
    username: 'asintel_kasdam',
    password: 'Komando@123!',
    role: 'member',
    identityNumber: 'NRP-KODAM-0005',
  },
  {
    key: 'danrem_022',
    fullName: 'Kolonel Inf. Ridwan Hutapea',
    username: 'danrem_022',
    password: 'Komandan@123!',
    role: 'member',
    identityNumber: 'NRP-REM-0022',
  },
  {
    key: 'danrem_023',
    fullName: 'Kolonel Inf. Surya Atmaja',
    username: 'danrem_023',
    password: 'Komandan@123!',
    role: 'member',
    identityNumber: 'NRP-REM-0023',
  },
  {
    key: 'danrem_031',
    fullName: 'Kolonel Inf. Fadli Ramadhan',
    username: 'danrem_031',
    password: 'Komandan@123!',
    role: 'member',
    identityNumber: 'NRP-REM-0031',
  },
  {
    key: 'danrem_032',
    fullName: 'Kolonel Inf. Yusuf Maulana',
    username: 'danrem_032',
    password: 'Komandan@123!',
    role: 'member',
    identityNumber: 'NRP-REM-0032',
  },
  {
    key: 'dandenintel',
    fullName: 'Letnan Kolonel Inf. Aditya Wibowo',
    username: 'dandenintel',
    password: 'Komandan@123!',
    role: 'member',
    identityNumber: 'NRP-SAT-0001',
  },
  {
    key: 'dandenpom',
    fullName: 'Letnan Kolonel Cpm. Bayu Saputra',
    username: 'dandenpom',
    password: 'Komandan@123!',
    role: 'member',
    identityNumber: 'NRP-SAT-0002',
  },
  {
    key: 'kadenkesyah',
    fullName: 'Letnan Kolonel Ckm. dr. Reza Pahlevi',
    username: 'kadenkesyah',
    password: 'Komandan@123!',
    role: 'member',
    identityNumber: 'NRP-SAT-0003',
  },
  {
    key: 'danzidam',
    fullName: 'Letnan Kolonel Czi. Hario Nugroho',
    username: 'danzidam',
    password: 'Komandan@123!',
    role: 'member',
    identityNumber: 'NRP-SAT-0004',
  },
  {
    key: 'joko_susilo',
    fullName: 'Sersan Mayor Joko Susilo',
    username: 'joko_susilo',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-REM022-001',
  },
  {
    key: 'agus_salim',
    fullName: 'Sersan Kepala Agus Salim',
    username: 'agus_salim',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-REM022-002',
  },
  {
    key: 'dwi_cahyono',
    fullName: 'Sersan Dwi Cahyono',
    username: 'dwi_cahyono',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-REM022-003',
  },
  {
    key: 'rudi_hartanto',
    fullName: 'Sersan Mayor Rudi Hartanto',
    username: 'rudi_hartanto',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-REM023-001',
  },
  {
    key: 'bayu_pamungkas',
    fullName: 'Sersan Kepala Bayu Pamungkas',
    username: 'bayu_pamungkas',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-REM023-002',
  },
  {
    key: 'indra_lesmana',
    fullName: 'Sersan Indra Lesmana',
    username: 'indra_lesmana',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-REM023-003',
  },
  {
    key: 'hadi_purnomo',
    fullName: 'Sersan Mayor Hadi Purnomo',
    username: 'hadi_purnomo',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-REM031-001',
  },
  {
    key: 'fajar_sidiq',
    fullName: 'Sersan Kepala Fajar Sidiq',
    username: 'fajar_sidiq',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-REM031-002',
  },
  {
    key: 'wahyu_adi',
    fullName: 'Sersan Wahyu Adi',
    username: 'wahyu_adi',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-REM031-003',
  },
  {
    key: 'galih_permana',
    fullName: 'Sersan Mayor Galih Permana',
    username: 'galih_permana',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-REM032-001',
  },
  {
    key: 'tri_wibowo',
    fullName: 'Sersan Kepala Tri Wibowo',
    username: 'tri_wibowo',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-REM032-002',
  },
  {
    key: 'eko_prabowo',
    fullName: 'Sersan Eko Prabowo',
    username: 'eko_prabowo',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-REM032-003',
  },
  {
    key: 'doni_saputro',
    fullName: 'Sersan Kepala Doni Saputro',
    username: 'doni_saputro',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-DENINTEL-001',
  },
  {
    key: 'arif_budiman',
    fullName: 'Sersan Arif Budiman',
    username: 'arif_budiman',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-DENINTEL-002',
  },
  {
    key: 'maman_suherman',
    fullName: 'Sersan Kepala Maman Suherman',
    username: 'maman_suherman',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-DENPOM-001',
  },
  {
    key: 'yanto_kurniawan',
    fullName: 'Sersan Yanto Kurniawan',
    username: 'yanto_kurniawan',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-DENPOM-002',
  },
  {
    key: 'dewi_anggraini',
    fullName: 'Sersan Kepala Dewi Anggraini',
    username: 'dewi_anggraini',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-DENKES-001',
  },
  {
    key: 'lina_marlina',
    fullName: 'Sersan Lina Marlina',
    username: 'lina_marlina',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-DENKES-002',
  },
  {
    key: 'bagus_setiadi',
    fullName: 'Sersan Kepala Bagus Setiadi',
    username: 'bagus_setiadi',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-ZIDAM-001',
  },
  {
    key: 'catur_nugraha',
    fullName: 'Sersan Catur Nugraha',
    username: 'catur_nugraha',
    password: 'Anggota@123!',
    role: 'member',
    identityNumber: 'NRP-ZIDAM-002',
  },
];

const units: SeedUnit[] = [
  {
    key: 'mabes_ad',
    name: 'Mabes AD',
    description: 'Markas Besar Angkatan Darat.',
    commanderKey: 'kasad',
  },
  {
    key: 'kodam_ibb',
    name: 'Kodam I/Bukit Barisan',
    description: 'Komando Daerah Militer I/Bukit Barisan.',
    commanderKey: 'pangdam_ibb',
    parentKey: 'mabes_ad',
  },
  {
    key: 'korem_022',
    name: 'Korem 022/Pantai Timur',
    description: 'Komando Resor Militer 022/Pantai Timur.',
    commanderKey: 'danrem_022',
    parentKey: 'kodam_ibb',
  },
  {
    key: 'korem_023',
    name: 'Korem 023/Kawal Samudera',
    description: 'Komando Resor Militer 023/Kawal Samudera.',
    commanderKey: 'danrem_023',
    parentKey: 'kodam_ibb',
  },
  {
    key: 'korem_031',
    name: 'Korem 031/Wira Bima',
    description: 'Komando Resor Militer 031/Wira Bima.',
    commanderKey: 'danrem_031',
    parentKey: 'kodam_ibb',
  },
  {
    key: 'korem_032',
    name: 'Korem 032/Wirabraja',
    description: 'Komando Resor Militer 032/Wirabraja.',
    commanderKey: 'danrem_032',
    parentKey: 'kodam_ibb',
  },
  {
    key: 'denintel',
    name: 'Satbalakdam - Denintel',
    description: 'Satuan pelaksana Denintel Kodam I/BB.',
    commanderKey: 'dandenintel',
    parentKey: 'kodam_ibb',
  },
  {
    key: 'denpom',
    name: 'Satbalakdam - Denpom',
    description: 'Satuan pelaksana Denpom Kodam I/BB.',
    commanderKey: 'dandenpom',
    parentKey: 'kodam_ibb',
  },
  {
    key: 'denkesyah',
    name: 'Satbalakdam - Denkesyah',
    description: 'Satuan pelaksana Denkesyah Kodam I/BB.',
    commanderKey: 'kadenkesyah',
    parentKey: 'kodam_ibb',
  },
  {
    key: 'zidam',
    name: 'Satbalakdam - Zidam',
    description: 'Satuan pelaksana Zidam Kodam I/BB.',
    commanderKey: 'danzidam',
    parentKey: 'kodam_ibb',
  },
];

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

const membershipPlan: Array<{ userKey: string; unitKey: string }> = [
  { userKey: 'kasad', unitKey: 'mabes_ad' },
  { userKey: 'pangdam_ibb', unitKey: 'kodam_ibb' },
  { userKey: 'kasdam_ibb', unitKey: 'kodam_ibb' },
  { userKey: 'irdam_ibb', unitKey: 'kodam_ibb' },
  { userKey: 'asops_kasdam', unitKey: 'kodam_ibb' },
  { userKey: 'asintel_kasdam', unitKey: 'kodam_ibb' },
  { userKey: 'danrem_022', unitKey: 'korem_022' },
  { userKey: 'danrem_023', unitKey: 'korem_023' },
  { userKey: 'danrem_031', unitKey: 'korem_031' },
  { userKey: 'danrem_032', unitKey: 'korem_032' },
  { userKey: 'dandenintel', unitKey: 'denintel' },
  { userKey: 'dandenpom', unitKey: 'denpom' },
  { userKey: 'kadenkesyah', unitKey: 'denkesyah' },
  { userKey: 'danzidam', unitKey: 'zidam' },
  { userKey: 'joko_susilo', unitKey: 'korem_022' },
  { userKey: 'agus_salim', unitKey: 'korem_022' },
  { userKey: 'dwi_cahyono', unitKey: 'korem_022' },
  { userKey: 'rudi_hartanto', unitKey: 'korem_023' },
  { userKey: 'bayu_pamungkas', unitKey: 'korem_023' },
  { userKey: 'indra_lesmana', unitKey: 'korem_023' },
  { userKey: 'hadi_purnomo', unitKey: 'korem_031' },
  { userKey: 'fajar_sidiq', unitKey: 'korem_031' },
  { userKey: 'wahyu_adi', unitKey: 'korem_031' },
  { userKey: 'galih_permana', unitKey: 'korem_032' },
  { userKey: 'tri_wibowo', unitKey: 'korem_032' },
  { userKey: 'eko_prabowo', unitKey: 'korem_032' },
  { userKey: 'doni_saputro', unitKey: 'denintel' },
  { userKey: 'arif_budiman', unitKey: 'denintel' },
  { userKey: 'maman_suherman', unitKey: 'denpom' },
  { userKey: 'yanto_kurniawan', unitKey: 'denpom' },
  { userKey: 'dewi_anggraini', unitKey: 'denkesyah' },
  { userKey: 'lina_marlina', unitKey: 'denkesyah' },
  { userKey: 'bagus_setiadi', unitKey: 'zidam' },
  { userKey: 'catur_nugraha', unitKey: 'zidam' },
];

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
        const status: SeedOrderStatus =
          index % 11 === 0 ? 'expired' : index % 17 === 0 ? 'draft' : 'aktif';
        const sentAt = status === 'draft' ? null : hoursFromNow(-((index % 12) + 1));
        const deadline =
          status === 'expired'
            ? hoursFromNow(-((index % 8) + 2))
            : hoursFromNow(12 + (index % 72));

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

function createAutoSubmission(
  order: SeedOrder,
  userKey: string,
  memberIndex: number,
): SeedSubmission | undefined {
  if (order.status === 'draft') {
    return undefined;
  }

  if (order.status === 'aktif' && memberIndex % 4 === 3) {
    return undefined;
  }

  if (order.status === 'expired' && memberIndex % 3 === 2) {
    return undefined;
  }

  const submittedAt =
    order.status === 'expired'
      ? hoursFromNow(-((memberIndex % 10) + 1))
      : hoursFromNow(-((memberIndex % 8) + 0.5));
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
    const base = (memberIndex + 1) * 37;

    return {
      metrics: {
        views: base * 12,
        likes: base * 3,
        comments: base,
        shares: Math.max(1, Math.floor(base / 2)),
        reposts: Math.max(1, Math.floor(base / 3)),
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
  validateSeedMembershipPlan();

  console.log('Menjalankan seed Komando Center TNI...\n');

  const auth = await createKomandoAuth(prisma, {
    baseURL: getEnvOrThrow('BETTER_AUTH_URL'),
    secret: getEnvOrThrow('BETTER_AUTH_SECRET'),
    nodeEnv: process.env.NODE_ENV,
    trustedOrigins: parseTrustedOrigins(
      process.env.BETTER_AUTH_TRUSTED_ORIGINS,
    ),
    trustedProxyHeaders: parseBoolean(
      process.env.BETTER_AUTH_TRUST_PROXY_HEADERS,
    ),
  });

  await teardown();

  console.log('1. Membuat users melalui Better Auth...');
  const userIds = new Map<string, string>();
  for (const user of users) {
    const userId = await createSeedUser(auth, user);
    userIds.set(user.key, userId);
  }
  console.log(`   OK ${userIds.size} user dibuat`);

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
        explicitSubmission ?? createAutoSubmission(order, userKey, memberIndex);
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

function guardSeedExecution() {
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

function validateSeedMembershipPlan() {
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

async function assertUnitCommandersHaveActiveMembership() {
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

async function teardown() {
  console.log('Membersihkan data lama...');

  await prisma.activityLog.deleteMany();
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
  await prisma.user.deleteMany();

  console.log('   OK Data lama dibersihkan');
}

async function createSeedUser(
  auth: Awaited<ReturnType<typeof createKomandoAuth>>,
  user: SeedUser,
) {
  const normalizedUsername = user.username.toLowerCase();
  const email = `${normalizedUsername}@internal.komando`;
  const employmentType = user.employmentType ?? 'tni';
  const rank = employmentType === 'tni' ? user.rank ?? inferSeedRank(user.fullName) : null;
  const grade = employmentType === 'tni' ? null : user.grade ?? null;
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

function inferSeedGender(fullName: string): SeedGender {
  return /\b(dewi|lina)\b/i.test(fullName) ? 'wanita' : 'pria';
}

function inferSeedRank(fullName: string) {
  const rankMatch = fullName.match(
    /^(Jenderal TNI|Mayor Jenderal TNI|Brigadir Jenderal TNI|Kolonel [^.]+\.|Letnan Kolonel [^.]+\.|Sersan Mayor|Sersan Kepala|Sersan)\b/i,
  );

  return rankMatch?.[1] ?? 'Prajurit TNI';
}

async function createSeedUnit(params: {
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

function getUnitKeyForUser(userKey: string) {
  const membership = membershipPlan.find((item) => item.userKey === userKey);
  if (!membership) {
    throw new Error(`Membership untuk user "${userKey}" tidak ditemukan`);
  }

  return membership.unitKey;
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


