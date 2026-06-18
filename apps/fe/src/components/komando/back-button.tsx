import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type BackButtonProps = {
  href: string;
  label?: string;
};

export function BackButton({ href, label = "Kembali" }: BackButtonProps) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="w-fit border-yellow-300 bg-yellow-300 text-yellow-950 hover:bg-yellow-400 hover:text-yellow-950"
    >
      <Link href={href}>
        <ArrowLeftIcon className="size-4" />
        {label}
      </Link>
    </Button>
  );
}
