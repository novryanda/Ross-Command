import Image from "next/image";

import { brandAssets } from "@/lib/assets";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  variant?: "sidebar" | "hero";
  className?: string;
};

export function AppLogo({ variant = "sidebar", className }: AppLogoProps) {
  return (
    <Image
      src={brandAssets.logo}
      alt="Pusat Siber TNI AD"
      width={160}
      height={160}
      className={cn(
        "w-auto shrink-0 object-contain",
        variant === "hero" ? "h-28" : "h-14 min-h-[56px]",
        className,
      )}
    />
  );
}
