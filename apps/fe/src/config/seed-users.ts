/**
 * Kredensial seed development — superadmin saja.
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
];
