import { PlatformBadge } from "@/components/komando/badges";
import { BackButton } from "@/components/komando/back-button";
import { PageHero } from "@/components/komando/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { serverApiFetch } from "@/lib/api/server";
import type { UserDetail } from "@/lib/api/types";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const response = await serverApiFetch<UserDetail>(`/api/v1/users/${userId}`);
  const user = response.data;

  return (
    <div className="space-y-6">
      <BackButton href="/admin/users" />

      <PageHero
        eyebrow="Detail user"
        title={user.fullName}
        description={`@${user.username} - ${user.role ?? "member"} - ${user.unit?.name ?? "Tanpa satuan"}`}
      >
        <div className="grid gap-3 md:grid-cols-3">
          <Info label="NIP" value={user.nip ?? "-"} />
          <Info label="Komandan" value={user.isCommander ? "Ya" : "Tidak"} />
          <Info label="Status" value={user.isLocked ? "Dikunci" : "Aktif"} />
        </div>
      </PageHero>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Akun Sosmed</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {user.socialAccounts.length ? (
            user.socialAccounts.map((account) => (
              <div key={account.id} className="rounded-md border bg-muted/20 p-3">
                <PlatformBadge platform={account.platform} />
                <p className="mt-1 text-sm font-medium">{account.username}</p>
                {account.profileUrl ? (
                  <a
                    href={account.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary break-all text-xs hover:underline"
                  >
                    {account.profileUrl}
                  </a>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">Belum ada akun sosmed.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background/70 p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
