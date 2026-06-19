/**
 * Kredensial seed TNI v2 dari docs/komando-center-seed-tni.md.
 * Hanya untuk development / demo internal.
 */

export type SeedUser = {
  name: string;
  username: string;
  password: string;
  role: "super_admin" | "member";
};

export type SeedUserGroup = {
  label: string;
  users: SeedUser[];
};

export const SEED_USER_GROUPS: SeedUserGroup[] = [
  {
    label: "Super Admin",
    users: [
      {
        name: "Super Admin Sistem",
        username: "superadmin",
        password: "Admin@1234!",
        role: "super_admin",
      },
    ],
  },
  {
    label: "Pimpinan AD & Kodam",
    users: [
      {
        name: "Jenderal TNI Maruli Simanjuntak",
        username: "kasad",
        password: "Komando@123!",
        role: "member",
      },
      {
        name: "Mayor Jenderal TNI Putranto Gatot",
        username: "pangdam_ibb",
        password: "Komando@123!",
        role: "member",
      },
      {
        name: "Brigadir Jenderal TNI Hendra Wijaya",
        username: "kasdam_ibb",
        password: "Komando@123!",
        role: "member",
      },
      {
        name: "Kolonel Inf. Bambang Setiawan",
        username: "irdam_ibb",
        password: "Komando@123!",
        role: "member",
      },
      {
        name: "Kolonel Inf. Andi Prasetya",
        username: "asops_kasdam",
        password: "Komando@123!",
        role: "member",
      },
      {
        name: "Kolonel Inf. Dedi Kurniawan",
        username: "asintel_kasdam",
        password: "Komando@123!",
        role: "member",
      },
    ],
  },
  {
    label: "Komandan Satuan",
    users: [
      {
        name: "Kolonel Inf. Ridwan Hutapea",
        username: "danrem_022",
        password: "Komandan@123!",
        role: "member",
      },
      {
        name: "Kolonel Inf. Surya Atmaja",
        username: "danrem_023",
        password: "Komandan@123!",
        role: "member",
      },
      {
        name: "Kolonel Inf. Fadli Ramadhan",
        username: "danrem_031",
        password: "Komandan@123!",
        role: "member",
      },
      {
        name: "Kolonel Inf. Yusuf Maulana",
        username: "danrem_032",
        password: "Komandan@123!",
        role: "member",
      },
      {
        name: "Letnan Kolonel Inf. Aditya Wibowo",
        username: "dandenintel",
        password: "Komandan@123!",
        role: "member",
      },
      {
        name: "Letnan Kolonel Cpm. Bayu Saputra",
        username: "dandenpom",
        password: "Komandan@123!",
        role: "member",
      },
      {
        name: "Letnan Kolonel Ckm. dr. Reza Pahlevi",
        username: "kadenkesyah",
        password: "Komandan@123!",
        role: "member",
      },
      {
        name: "Letnan Kolonel Czi. Hario Nugroho",
        username: "danzidam",
        password: "Komandan@123!",
        role: "member",
      },
    ],
  },
  {
    label: "Anggota Pelaksana",
    users: [
      {
        name: "Sersan Mayor Joko Susilo",
        username: "joko_susilo",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Kepala Agus Salim",
        username: "agus_salim",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Dwi Cahyono",
        username: "dwi_cahyono",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Mayor Rudi Hartanto",
        username: "rudi_hartanto",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Kepala Bayu Pamungkas",
        username: "bayu_pamungkas",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Indra Lesmana",
        username: "indra_lesmana",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Mayor Hadi Purnomo",
        username: "hadi_purnomo",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Kepala Fajar Sidiq",
        username: "fajar_sidiq",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Wahyu Adi",
        username: "wahyu_adi",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Mayor Galih Permana",
        username: "galih_permana",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Kepala Tri Wibowo",
        username: "tri_wibowo",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Eko Prabowo",
        username: "eko_prabowo",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Kepala Doni Saputro",
        username: "doni_saputro",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Arif Budiman",
        username: "arif_budiman",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Kepala Maman Suherman",
        username: "maman_suherman",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Yanto Kurniawan",
        username: "yanto_kurniawan",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Kepala Dewi Anggraini",
        username: "dewi_anggraini",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Lina Marlina",
        username: "lina_marlina",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Kepala Bagus Setiadi",
        username: "bagus_setiadi",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Catur Nugraha",
        username: "catur_nugraha",
        password: "Anggota@123!",
        role: "member",
      },
    ],
  },
];
