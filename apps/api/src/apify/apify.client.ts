import { Injectable } from '@nestjs/common';
import type { MetricScrapePhase } from '@prisma/client';
import { buildActorRunInput } from './apify.actor-input';

type StartActorRunInput = {
  actorId: string;
  token: string;
  url: string;
  platform: string;
  scrapeRunId: string;
  phase: MetricScrapePhase;
  orderSocialTargetId: string;
  webhookSecret: string;
};

type ApifyRunResponse = {
  data?: {
    id?: string;
    defaultDatasetId?: string;
    status?: string;
  };
};

@Injectable()
export class ApifyClient {
  async startActorRun(input: StartActorRunInput): Promise<{
    runId: string;
    datasetId: string | null;
  }> {
    const publicBaseUrl =
      process.env.API_PUBLIC_BASE_URL ?? 'http://localhost:3001';
    const webhookUrl = `${publicBaseUrl.replace(/\/$/, '')}/api/v1/webhooks/apify?token=${encodeURIComponent(input.webhookSecret)}`;

    const actorRef = encodeURIComponent(input.actorId);
    const actorInput = buildActorRunInput({
      actorId: input.actorId,
      platform: input.platform,
      url: input.url,
    });

    const response = await fetch(
      `https://api.apify.com/v2/acts/${actorRef}/runs?token=${encodeURIComponent(input.token)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...actorInput,
          webhooks: [
            {
              eventTypes: [
                'ACTOR.RUN.SUCCEEDED',
                'ACTOR.RUN.FAILED',
                'ACTOR.RUN.TIMED_OUT',
                'ACTOR.RUN.ABORTED',
              ],
              requestUrl: webhookUrl,
              payloadTemplate: `{"scrapeRunId":"${input.scrapeRunId}","eventType":"{{eventType}}","actorRunId":"{{resource.id}}","status":"{{resource.status}}","defaultDatasetId":"{{resource.defaultDatasetId}}"}`,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Apify run failed (${response.status}): ${errorText.slice(0, 300)}`,
      );
    }

    const payload = (await response.json()) as ApifyRunResponse;
    const runId = payload.data?.id;
    if (!runId) {
      throw new Error('Apify run response missing run id');
    }

    return {
      runId,
      datasetId: payload.data?.defaultDatasetId ?? null,
    };
  }

  async fetchDatasetItems(token: string, datasetId: string): Promise<unknown[]> {
    const response = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${encodeURIComponent(token)}&format=json`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Apify dataset fetch failed (${response.status}): ${errorText.slice(0, 300)}`,
      );
    }

    const payload = await response.json();
    return Array.isArray(payload) ? payload : [];
  }

  async getRunStatus(
    token: string,
    runId: string,
  ): Promise<{ status: string; defaultDatasetId: string | null }> {
    const response = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${encodeURIComponent(token)}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Apify run status failed (${response.status}): ${errorText.slice(0, 300)}`,
      );
    }

    const payload = (await response.json()) as ApifyRunResponse;
    return {
      status: payload.data?.status ?? 'UNKNOWN',
      defaultDatasetId: payload.data?.defaultDatasetId ?? null,
    };
  }
}
