import { clientApiFetch } from "./client";
import type { ApifyActorsConfig, SystemSettings } from "./types";

export type UpdateSystemSettingsPayload = {
  apifyApiToken?: string;
  apifyWebhookSecret?: string;
  apifyActors?: ApifyActorsConfig;
};

export async function fetchSystemSettings() {
  return clientApiFetch<SystemSettings>("/api/v1/admin/system-settings");
}

export async function updateSystemSettings(payload: UpdateSystemSettingsPayload) {
  return clientApiFetch<SystemSettings>("/api/v1/admin/system-settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function testApifyConnection(apifyApiToken?: string) {
  return clientApiFetch<{ ok: boolean; username: string | null }>(
    "/api/v1/admin/system-settings/test-apify",
    {
      method: "POST",
      body: JSON.stringify(
        apifyApiToken?.trim() ? { apifyApiToken: apifyApiToken.trim() } : {},
      ),
    },
  );
}
