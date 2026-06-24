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

export const unlockUserSchema = z.object({
  userId: z.string().uuid(),
});

export const resetPasswordSchema = z.object({
  userId: z.string().uuid(),
  newPassword: z.string().min(8).max(128),
});

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(3).max(150),
  username: z.string().trim().min(3).max(50),
  gender: genderSchema.nullable().optional(),
  employmentType: employmentTypeSchema.nullable().optional(),
  identityNumber: nullableTrimmedString(50),
  rank: nullableTrimmedString(50),
  grade: nullableTrimmedString(50),
  religion: religionSchema.nullable().optional(),
  phoneNumber: nullableTrimmedString(30),
});
