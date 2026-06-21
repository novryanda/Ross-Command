import {
  getMonitoringProgressTone,
  monitoringProgressIndicatorClass,
} from "@/lib/monitoring-progress";
import { cn } from "@/lib/utils";

type ToneProgressBarProps = {
  value: number;
  className?: string;
};

export function ToneProgressBar({ value, className }: ToneProgressBarProps) {
  const safe = Math.min(100, Math.max(0, value));
  const tone = getMonitoringProgressTone(safe);

  return (
    <div className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-all", monitoringProgressIndicatorClass[tone])}
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}
