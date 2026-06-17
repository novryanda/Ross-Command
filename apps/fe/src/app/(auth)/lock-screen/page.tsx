import Link from "next/link";
import { LockIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LockScreenPage({
  searchParams,
}: {
  searchParams: Promise<{ username?: string }>;
}) {
  const params = await searchParams;

  return (
    <Card>
      <CardHeader className="space-y-3 text-center">
        <div className="bg-amber-500/10 text-amber-700 mx-auto flex size-10 items-center justify-center rounded-md">
          <LockIcon className="size-5" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl">Akun Dikunci</CardTitle>
          <CardDescription>{params.username ? `Username: ${params.username}` : "Akses sementara dibatasi"}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-muted-foreground text-sm">
          Akun kamu dikunci sementara karena terlalu banyak percobaan login. Hubungi Admin untuk membuka akses.
        </p>
        <Button asChild className="w-full">
          <Link href="/login">Kembali ke Login</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
