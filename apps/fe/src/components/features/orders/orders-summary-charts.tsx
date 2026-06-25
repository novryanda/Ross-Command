import { ActivityIcon, CalendarClockIcon, ClipboardListIcon, FileTextIcon } from "lucide-react";

import { CommandTaskCharts } from "@/components/komando/command-task-charts";
import { StatsCard } from "@/components/komando/stats-card";
import type { OrdersSummary } from "@/lib/api/types";

export function OrdersSummaryCharts({ summary }: { summary: OrdersSummary }) {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total" value={summary.stats.total} description="Semua tugas terfilter" icon={ClipboardListIcon} />
        <StatsCard title="Aktif" value={summary.stats.aktif} description="Sedang berjalan" icon={ActivityIcon} />
        <StatsCard title="Draft" value={summary.stats.draft} description="Belum dikirim" icon={FileTextIcon} />
        <StatsCard title="Selesai" value={summary.stats.selesai} description="Progress tuntas" icon={CalendarClockIcon} />
      </div>

      <CommandTaskCharts charts={summary.charts} />
    </section>
  );
}
