import type { ReactNode } from "react";

import { MainShell } from "@/components/komando/main-shell";
import { getMe } from "@/lib/api/server";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const me = await getMe();

  return <MainShell user={me}>{children}</MainShell>;
}
