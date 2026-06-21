import type { ReactNode } from "react";

import { AuthBrandingPanel } from "@/components/features/auth/auth-branding-panel";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background lg:grid lg:grid-cols-2">
      <div className="flex min-h-svh flex-col px-6 py-6 sm:px-10 lg:px-14 lg:py-8">
        <div className="flex flex-1 flex-col justify-center">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </div>

        <footer className="text-muted-foreground mx-auto mt-8 flex w-full max-w-md items-center justify-between gap-4 text-xs">
          <span>© {new Date().getFullYear()}, Command Center</span>
          <span>Social Command</span>
        </footer>
      </div>

      <div className="hidden bg-muted/20 p-4 lg:block lg:p-6">
        <AuthBrandingPanel />
      </div>
    </div>
  );
}
