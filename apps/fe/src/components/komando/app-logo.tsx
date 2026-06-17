import Image from "next/image";

import { cn } from "@/lib/utils";

type AppLogoProps = {
  variant?: "sidebar" | "hero";
  className?: string;
};

export function AppLogo({ variant = "sidebar", className }: AppLogoProps) {
  return (
    <Image
      src="/images/ROSS_full_logo_besar_1024.png"
      alt="ROSS - Ruang Operasi Siber Strategis"
      width={209}
      height={260}
      className={cn(
        "w-auto shrink-0 object-contain",
        variant === "hero" ? "h-28" : "h-14 min-h-[56px]",
        className,
      )}
    />
  );
}
