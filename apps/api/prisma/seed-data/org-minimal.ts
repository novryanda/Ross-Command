import type { SeedMembership, SeedUnit, SeedUser } from '../seed-shared';

export const coreUsers: SeedUser[] = [
  {
    key: 'superadmin',
    fullName: 'Super Admin Sistem',
    username: 'superadmin',
    password: 'Admin@1234!',
    role: 'super_admin',
  },
];

export const seedUnits: SeedUnit[] = [];

export const coreMembershipPlan: SeedMembership[] = [];
