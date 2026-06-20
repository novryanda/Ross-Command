import { SocialAccountsManager } from "@/components/features/social-accounts/social-accounts-manager";
import { PageHero } from "@/components/komando/page-hero";
import { PageState } from "@/components/komando/page-state";
import { serverApiFetch } from "@/lib/api/server";
import type { SocialAccount } from "@/lib/api/types";

export default async function SocialAccountsPage() {
  const response = await serverApiFetch<SocialAccount[]>("/api/v1/social-accounts");

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Kesiapan akun"
        title="Akun Sosmed"
        description="Kelola akun sosial media yang digunakan untuk melaksanakan perintah posting, blasting, komentar, dan report."
      />

      {response.data.length ? (
        <SocialAccountsManager accounts={response.data} />
      ) : (
        <div className="space-y-4">
          <SocialAccountsManager accounts={[]} />
          <PageState title="Belum ada akun sosmed" description="Tambahkan akun pertama agar pimpinan bisa melihat kesiapan pelaksanaan." />
        </div>
      )}
    </div>
  );
}
