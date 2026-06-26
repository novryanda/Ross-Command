import { SystemSettingsForm } from "@/components/features/admin/system-settings-form";
import { PageHero } from "@/components/komando/page-hero";
import { serverApiFetch } from "@/lib/api/server";
import type { SystemSettings } from "@/lib/api/types";

export default async function AdminSystemSettingsPage() {
  const response = await serverApiFetch<SystemSettings>("/api/v1/admin/system-settings");

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Admin"
        title="Konfigurasi Sistem"
        description="Kelola integrasi Apify untuk pengambilan metrik otomatis pada tugas blasting."
      />
      <SystemSettingsForm initialSettings={response.data} />
    </div>
  );
}
