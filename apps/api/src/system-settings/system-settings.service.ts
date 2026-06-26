import { HttpStatus, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { ApiException } from '../common/utils/api-exception.util';
import {
  encryptSecret,
  isEncryptionKeyConfigured,
  maskSecret,
  tryDecryptSecret,
} from '../common/utils/encryption.util';
import {
  type ApifyActorsConfig,
  apifyActorsSchema,
  testApifyConnectionSchema,
  updateSystemSettingsSchema,
} from './system-settings.schema';
import {
  normalizeApifyActorId,
  verifyApifyApiToken,
} from './apify-token.util';

const SETTINGS_ID = 'default';

@Injectable()
export class SystemSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.ensureSettingsRow();

    return this.serializeSettings(settings);
  }

  async updateSettings(userId: string, body: unknown) {
    const parsed = updateSystemSettingsSchema.parse(body);
    const existing = await this.ensureSettingsRow();

    const data: Prisma.SystemSettingUpdateInput = {
      updatedBy: { connect: { id: userId } },
    };

    if (parsed.apifyApiToken) {
      data.apifyApiTokenEnc = encryptSecret(parsed.apifyApiToken);
    }

    if (parsed.apifyWebhookSecret) {
      data.apifyWebhookSecretEnc = encryptSecret(parsed.apifyWebhookSecret);
    }

    if (parsed.apifyActors) {
      data.apifyActors = Object.fromEntries(
        Object.entries(parsed.apifyActors).map(([platform, actorId]) => [
          platform,
          normalizeApifyActorId(actorId),
        ]),
      );
    }

    const updated = await this.prisma.systemSetting.update({
      where: { id: SETTINGS_ID },
      data,
    });

    return this.serializeSettings(updated);
  }

  async testApifyConnection(userId: string, body?: unknown) {
    void userId;
    const parsed = testApifyConnectionSchema.parse(body ?? {});
    const token =
      parsed.apifyApiToken?.trim() || (await this.getApifyApiToken());

    if (!token) {
      throw new ApiException(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'VALIDATION_ERROR',
        'Masukkan Apify API token di form atau simpan token terlebih dahulu',
      );
    }

    try {
      return await verifyApifyApiToken(token);
    } catch (error) {
      throw new ApiException(
        HttpStatus.BAD_GATEWAY,
        'EXTERNAL_SERVICE_ERROR',
        error instanceof Error
          ? error.message
          : 'Gagal terhubung ke Apify. Periksa API token.',
      );
    }
  }

  async getApifyApiToken(): Promise<string | null> {
    const settings = await this.ensureSettingsRow();
    if (!settings.apifyApiTokenEnc) {
      return null;
    }

    return tryDecryptSecret(settings.apifyApiTokenEnc);
  }

  async getApifyWebhookSecret(): Promise<string | null> {
    const settings = await this.ensureSettingsRow();
    if (!settings.apifyWebhookSecretEnc) {
      return null;
    }

    return tryDecryptSecret(settings.apifyWebhookSecretEnc);
  }

  async getApifyActors(): Promise<ApifyActorsConfig> {
    const settings = await this.ensureSettingsRow();
    return apifyActorsSchema.parse(settings.apifyActors ?? {});
  }

  async getActorIdForPlatform(platform: string): Promise<string | null> {
    const actors = await this.getApifyActors();
    const actorId = actors[platform as keyof ApifyActorsConfig];
    return actorId?.trim() || actors.other?.trim() || null;
  }

  private async ensureSettingsRow() {
    return this.prisma.systemSetting.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID },
      update: {},
    });
  }

  private serializeSettings(settings: {
    apifyApiTokenEnc: string | null;
    apifyWebhookSecretEnc: string | null;
    apifyActors: Prisma.JsonValue;
    updatedAt: Date;
  }) {
    const encryptionKeyConfigured = isEncryptionKeyConfigured();
    const decryptedApiToken = tryDecryptSecret(settings.apifyApiTokenEnc);
    const decryptedWebhookSecret = tryDecryptSecret(settings.apifyWebhookSecretEnc);

    const apifyApiToken = decryptedApiToken
      ? maskSecret(decryptedApiToken)
      : null;
    const apifyWebhookSecret = decryptedWebhookSecret
      ? maskSecret(decryptedWebhookSecret)
      : null;

    const secretsDecryptable =
      encryptionKeyConfigured &&
      (!settings.apifyApiTokenEnc || decryptedApiToken !== null) &&
      (!settings.apifyWebhookSecretEnc || decryptedWebhookSecret !== null);

    return {
      apifyApiToken,
      apifyWebhookSecret,
      hasApifyApiToken: Boolean(settings.apifyApiTokenEnc),
      hasApifyWebhookSecret: Boolean(settings.apifyWebhookSecretEnc),
      encryptionKeyConfigured,
      secretsDecryptable,
      apifyActors: apifyActorsSchema.parse(settings.apifyActors ?? {}),
      updatedAt: settings.updatedAt.toISOString(),
    };
  }
}
