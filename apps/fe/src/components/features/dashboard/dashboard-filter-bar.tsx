"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { orderStatusLabel, orderTypeFilterOptions } from "@/components/komando/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dashboardPeriodOptions } from "@/lib/dashboard-filter-utils";
import { cn } from "@/lib/utils";

function FilterSection({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-muted-foreground block text-xs">{label}</label>
      <Input
        type="date"
        value={value}
        className="h-8 w-full text-xs"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function DashboardFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function pushParams(next: URLSearchParams) {
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    pushParams(params);
  }

  function setPeriod(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("dateFrom");
    params.delete("dateTo");

    if (value === "all") {
      params.delete("period");
    } else {
      params.set("period", value);
    }

    pushParams(params);
  }

  function setDateParam(key: "dateFrom" | "dateTo", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
      params.delete("period");
    }
    pushParams(params);
  }

  function reset() {
    router.push(pathname);
  }

  const activePeriod =
    searchParams.get("dateFrom") || searchParams.get("dateTo")
      ? "custom"
      : (searchParams.get("period") ?? "all");

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Filter Dashboard</p>
          <p className="text-muted-foreground text-xs">Sesuaikan periode, status, jenis, dan deadline perintah.</p>
        </div>
        <Button type="button" size="sm" variant="destructive" className="h-8 shrink-0" onClick={reset}>
          Reset
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <FilterSection title="Periode">
          <Select value={activePeriod} onValueChange={setPeriod}>
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder="Periode" />
            </SelectTrigger>
            <SelectContent>
              {dashboardPeriodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
              <SelectItem value="custom">Kustom tanggal</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-2">
            <DateField
              label="Dari"
              value={searchParams.get("dateFrom") ?? ""}
              onChange={(value) => setDateParam("dateFrom", value)}
            />
            <DateField
              label="Sampai"
              value={searchParams.get("dateTo") ?? ""}
              onChange={(value) => setDateParam("dateTo", value)}
            />
          </div>
        </FilterSection>

        <FilterSection title="Perintah">
          <Select value={searchParams.get("status") ?? "all"} onValueChange={(value) => setParam("status", value)}>
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua status</SelectItem>
              {Object.entries(orderStatusLabel).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={searchParams.get("orderType") ?? "all"}
            onValueChange={(value) => setParam("orderType", value)}
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder="Jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua jenis</SelectItem>
              {orderTypeFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterSection>

        <FilterSection title="Deadline">
          <div className="grid grid-cols-2 gap-2">
            <DateField
              label="Dari"
              value={searchParams.get("deadlineFrom") ?? ""}
              onChange={(value) => setParam("deadlineFrom", value)}
            />
            <DateField
              label="Sampai"
              value={searchParams.get("deadlineTo") ?? ""}
              onChange={(value) => setParam("deadlineTo", value)}
            />
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
