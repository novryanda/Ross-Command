"use client";

import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type SelectFilter = {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  visibleWhen?: { key: string; equals: string };
  aliases?: Record<string, string>;
};

export type DateFilter = {
  key: string;
  label: string;
};

export function FilterBar({
  searchKey,
  searchPlaceholder,
  selects = [],
  dateFilters = [],
}: {
  searchKey?: string;
  searchPlaceholder?: string;
  selects?: SelectFilter[];
  dateFilters?: DateFilter[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);

    for (const filter of selects) {
      if (!filter.visibleWhen || filter.visibleWhen.key !== key) continue;
      const isVisible = value !== "all" && value === filter.visibleWhen.equals;
      if (!isVisible) params.delete(filter.key);
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function reset() {
    router.push(pathname);
  }

  function getSelectedValue(filter: SelectFilter) {
    const rawValue = searchParams.get(filter.key) ?? "all";
    if (rawValue === "all") {
      return rawValue;
    }

    const aliasedValue = filter.aliases?.[rawValue] ?? rawValue;
    const hasOption = filter.options.some((option) => option.value === aliasedValue);

    return hasOption ? aliasedValue : "all";
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
      {searchKey ? (
        <div className="relative w-52 shrink-0">
          <SearchIcon className="text-muted-foreground absolute left-2.5 top-1/2 size-4 -translate-y-1/2" />
          <Input
            defaultValue={searchParams.get(searchKey) ?? ""}
            placeholder={searchPlaceholder ?? "Cari..."}
            className="h-8 pl-8"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setParam(searchKey, event.currentTarget.value);
              }
            }}
            onBlur={(event) => setParam(searchKey, event.currentTarget.value)}
          />
        </div>
      ) : null}
      {selects
        .filter((filter) => {
          if (!filter.visibleWhen) return true;
          return searchParams.get(filter.visibleWhen.key) === filter.visibleWhen.equals;
        })
        .map((filter) => (
        <Select
          key={filter.key}
          value={getSelectedValue(filter)}
          onValueChange={(value) => setParam(filter.key, value)}
        >
          <SelectTrigger size="sm" className="w-44">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua {filter.label.toLowerCase()}</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {dateFilters.map((filter) => (
        <div key={filter.key} className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-xs whitespace-nowrap">{filter.label}</span>
          <Input
            type="date"
            value={searchParams.get(filter.key) ?? ""}
            className="h-8 w-36 text-xs"
            onChange={(event) => setParam(filter.key, event.target.value)}
          />
        </div>
      ))}
      <Button type="button" size="sm" variant="destructive" className="ml-auto h-8" onClick={reset}>
        Reset
      </Button>
    </div>
  );
}
