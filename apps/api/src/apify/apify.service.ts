import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import type { MetricScrapePhase, MetricScrapeStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { ApiException } from '../common/utils/api-exception.util';
import {
  emptySubmissionMetrics,
  normalizeMetrics,
  subtractMetrics,
  sumMetrics,
  type SubmissionMetrics,
} from '../common/utils/submission.util';
import { SystemSettingsService } from '../system-settings/system-settings.service';
import { ApifyClient } from './apify.client';
import {
  extractApifyDatasetItems,
  mapApifyOutputToMetrics,
  mergeDatasetMetrics,
} from './apify.mapper';

type WebhookPayload = {
  scrapeRunId?: string;
  eventType?: string;
  actorRunId?: string;
  status?: string;
  defaultDatasetId?: string;
};

@Injectable()
export class ApifyService {
  private readonly logger = new Logger(ApifyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly systemSettingsService: SystemSettingsService,
    private readonly apifyClient: ApifyClient,
  ) {}

  async triggerBaselineScrape(orderId: string) {
    return this.triggerScrapeForOrder(orderId, 'baseline');
  }

  async triggerDeadlineScrape(orderId: string) {
    return this.triggerScrapeForOrder(orderId, 'deadline');
  }

  async retryScrape(orderId: string, phase: MetricScrapePhase) {
    const runs = await this.prisma.metricScrapeRun.findMany({
      where: { orderId, phase },
    });

    for (const run of runs) {
      if (run.status === 'running') {
        continue;
      }

      await this.prisma.metricScrapeRun.delete({
        where: { id: run.id },
      });
    }

    return this.triggerScrapeForOrder(orderId, phase);
  }

  async processWebhook(token: string | undefined, body: unknown) {
    const expectedSecret =
      await this.systemSettingsService.getApifyWebhookSecret();
    if (!expectedSecret || token !== expectedSecret) {
      this.logger.warn('Webhook Apify ditolak: token tidak valid');
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        'UNAUTHORIZED',
        'Webhook Apify tidak valid',
      );
    }

    const payload = (body ?? {}) as WebhookPayload;
    const scrapeRunId = payload.scrapeRunId;
    if (!scrapeRunId) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'VALIDATION_ERROR',
        'Payload webhook tidak lengkap',
      );
    }

    const scrapeRun = await this.prisma.metricScrapeRun.findUnique({
      where: { id: scrapeRunId },
      include: {
        orderSocialTarget: true,
      },
    });

    if (!scrapeRun) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'NOT_FOUND',
        'Scrape run tidak ditemukan',
      );
    }

    const eventType = payload.eventType ?? '';
    const status = payload.status ?? '';
    const isSuccess =
      eventType.includes('SUCCEEDED') || status === 'SUCCEEDED';

    if (!isSuccess) {
      await this.markRunFailed(
        scrapeRun.id,
        `Apify run ${status || eventType || 'failed'}`,
      );
      return { ok: true };
    }

    const apifyToken = await this.systemSettingsService.getApifyApiToken();
    if (!apifyToken) {
      await this.markRunFailed(scrapeRun.id, 'Apify API token tidak tersedia');
      return { ok: true };
    }

    let metrics = emptySubmissionMetrics;
    let rawPayload: Prisma.InputJsonValue | undefined;

    try {
      const datasetId = payload.defaultDatasetId;
      if (datasetId) {
        const items = await this.apifyClient.fetchDatasetItems(
          apifyToken,
          datasetId,
        );
        metrics = mergeDatasetMetrics(items);
        rawPayload = items as Prisma.InputJsonValue;
      } else if (payload.actorRunId) {
        const runInfo = await this.apifyClient.getRunStatus(
          apifyToken,
          payload.actorRunId,
        );
        if (runInfo.defaultDatasetId) {
          const items = await this.apifyClient.fetchDatasetItems(
            apifyToken,
            runInfo.defaultDatasetId,
          );
          metrics = mergeDatasetMetrics(items);
          rawPayload = items as Prisma.InputJsonValue;
        } else {
          metrics = mapApifyOutputToMetrics(body);
          rawPayload = body as Prisma.InputJsonValue;
        }
      } else {
        metrics = mapApifyOutputToMetrics(body);
        rawPayload = body as Prisma.InputJsonValue;
      }

      await this.completeScrapeRun(scrapeRun, metrics, rawPayload, payload.actorRunId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Gagal memproses hasil scrape';
      await this.markRunFailed(scrapeRun.id, message);
    }

    return { ok: true };
  }

  async pollRunningScrapeRuns(minAgeMs = 30_000) {
    const token = await this.systemSettingsService.getApifyApiToken();
    if (!token) {
      return;
    }

    const startedBefore = new Date(Date.now() - minAgeMs);
    const runningRuns = await this.prisma.metricScrapeRun.findMany({
      where: {
        status: 'running',
        startedAt: { lt: startedBefore },
        apifyRunId: { not: null },
      },
      include: {
        orderSocialTarget: true,
      },
      take: 20,
    });

    for (const run of runningRuns) {
      await this.syncScrapeRunFromApify(run, token);
    }
  }

  /** @deprecated Use pollRunningScrapeRuns */
  async pollStaleRuns() {
    return this.pollRunningScrapeRuns(30_000);
  }

  async syncScrapeRunById(scrapeRunId: string) {
    const token = await this.systemSettingsService.getApifyApiToken();
    if (!token) {
      return;
    }

    const run = await this.prisma.metricScrapeRun.findUnique({
      where: { id: scrapeRunId },
      include: { orderSocialTarget: true },
    });

    if (!run || run.status !== 'running' || !run.apifyRunId) {
      return;
    }

    await this.syncScrapeRunFromApify(run, token);
  }

  private async syncScrapeRunFromApify(
    run: {
      id: string;
      apifyRunId: string | null;
      phase: MetricScrapePhase;
      orderSocialTargetId: string;
    },
    token: string,
  ) {
    if (!run.apifyRunId) {
      return;
    }

    try {
      const runInfo = await this.apifyClient.getRunStatus(token, run.apifyRunId);
      if (runInfo.status === 'SUCCEEDED' && runInfo.defaultDatasetId) {
        const items = await this.apifyClient.fetchDatasetItems(
          token,
          runInfo.defaultDatasetId,
        );
        const metrics = mergeDatasetMetrics(items);
        await this.completeScrapeRun(
          run,
          metrics,
          items as Prisma.InputJsonValue,
          run.apifyRunId,
        );
        this.logger.log(
          `Scrape run ${run.id} synced from Apify (${run.apifyRunId})`,
        );
        return;
      }

      if (['FAILED', 'TIMED-OUT', 'ABORTED'].includes(runInfo.status)) {
        await this.markRunFailed(run.id, `Apify run ${runInfo.status}`);
      }
    } catch (error) {
      this.logger.warn(
        `Polling scrape run ${run.id} failed: ${error instanceof Error ? error.message : 'unknown'}`,
      );
    }
  }

  private scheduleScrapeRunSync(scrapeRunId: string) {
    const delaysMs = [20_000, 60_000, 120_000];
    for (const delayMs of delaysMs) {
      setTimeout(() => {
        void this.syncScrapeRunById(scrapeRunId);
      }, delayMs);
    }
  }

  private async triggerScrapeForOrder(orderId: string, phase: MetricScrapePhase) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        socialTargets: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!order || order.orderType !== 'engagement') {
      return;
    }

    const token = await this.systemSettingsService.getApifyApiToken();
    const webhookSecret =
      await this.systemSettingsService.getApifyWebhookSecret();

    if (!token || !webhookSecret) {
      this.logger.warn(
        `Skip Apify scrape for order ${orderId}: system settings incomplete`,
      );
      await this.createFailedRunsForTargets(
        orderId,
        order.socialTargets,
        phase,
        'Konfigurasi Apify belum lengkap',
      );
      return;
    }

    for (const target of order.socialTargets) {
      const existing = await this.prisma.metricScrapeRun.findUnique({
        where: {
          orderSocialTargetId_phase: {
            orderSocialTargetId: target.id,
            phase,
          },
        },
      });

      if (existing?.status === 'succeeded' || existing?.status === 'running') {
        continue;
      }

      const actorId = await this.systemSettingsService.getActorIdForPlatform(
        target.platform,
      );

      if (!actorId) {
        await this.upsertFailedRun(
          orderId,
          target.id,
          phase,
          `Actor Apify untuk platform ${target.platform} belum dikonfigurasi`,
        );
        continue;
      }

      const scrapeRun = existing
        ? await this.prisma.metricScrapeRun.update({
            where: { id: existing.id },
            data: {
              status: 'pending',
              errorMessage: null,
              metrics: Prisma.JsonNull,
              rawPayload: Prisma.JsonNull,
              apifyRunId: null,
              apifyActorId: actorId,
              startedAt: new Date(),
              completedAt: null,
            },
          })
        : await this.prisma.metricScrapeRun.create({
            data: {
              orderId,
              orderSocialTargetId: target.id,
              phase,
              status: 'pending',
              apifyActorId: actorId,
            },
          });

      try {
        const started = await this.apifyClient.startActorRun({
          actorId,
          token,
          url: target.url,
          platform: target.platform,
          scrapeRunId: scrapeRun.id,
          phase,
          orderSocialTargetId: target.id,
          webhookSecret,
        });

        await this.prisma.metricScrapeRun.update({
          where: { id: scrapeRun.id },
          data: {
            status: 'running',
            apifyRunId: started.runId,
          },
        });
        void this.scheduleScrapeRunSync(scrapeRun.id);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Gagal memulai scrape Apify';
        await this.markRunFailed(scrapeRun.id, message);
      }
    }
  }

  private async createFailedRunsForTargets(
    orderId: string,
    targets: Array<{ id: string }>,
    phase: MetricScrapePhase,
    message: string,
  ) {
    for (const target of targets) {
      await this.upsertFailedRun(orderId, target.id, phase, message);
    }
  }

  private async upsertFailedRun(
    orderId: string,
    orderSocialTargetId: string,
    phase: MetricScrapePhase,
    message: string,
  ) {
    await this.prisma.metricScrapeRun.upsert({
      where: {
        orderSocialTargetId_phase: {
          orderSocialTargetId,
          phase,
        },
      },
      create: {
        orderId,
        orderSocialTargetId,
        phase,
        status: 'failed',
        errorMessage: message,
        completedAt: new Date(),
      },
      update: {
        status: 'failed',
        errorMessage: message,
        completedAt: new Date(),
      },
    });
  }

  private async markRunFailed(runId: string, message: string) {
    await this.prisma.metricScrapeRun.update({
      where: { id: runId },
      data: {
        status: 'failed',
        errorMessage: message,
        completedAt: new Date(),
      },
    });
  }

  private async completeScrapeRun(
    scrapeRun: {
      id: string;
      phase: MetricScrapePhase;
      orderSocialTargetId: string;
    },
    metrics: SubmissionMetrics,
    rawPayload: Prisma.InputJsonValue | undefined,
    apifyRunId?: string,
  ) {
    const normalized = normalizeMetrics(metrics);
    const now = new Date();

    await this.prisma.metricScrapeRun.update({
      where: { id: scrapeRun.id },
      data: {
        status: 'succeeded',
        metrics: normalized,
        rawPayload: rawPayload ?? Prisma.JsonNull,
        apifyRunId: apifyRunId ?? undefined,
        errorMessage: null,
        completedAt: now,
      },
    });

    if (scrapeRun.phase === 'baseline') {
      await this.prisma.orderSocialTarget.update({
        where: { id: scrapeRun.orderSocialTargetId },
        data: {
          baselineMetrics: normalized,
          baselineScrapedAt: now,
        },
      });
      return;
    }

    await this.prisma.orderSocialTarget.update({
      where: { id: scrapeRun.orderSocialTargetId },
      data: {
        finalMetrics: normalized,
        finalScrapedAt: now,
      },
    });
  }
}

export function computeGrowthPercent(
  baseline: SubmissionMetrics,
  finalMetrics: SubmissionMetrics,
): SubmissionMetrics {
  const keys = ['views', 'likes', 'comments', 'shares', 'reposts'] as const;

  return keys.reduce((result, key) => {
    const base = baseline[key];
    const finalValue = finalMetrics[key];
    if (base <= 0) {
      result[key] = finalValue > 0 ? 100 : 0;
      return result;
    }
    result[key] = Math.round(((finalValue - base) / base) * 100);
    return result;
  }, { ...emptySubmissionMetrics });
}

export function aggregateScrapedTotals(
  targets: Array<{
    baselineMetrics?: SubmissionMetrics | null;
    finalMetrics?: SubmissionMetrics | null;
  }>,
) {
  const baseline = targets.reduce(
    (total, target) =>
      sumMetrics(total, normalizeMetrics(target.baselineMetrics)),
    { ...emptySubmissionMetrics },
  );
  const finalMetrics = targets.reduce(
    (total, target) =>
      sumMetrics(total, normalizeMetrics(target.finalMetrics)),
    { ...emptySubmissionMetrics },
  );

  return {
    baseline,
    final: finalMetrics,
    delta: subtractMetrics(finalMetrics, baseline),
    growthPercent: computeGrowthPercent(baseline, finalMetrics),
  };
}

export function summarizeScrapePhaseStatus(
  runs: Array<{ phase: MetricScrapePhase; status: MetricScrapeStatus }>,
  phase: MetricScrapePhase,
): MetricScrapeStatus {
  const phaseRuns = runs.filter((run) => run.phase === phase);
  if (!phaseRuns.length) {
    return 'pending';
  }
  if (phaseRuns.every((run) => run.status === 'succeeded')) {
    return 'succeeded';
  }
  if (phaseRuns.some((run) => run.status === 'running')) {
    return 'running';
  }
  if (phaseRuns.some((run) => run.status === 'failed')) {
    return 'failed';
  }
  return 'pending';
}
