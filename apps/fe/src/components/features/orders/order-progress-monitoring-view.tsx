"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2Icon,
  ChevronDownIcon,
  ClipboardListIcon,
  EyeIcon,
  SearchIcon,
  Settings2Icon,
  UsersIcon,
} from "lucide-react";

import { StatusBadge } from "@/components/komando/badges";
import { PageState } from "@/components/komando/page-state";
import {
  MonitoringProgressBar,
  MonitoringStatusLegend,
  OrderMonitoringSummaryCharts,
} from "@/components/features/orders/order-monitoring-summary-charts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Assignment, OrderProgressByUnit, SubmissionMetrics } from "@/lib/api/types";
import {
  getMonitoringProgressLabel,
  getMonitoringProgressTone,
} from "@/lib/monitoring-progress";
import { isBlastingOrderType } from "@/lib/order-utils";

type TabMonitor = "perorangan" | "persatuan";
type MemberColumn = "unit" | "status" | "metrics" | "submittedAt";
type UnitColumn =
  | "commander"
  | "assigned"
  | "submitted"
  | "pending"
  | "late"
  | "metrics"
  | "action";
type SelectedUnitMemberColumn = "status" | "metrics" | "submittedAt";

const rowOptions = ["10", "20", "50", "100"];
const memberColumnLabels: Record<MemberColumn, string> = {
  unit: "Satuan",
  status: "Status",
  metrics: "Metrik",
  submittedAt: "Submit Terakhir",
};
const unitColumnLabels: Record<UnitColumn, string> = {
  commander: "Pimpinan",
  assigned: "Ditugaskan",
  submitted: "Sudah Melaksanakan",
  pending: "Menunggu",
  late: "Terlambat",
  metrics: "Metrik",
  action: "Aksi",
};
const selectedUnitMemberColumnLabels: Record<SelectedUnitMemberColumn, string> = {
  status: "Status",
  metrics: "Metrik",
  submittedAt: "Submit Terakhir",
};
const defaultMemberColumns: Record<MemberColumn, boolean> = {
  unit: true,
  status: true,
  metrics: true,
  submittedAt: true,
};
const defaultUnitColumns: Record<UnitColumn, boolean> = {
  commander: true,
  assigned: true,
  submitted: true,
  pending: true,
  late: true,
  metrics: true,
  action: true,
};
const defaultSelectedUnitMemberColumns: Record<SelectedUnitMemberColumn, boolean> = {
  status: true,
  metrics: true,
  submittedAt: true,
};

export function OrderProgressMonitoringView({
  monitoring,
  defaultTab = "perorangan",
  initialUnitId,
  orderId,
  orderType,
  showBulkSubmit = false,
}: {
  monitoring: OrderProgressByUnit;
  defaultTab?: TabMonitor;
  initialUnitId?: string;
  orderId?: string;
  orderType?: "posting" | "engagement" | "blasting" | "counter" | "report_akun";
  showBulkSubmit?: boolean;
}) {
  const [tab, setTab] = useState<TabMonitor>(defaultTab);
  const [memberQuery, setMemberQuery] = useState("");
  const [memberPage, setMemberPage] = useState(1);
  const [memberRows, setMemberRows] = useState("20");
  const [memberColumns, setMemberColumns] = useState(defaultMemberColumns);
  const [unitQuery, setUnitQuery] = useState("");
  const [unitPage, setUnitPage] = useState(1);
  const [unitRows, setUnitRows] = useState("20");
  const [unitColumns, setUnitColumns] = useState(defaultUnitColumns);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(
    initialUnitId ?? monitoring.units[0]?.unit.id ?? null,
  );
  const [selectedUnitMemberQuery, setSelectedUnitMemberQuery] = useState("");
  const [selectedUnitMemberPage, setSelectedUnitMemberPage] = useState(1);
  const [selectedUnitMemberRows, setSelectedUnitMemberRows] = useState("20");
  const [selectedUnitMemberColumns, setSelectedUnitMemberColumns] = useState(defaultSelectedUnitMemberColumns);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  const allMembers = useMemo(
    () =>
      monitoring.units.flatMap((item) =>
        item.members.map((member) => ({
          ...member,
          groupUnit: item.unit,
        })),
      ),
    [monitoring.units],
  );

  const filteredMembers = useMemo(() => {
    const keyword = memberQuery.trim().toLowerCase();
    if (!keyword) {
      return allMembers;
    }

    return allMembers.filter((member) =>
      [
        member.user?.fullName,
        member.user?.username,
        member.unit?.name,
        member.groupUnit.commander?.fullName,
        member.groupUnit.commander?.username,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(keyword)),
    );
  }, [allMembers, memberQuery]);

  const filteredUnits = useMemo(() => {
    const keyword = unitQuery.trim().toLowerCase();
    if (!keyword) {
      return monitoring.units;
    }

    return monitoring.units.filter((item) =>
      [item.unit.name, item.unit.path, item.unit.commander?.fullName, item.unit.commander?.username]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(keyword)),
    );
  }, [monitoring.units, unitQuery]);

  useEffect(() => {
    if (!filteredUnits.length) {
      setSelectedUnitId(null);
      return;
    }

    if (!selectedUnitId || !filteredUnits.some((item) => item.unit.id === selectedUnitId)) {
      setSelectedUnitId(filteredUnits[0]?.unit.id ?? null);
    }
  }, [filteredUnits, selectedUnitId]);

  const selectedUnit =
    filteredUnits.find((item) => item.unit.id === selectedUnitId) ??
    monitoring.units.find((item) => item.unit.id === selectedUnitId) ??
    null;

  const filteredSelectedUnitMembers = useMemo(() => {
    if (!selectedUnit) {
      return [];
    }

    const keyword = selectedUnitMemberQuery.trim().toLowerCase();
    if (!keyword) {
      return selectedUnit.members;
    }

    return selectedUnit.members.filter((member) =>
      [member.user?.fullName, member.user?.username, member.unit?.name]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(keyword)),
    );
  }, [selectedUnit, selectedUnitMemberQuery]);

  const memberPagination = paginate(filteredMembers, memberPage, Number(memberRows));
  const unitPagination = paginate(filteredUnits, unitPage, Number(unitRows));
  const selectedUnitMemberPagination = paginate(
    filteredSelectedUnitMembers,
    selectedUnitMemberPage,
    Number(selectedUnitMemberRows),
  );

  const canShowBulkSubmit = showBulkSubmit && orderType === "posting" && Boolean(orderId);
  const isBlasting = isBlastingOrderType(orderType);
  const memberColumnOptions = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(memberColumnLabels).filter(([key]) => isBlasting || key !== "metrics"),
      ) as Record<MemberColumn, string>,
    [isBlasting],
  );
  const unitColumnOptions = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(unitColumnLabels).filter(([key]) => isBlasting || key !== "metrics"),
      ) as Record<UnitColumn, string>,
    [isBlasting],
  );
  const selectedUnitMemberColumnOptions = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(selectedUnitMemberColumnLabels).filter(
          ([key]) => isBlasting || key !== "metrics",
        ),
      ) as Record<SelectedUnitMemberColumn, string>,
    [isBlasting],
  );
  const selectedUnitBulkSubmitHref =
    canShowBulkSubmit && selectedUnit
      ? `/orders/${orderId}/monitoring/bulk-submit?unit=${selectedUnit.unit.id}`
      : canShowBulkSubmit
        ? `/orders/${orderId}/monitoring/bulk-submit`
        : null;

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
      <section className="rounded-xl border bg-muted/20 p-4">
        <OrderMonitoringSummaryCharts summary={monitoring.summary} orderType={orderType} />
      </section>

      <Tabs value={tab} onValueChange={(value) => setTab(value as TabMonitor)} className="space-y-4">
        <TabsList className="grid h-auto w-full max-w-md grid-cols-2 gap-1 p-1">
          <TabsTrigger value="perorangan">
            <UsersIcon className="size-4" />
            Perorangan
          </TabsTrigger>
          <TabsTrigger value="persatuan">
            <Building2Icon className="size-4" />
            Persatuan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perorangan" className="mt-0 space-y-4">
          <section className="rounded-xl border p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold">Rincian Perorangan</h3>
                <p className="text-muted-foreground text-sm">
                  Lihat status tugas, metrik, dan waktu kirim bukti.
                </p>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative w-full md:w-[26rem]">
                  <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    value={memberQuery}
                    onChange={(event) => {
                      setMemberQuery(event.target.value);
                      setMemberPage(1);
                    }}
                    placeholder="Cari anggota, username, atau satuan..."
                    className="pl-9"
                  />
                </div>
                <ColumnSelector
                  title="Tampilkan kolom"
                  options={memberColumnOptions}
                  visibility={memberColumns}
                  onToggle={(column, checked) =>
                    setMemberColumns((current) => ({
                      ...current,
                      [column]: checked,
                    }))
                  }
                />
              </div>
            </div>

            {filteredMembers.length ? (
              <div className="mt-4 min-w-0 overflow-hidden rounded-lg border">
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-[880px]">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="min-w-56">Anggota</TableHead>
                        {memberColumns.unit ? <TableHead className="min-w-48">Satuan</TableHead> : null}
                        {memberColumns.status ? <TableHead className="min-w-36">Status</TableHead> : null}
                        {isBlasting && memberColumns.metrics ? (
                          <TableHead className="min-w-80">Metrik</TableHead>
                        ) : null}
                        {memberColumns.submittedAt ? (
                          <TableHead className="min-w-36">Terlaksana Terakhir</TableHead>
                        ) : null}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {memberPagination.items.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{member.user?.fullName ?? "Anggota"}</p>
                              <p className="text-muted-foreground text-xs">@{member.user?.username ?? "-"}</p>
                            </div>
                          </TableCell>
                          {memberColumns.unit ? <TableCell className="text-sm">{member.unit?.name ?? "-"}</TableCell> : null}
                          {memberColumns.status ? (
                            <TableCell>
                              <StatusBadge status={member.status} />
                            </TableCell>
                          ) : null}
                          {isBlasting && memberColumns.metrics ? (
                            <TableCell>
                              <MetricSummary metrics={member.latestSubmission?.metrics} />
                            </TableCell>
                          ) : null}
                          {memberColumns.submittedAt ? (
                            <TableCell>
                              <SubmissionTime submission={member.latestSubmission} />
                            </TableCell>
                          ) : null}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <PaginationFooter
                  page={memberPagination.page}
                  totalPages={memberPagination.totalPages}
                  totalItems={filteredMembers.length}
                  rowsValue={memberRows}
                  onRowsChange={(value) => {
                    setMemberRows(value);
                    setMemberPage(1);
                  }}
                  onPageChange={setMemberPage}
                />
              </div>
            ) : (
              <div className="mt-4">
                <PageState title="Tidak ada data anggota" description="Coba ubah kata kunci pencarian yang Anda gunakan." />
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="persatuan" className="mt-0 space-y-4">
          <section className="rounded-xl border p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold">Ringkasan Persatuan</h3>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative w-full md:w-[26rem]">
                  <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    value={unitQuery}
                    onChange={(event) => {
                      setUnitQuery(event.target.value);
                      setUnitPage(1);
                    }}
                    placeholder="Cari satuan atau pimpinan..."
                    className="pl-9"
                  />
                </div>
                <ColumnSelector
                  title="Tampilkan kolom"
                  options={unitColumnOptions}
                  visibility={unitColumns}
                  onToggle={(column, checked) =>
                    setUnitColumns((current) => ({
                      ...current,
                      [column]: checked,
                    }))
                  }
                />
              </div>
            </div>

            {filteredUnits.length ? (
              <div className="mt-4 min-w-0 overflow-hidden rounded-lg border">
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-[980px]">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="min-w-56">Satuan</TableHead>
                        {unitColumns.commander ? <TableHead className="min-w-52">Pimpinan</TableHead> : null}
                        {unitColumns.assigned ? <TableHead className="min-w-20 px-2 text-center">Ditugaskan</TableHead> : null}
                        {unitColumns.submitted ? <TableHead className="min-w-20 px-2 text-center">Sudah Melaksanakan</TableHead> : null}
                        {unitColumns.pending ? <TableHead className="min-w-20 px-2 text-center">Belum Melaksanakan</TableHead> : null}
                        {unitColumns.late ? <TableHead className="min-w-20 px-2 text-center">Terlambat</TableHead> : null}
                        {isBlasting && unitColumns.metrics ? (
                          <TableHead className="min-w-80">Metrik</TableHead>
                        ) : null}
                        {unitColumns.action ? <TableHead className="w-16 min-w-16 px-2 text-center">Aksi</TableHead> : null}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unitPagination.items.map((item) => {
                        const selected = item.unit.id === selectedUnitId;
                        return (
                          <TableRow key={item.unit.id} className={selected ? "bg-muted/40" : undefined}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.unit.name}</p>
                              </div>
                            </TableCell>
                            {unitColumns.commander ? (
                              <TableCell>
                                {item.unit.commander ? (
                                  <div>
                                    <p className="text-sm font-medium">{item.unit.commander.fullName}</p>
                                    <p className="text-muted-foreground text-xs">@{item.unit.commander.username}</p>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">Belum ada pimpinan</span>
                                )}
                              </TableCell>
                            ) : null}
                            {unitColumns.assigned ? (
                              <TableCell className="px-2 text-center">{item.progress.totalAssigned}</TableCell>
                            ) : null}
                            {unitColumns.submitted ? (
                              <TableCell className="px-2 text-center">{item.progress.totalSubmitted}</TableCell>
                            ) : null}
                            {unitColumns.pending ? (
                              <TableCell className="px-2 text-center">{item.progress.totalPending}</TableCell>
                            ) : null}
                            {unitColumns.late ? (
                              <TableCell className="px-2 text-center">{item.progress.totalLate}</TableCell>
                            ) : null}
                            {isBlasting && unitColumns.metrics ? (
                              <TableCell>
                                <MetricSummary metrics={item.progress.metricTotals} />
                              </TableCell>
                            ) : null}
                            {unitColumns.action ? (
                              <TableCell className="w-16 min-w-16 px-2 text-center">
                                <button
                                  type="button"
                                  className={[
                                    "inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors",
                                    selected
                                      ? "border-green-300 bg-green-100 text-green-700"
                                      : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                                  ].join(" ")}
                                  onClick={() => {
                                    setSelectedUnitId(item.unit.id);
                                    setSelectedUnitMemberPage(1);
                                    setSelectedUnitMemberQuery("");
                                  }}
                                  aria-label={selected ? "Sedang dilihat" : "Lihat detail"}
                                  title={selected ? "Sedang dilihat" : "Lihat detail"}
                                >
                                  <EyeIcon className="size-4" />
                                </button>
                              </TableCell>
                            ) : null}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <PaginationFooter
                  page={unitPagination.page}
                  totalPages={unitPagination.totalPages}
                  totalItems={filteredUnits.length}
                  rowsValue={unitRows}
                  onRowsChange={(value) => {
                    setUnitRows(value);
                    setUnitPage(1);
                  }}
                  onPageChange={setUnitPage}
                />
              </div>
            ) : (
              <div className="mt-4">
                <PageState title="Tidak ada data satuan" description="Coba ubah kata kunci pencarian yang Anda gunakan." />
              </div>
            )}
          </section>

          {selectedUnit ? (
            <section className="rounded-xl border bg-muted/20 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold">Detail Satuan</p>
                  <h3 className="text-lg font-semibold">{selectedUnit.unit.name}</h3>
                </div>
                <div className="grid w-full gap-2 xl:max-w-xl">
                  <MonitoringStatusLegend summary={selectedUnit.progress} />
                </div>
              </div>

              <div className="mt-4">
                <MonitoringProgressBar
                  submitted={selectedUnit.progress.totalSubmitted}
                  assigned={selectedUnit.progress.totalAssigned}
                  percentage={selectedUnit.progress.percentageComplete}
                  tone={getMonitoringProgressTone(selectedUnit.progress.percentageComplete)}
                  statusLabel={getMonitoringProgressLabel(selectedUnit.progress.percentageComplete)}
                  compact
                />
              </div>

              <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:w-[26rem]">
                  <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    value={selectedUnitMemberQuery}
                    onChange={(event) => {
                      setSelectedUnitMemberQuery(event.target.value);
                      setSelectedUnitMemberPage(1);
                    }}
                    placeholder="Cari anggota di satuan ini..."
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedUnitBulkSubmitHref ? (
                    <Button variant="default" size="sm" asChild>
                      <Link href={selectedUnitBulkSubmitHref}>
                        <ClipboardListIcon className="size-4" />
                        Kirim Massal
                      </Link>
                    </Button>
                  ) : null}
                  <ColumnSelector
                  title="Tampilkan kolom"
                  options={selectedUnitMemberColumnOptions}
                  visibility={selectedUnitMemberColumns}
                  onToggle={(column, checked) =>
                    setSelectedUnitMemberColumns((current) => ({
                      ...current,
                      [column]: checked,
                    }))
                  }
                />
                </div>
              </div>

              {filteredSelectedUnitMembers.length ? (
                <div className="mt-4 min-w-0 overflow-hidden rounded-lg border bg-background">
                  <div className="w-full overflow-x-auto">
                    <Table className="min-w-[820px]">
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="min-w-56">Anggota</TableHead>
                          {selectedUnitMemberColumns.status ? <TableHead className="min-w-36">Status</TableHead> : null}
                          {isBlasting && selectedUnitMemberColumns.metrics ? (
                            <TableHead className="min-w-80">Metrik</TableHead>
                          ) : null}
                          {selectedUnitMemberColumns.submittedAt ? (
                            <TableHead className="min-w-36">Terlaksana Terakhir</TableHead>
                          ) : null}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUnitMemberPagination.items.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{member.user?.fullName ?? "Anggota"}</p>
                                <p className="text-muted-foreground text-xs">@{member.user?.username ?? "-"}</p>
                              </div>
                            </TableCell>
                            {selectedUnitMemberColumns.status ? (
                              <TableCell>
                                <StatusBadge status={member.status} />
                              </TableCell>
                            ) : null}
                            {isBlasting && selectedUnitMemberColumns.metrics ? (
                              <TableCell>
                                <MetricSummary metrics={member.latestSubmission?.metrics} />
                              </TableCell>
                            ) : null}
                            {selectedUnitMemberColumns.submittedAt ? (
                              <TableCell>
                                <SubmissionTime submission={member.latestSubmission} />
                              </TableCell>
                            ) : null}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <PaginationFooter
                    page={selectedUnitMemberPagination.page}
                    totalPages={selectedUnitMemberPagination.totalPages}
                    totalItems={filteredSelectedUnitMembers.length}
                    rowsValue={selectedUnitMemberRows}
                    onRowsChange={(value) => {
                      setSelectedUnitMemberRows(value);
                      setSelectedUnitMemberPage(1);
                    }}
                    onPageChange={setSelectedUnitMemberPage}
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <PageState title="Tidak ada anggota di hasil pencarian" description="Coba ubah kata kunci atau pilih satuan lain." />
                </div>
              )}
            </section>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ColumnSelector<TColumn extends string>({
  title,
  options,
  visibility,
  onToggle,
}: {
  title: string;
  options: Record<TColumn, string>;
  visibility: Record<TColumn, boolean>;
  onToggle: (column: TColumn, checked: boolean) => void;
}) {
  const columns = Object.keys(options) as TColumn[];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Settings2Icon className="size-4" />
          Kolom
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column}
            checked={visibility[column]}
            onCheckedChange={(checked) => onToggle(column, Boolean(checked))}
          >
            {options[column]}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MetricSummary({ metrics }: { metrics?: SubmissionMetrics | null }) {
  const safeMetrics = metrics ?? {
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    reposts: 0,
  };
  const items = [
    { label: "T", value: safeMetrics.views },
    { label: "S", value: safeMetrics.likes },
    { label: "K", value: safeMetrics.comments },
    { label: "B", value: safeMetrics.shares },
    { label: "R", value: safeMetrics.reposts },
  ];

  return (
    <div className="grid min-w-0 grid-cols-5 gap-1">
      {items.map((item) => (
        <div key={item.label} className="rounded-md bg-muted/60 px-1.5 py-1 text-center">
          <p className="text-muted-foreground text-[10px] leading-none">{item.label}</p>
          <p className="truncate text-xs font-medium tabular-nums">{item.value.toLocaleString("id-ID")}</p>
        </div>
      ))}
    </div>
  );
}

function SubmissionTime({
  submission,
}: {
  submission: Assignment["latestSubmission"] | null;
}) {
  if (!submission?.submittedAt) {
    return <span className="text-muted-foreground text-sm">Belum ada</span>;
  }

  const date = new Date(submission.submittedAt);
  return (
    <div className="min-w-28">
      <p className="text-sm leading-tight">
        {new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(date)}
      </p>
      <p className="text-muted-foreground text-xs">
        {new Intl.DateTimeFormat("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(date)}
      </p>
    </div>
  );
}

function RowsSelect({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-muted-foreground text-xs">Baris</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger size="sm" className="w-[92px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {rowOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function PaginationFooter({
  page,
  totalPages,
  totalItems,
  rowsValue,
  onRowsChange,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  rowsValue: string;
  onRowsChange: (value: string) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm xl:flex-row xl:items-center xl:justify-between">
      <p className="text-muted-foreground">{totalItems.toLocaleString("id-ID")} data</p>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
        <RowsSelect value={rowsValue} onValueChange={onRowsChange} />
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-md border px-3 py-1.5 text-sm disabled:pointer-events-none disabled:opacity-50"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Sebelumnya
          </button>
          <span className="text-muted-foreground min-w-28 text-center text-xs">
            Halaman {page} dari {totalPages}
          </span>
          <button
            type="button"
            className="rounded-md border px-3 py-1.5 text-sm disabled:pointer-events-none disabled:opacity-50"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
}

function paginate<T>(items: T[], page: number, limit: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    page: safePage,
    totalPages,
  };
}
