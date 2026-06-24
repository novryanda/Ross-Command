import { z } from 'zod';

const genderSchema = z.enum(['pria', 'wanita']);
const employmentTypeSchema = z.enum(['tni', 'pns', 'p3k']);
const religionSchema = z.enum([
  'islam',
  'kristen_protestan',
  'katolik',
  'hindu',
  'buddha',
  'konghucu',
]);

const nullableTrimmedString = (max: number) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() || null : value),
    z.string().max(max).nullable().optional(),
  );

const createUserIdentitySchema = z
  .object({
    gender: genderSchema,
    employmentType: employmentTypeSchema,
    identityNumber: z.string().trim().min(1).max(50),
    rank: nullableTrimmedString(50),
    grade: nullableTrimmedString(50),
    religion: religionSchema.nullable().optional(),
    phoneNumber: nullableTrimmedString(30),
  })
  .superRefine((value, context) => {
    if (value.employmentType === 'tni' && !value.rank) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rank'],
        message: 'Pangkat wajib diisi untuk TNI',
      });
    }

    if (value.employmentType !== 'tni' && !value.grade) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['grade'],
        message: 'Golongan wajib diisi untuk PNS/P3K',
      });
    }
  });

const updateUserIdentitySchema = z
  .object({
    gender: genderSchema.nullable().optional(),
    employmentType: employmentTypeSchema.nullable().optional(),
    identityNumber: nullableTrimmedString(50),
    rank: nullableTrimmedString(50),
    grade: nullableTrimmedString(50),
    religion: religionSchema.nullable().optional(),
    phoneNumber: nullableTrimmedString(30),
  })
  .superRefine((value, context) => {
    if (value.employmentType === 'tni' && value.rank === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rank'],
        message: 'Pangkat wajib diisi untuk TNI',
      });
    }

    if (
      (value.employmentType === 'pns' || value.employmentType === 'p3k') &&
      value.grade === null
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['grade'],
        message: 'Golongan wajib diisi untuk PNS/P3K',
      });
    }
  });

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  role: z.string().trim().optional(),
  unitId: z.string().uuid().optional(),
  sortBy: z
    .enum(['createdAt', 'fullName', 'username', 'lastLoginAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createUserSchema = z.object({
  fullName: z.string().trim().min(3).max(150),
  username: z.string().trim().min(3).max(50),
  password: z.string().min(8).max(128),
  role: z.enum(['super_admin', 'member']).default('member'),
  unitId: z.string().uuid().nullable().optional(),
}).and(createUserIdentitySchema);

export const updateUserSchema = z.object({
  fullName: z.string().trim().min(3).max(150).optional(),
  username: z.string().trim().min(3).max(50).optional(),
  role: z.enum(['super_admin', 'member']).optional(),
  unitId: z.string().uuid().nullable().optional(),
}).and(updateUserIdentitySchema);
