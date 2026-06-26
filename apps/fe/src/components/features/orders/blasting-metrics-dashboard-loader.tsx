"use client";

import dynamic from "next/dynamic";

import { BlastingMetricsDashboardSkeleton } from "@/components/features/orders/blasting-metrics-dashboard";
import type { BlastingMetricsDashboard } from "@/lib/api/types";

const BlastingMetricsDashboardView = dynamic(
  () =>
    import("@/components/features/orders/blasting-metrics-dashboard").then(
      (module) => module.BlastingMetricsDashboardView,
    ),
  {
    ssr: false,
    loading: () => <BlastingMetricsDashboardSkeleton />,
  },
);

export function BlastingMetricsDashboardLoader({
  initialData,
  orderId,
}: {
  initialData: BlastingMetricsDashboard;
  orderId: string;
}) {
  return <BlastingMetricsDashboardView initialData={initialData} orderId={orderId} />;
}
