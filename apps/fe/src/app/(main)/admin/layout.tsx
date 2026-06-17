import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getMe } from "@/lib/api/server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const me = await getMe();

  if (me.role !== "super_admin") {
    redirect("/dashboard");
  }

  return children;
}
