import Link from "next/link";
import { LockIcon } from "lucide-react";

import { AuthRouteShell } from "@/components/features/auth/auth-route-shell";
import { Button } from "@/components/ui/button";

export default async function LockScreenPage({
  searchParams,
}: {
  searchParams: Promise<{ username?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthRouteShell>
      <div className="space-y-8">
        <div className="space-y-4 text-center">
          <div className="bg-amber-500/10 text-amber-700 mx-auto flex size-12 items-center justify-center rounded-xl dark:text-amber-300">
            <LockIcon className="size-5" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Akun Dikunci</h1>
            <p className="text-muted-foreground text-sm">
              {params.username ? `Username: ${params.username}` : "Akses sementara dibatasi"}
            </p>
          </div>
        </div>

        <div className="space-y-4 text-center">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Akun kamu dikunci sementara karena terlalu banyak percobaan login. Hubungi Admin untuk membuka akses.
          </p>
          <Button asChild className="h-10 w-full">
            <Link href="/login">Kembali ke Login</Link>
          </Button>
        </div>
      </div>
    </AuthRouteShell>
  );
}
