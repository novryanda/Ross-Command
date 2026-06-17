"use client";

import { LayoutGridIcon, TableIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ListViewToggle({ defaultView = "table" }: { defaultView?: "table" | "card" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "card" ? "card" : "table";

  function setView(next: "table" | "card") {
    const params = new URLSearchParams(searchParams.toString());
    if (next === defaultView) params.delete("view");
    else params.set("view", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      spacing={0}
      value={view}
      onValueChange={(value) => value && setView(value as "table" | "card")}
    >
      <ToggleGroupItem value="table" aria-label="Tabel" className="px-2.5">
        <TableIcon className="size-3.5" />
        <span className="text-xs">Tabel</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="card" aria-label="Kartu" className="px-2.5">
        <LayoutGridIcon className="size-3.5" />
        <span className="text-xs">Kartu</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
