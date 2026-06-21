export const MONITORING_PROGRESS_THRESHOLDS = [
  { min: 0, max: 49, label: "Kurang", tone: "low" as const },
  { min: 50, max: 79, label: "Sedang", tone: "medium" as const },
  { min: 80, max: 100, label: "Baik", tone: "high" as const },
];

export type MonitoringProgressTone = (typeof MONITORING_PROGRESS_THRESHOLDS)[number]["tone"];

export function getMonitoringProgressTone(percentage: number): MonitoringProgressTone {
  const safe = Math.min(100, Math.max(0, percentage));

  if (safe >= 80) {
    return "high";
  }

  if (safe >= 50) {
    return "medium";
  }

  return "low";
}

export function getMonitoringProgressLabel(percentage: number) {
  const safe = Math.min(100, Math.max(0, percentage));
  return (
    MONITORING_PROGRESS_THRESHOLDS.find((item) => safe >= item.min && safe <= item.max)?.label ??
    "Kurang"
  );
}

export const monitoringProgressIndicatorClass: Record<MonitoringProgressTone, string> = {
  low: "bg-red-500",
  medium: "bg-amber-500",
  high: "bg-emerald-500",
};

export const monitoringProgressLegendClass: Record<MonitoringProgressTone, string> = {
  low: "bg-red-500",
  medium: "bg-amber-500",
  high: "bg-emerald-500",
};
