import { notFound } from "next/navigation";

import { BulkSubmitView } from "@/components/features/orders/bulk-submit-view";
import { BackButton } from "@/components/komando/back-button";
import { PageHero } from "@/components/komando/page-hero";
import { ApiRequestError, type BulkSubmissionList } from "@/lib/api/types";
import { buildQueryString } from "@/lib/api/client";
import { serverApiFetch } from "@/lib/api/server";

export default async function OrderBulkSubmitPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { orderId } = await params;
  const queryParams = await searchParams;
  const unitId = typeof queryParams.unit === "string" ? queryParams.unit : undefined;
  const query = buildQueryString({ unitId });

  let bulkSubmissionResponse;

  try {
    bulkSubmissionResponse = await serverApiFetch<BulkSubmissionList>(
      `/api/v1/orders/${orderId}/bulk-submission${query ? `?${query}` : ""}`,
    );
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const data = bulkSubmissionResponse.data;

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <BackButton
        href={
          unitId
            ? `/orders/${orderId}/monitoring?tab=persatuan&unit=${unitId}`
            : `/orders/${orderId}/monitoring`
        }
        label="Kembali ke monitoring"
      />

      <PageHero
        eyebrow="Bulk submission"
        title="Input Posting Anggota"
        description="Paste link posting dari seluruh anggota satuan. Sistem otomatis mendeteksi platform dari URL."
      />

      <BulkSubmitView orderId={orderId} initialData={data} unitId={unitId} />
    </div>
  );
}
