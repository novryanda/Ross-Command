"use client";

import { useMemo, useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { UnitNode } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type UnitOption = {
  id: string;
  name: string;
  path: string;
  depthLevel: number;
};

function flattenUnits(units: UnitNode[]): UnitOption[] {
  return units.flatMap((unit) => [
    {
      id: unit.id,
      name: unit.name,
      path: unit.path,
      depthLevel: unit.depthLevel,
    },
    ...flattenUnits(unit.children ?? []),
  ]);
}

export function UnitCombobox({
  units,
  value,
  onValueChange,
  disabled,
}: {
  units: UnitNode[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const options = useMemo(() => flattenUnits(units), [units]);
  const selected = options.find((unit) => unit.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between"
        >
          <span className="truncate">{selected?.name ?? "Tanpa Satuan"}</span>
          <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari satuan..." />
          <CommandList>
            <CommandEmpty>Satuan tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="Tanpa Satuan"
                onSelect={() => {
                  onValueChange("none");
                  setOpen(false);
                }}
              >
                <CheckIcon className={cn("mr-2 size-4", value === "none" ? "opacity-100" : "opacity-0")} />
                Tanpa Satuan
              </CommandItem>
              {options.map((unit) => (
                <CommandItem
                  key={unit.id}
                  value={`${unit.name} ${unit.path}`}
                  onSelect={() => {
                    onValueChange(unit.id);
                    setOpen(false);
                  }}
                >
                  <CheckIcon className={cn("mr-2 size-4", value === unit.id ? "opacity-100" : "opacity-0")} />
                  <span className="truncate" style={{ paddingLeft: unit.depthLevel * 8 }}>
                    {unit.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
