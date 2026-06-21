import Image from "next/image";

import { brandAssets } from "@/lib/assets";
import { cn } from "@/lib/utils";

export function LoginBrandLogos({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-5 sm:gap-8", className)}>
      <Image
        src={brandAssets.logo}
        alt="Pusat Siber TNI AD"
        width={120}
        height={120}
        priority
        className="h-20 w-auto object-contain sm:h-24"
      />
      <Image
        src={brandAssets.logoTniAd}
        alt="TNI Angkatan Darat"
        width={120}
        height={120}
        priority
        className="h-20 w-auto object-contain sm:h-24"
      />
    </div>
  );
}
