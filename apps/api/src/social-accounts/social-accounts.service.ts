import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ApiException } from '../common/utils/api-exception.util';
import {
  listSocialAccountsQuerySchema,
  socialAccountSchema,
} from './social-accounts.schema';

@Injectable()
export class SocialAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async listOwn(userId: string, query: unknown) {
    const parsed = listSocialAccountsQuerySchema.parse(query);
    const accounts = await this.prisma.socialAccount.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(parsed.platform ? { platform: parsed.platform } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return accounts.map((account) => this.serialize(account));
  }

  async create(userId: string, body: unknown) {
    const parsed = socialAccountSchema.parse(body);

    const existing = await this.prisma.socialAccount.findFirst({
      where: {
        userId,
        platform: parsed.platform,
        username: parsed.username,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'CONFLICT',
        'Akun sosial media dengan platform dan username tersebut sudah terdaftar',
      );
    }

    const account = await this.prisma.socialAccount.create({
      data: {
        userId,
        platform: parsed.platform,
        username: parsed.username,
        profileUrl: parsed.profileUrl,
        notes: parsed.notes,
      },
    });

    return this.serialize(account);
  }

  async update(userId: string, socialAccountId: string, body: unknown) {
    const parsed = socialAccountSchema.partial().parse(body);
    const account = await this.ensureOwnership(userId, socialAccountId);

    const updated = await this.prisma.socialAccount.update({
      where: { id: account.id },
      data: {
        ...(parsed.platform ? { platform: parsed.platform } : {}),
        ...(parsed.username ? { username: parsed.username } : {}),
        ...(parsed.profileUrl !== undefined
          ? { profileUrl: parsed.profileUrl }
          : {}),
        ...(parsed.notes !== undefined ? { notes: parsed.notes } : {}),
      },
    });

    return this.serialize(updated);
  }

  async remove(userId: string, socialAccountId: string) {
    const account = await this.ensureOwnership(userId, socialAccountId);
    await this.prisma.socialAccount.update({
      where: { id: account.id },
      data: { deletedAt: new Date() },
    });
  }

  private async ensureOwnership(userId: string, socialAccountId: string) {
    const account = await this.prisma.socialAccount.findFirst({
      where: {
        id: socialAccountId,
        userId,
        deletedAt: null,
      },
    });

    if (!account) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'NOT_FOUND',
        'Akun sosial media tidak ditemukan',
      );
    }

    return account;
  }

  private serialize(account: {
    id: string;
    platform: string;
    username: string;
    profileUrl: string | null;
    notes: string | null;
    createdAt: Date;
  }) {
    return {
      id: account.id,
      platform: account.platform,
      username: account.username,
      profileUrl: account.profileUrl,
      notes: account.notes,
      createdAt: account.createdAt,
    };
  }
}
