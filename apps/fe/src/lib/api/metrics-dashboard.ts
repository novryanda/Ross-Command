import { clientApiFetch } from "./client";
import type { BlastingMetricsDashboard } from "./types";

export async function fetchBlastingMetricsDashboard(orderId: string) {
  return clientApiFetch<BlastingMetricsDashboard>(
    `/api/v1/orders/${orderId}/metrics-dashboard`,
  );
}

export async function retryBlastingMetricsScrape(
  orderId: string,
  phase: "baseline" | "deadline",
) {
  return clientApiFetch<BlastingMetricsDashboard>(
    `/api/v1/orders/${orderId}/metrics-dashboard/retry?phase=${phase}`,
    { method: "POST" },
  );
}
