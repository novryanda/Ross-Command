import { AccountSettings } from "@/components/features/account/account-settings";
import { PageHero } from "@/components/komando/page-hero";
import { getMe } from "@/lib/api/server";

export default async function SettingsPage() {
  const me = await getMe();

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Akun"
        title="Pengaturan"
        description="Kelola profil dan keamanan akun kamu."
      />
      <AccountSettings me={me} />
    </div>
  );
}
