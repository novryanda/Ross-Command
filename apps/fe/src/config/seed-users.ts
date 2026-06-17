/**
 * Kredensial seed dari docs/komando-center-seed.md — hanya untuk development.
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
    label: "Komandan",
    users: [
      {
        name: "Jenderal Ahmad Wiranto",
        username: "jend_ahmad",
        password: "Jenderal@123!",
        role: "member",
      },
      {
        name: "Kolonel Budi Hartono",
        username: "kol_budi",
        password: "Kolonel@123!",
        role: "member",
      },
      {
        name: "Kolonel Hendra Kusuma",
        username: "kol_hendra",
        password: "Kolonel@123!",
        role: "member",
      },
    ],
  },
  {
    label: "Kapten",
    users: [
      {
        name: "Kapten Sari Dewi",
        username: "kpt_sari",
        password: "Kapten@123!",
        role: "member",
      },
      {
        name: "Kapten Rudi Hermawan",
        username: "kpt_rudi",
        password: "Kapten@123!",
        role: "member",
      },
      {
        name: "Kapten Lisa Amelia",
        username: "kpt_lisa",
        password: "Kapten@123!",
        role: "member",
      },
    ],
  },
  {
    label: "Anggota",
    users: [
      {
        name: "Sersan Budi Santoso",
        username: "budi_santoso",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Kopral Andi Kurnia",
        username: "andi_kurnia",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Prajurit Deni Pratama",
        username: "deni_pratama",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Prajurit Eko Saputro",
        username: "eko_saputro",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Tono Wijaya",
        username: "tono_wijaya",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Kopral Yudi Prasetyo",
        username: "yudi_prasetyo",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Prajurit Agus Setiawan",
        username: "agus_setiawan",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Sersan Wahyu Nugroho",
        username: "wahyu_nugroho",
        password: "Anggota@123!",
        role: "member",
      },
      {
        name: "Kopral Rina Marlina",
        username: "rina_marlina",
        password: "Anggota@123!",
        role: "member",
      },
    ],
  },
];
