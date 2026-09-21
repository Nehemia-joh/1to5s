import type { WeeklyTaskStats } from "@/lib/queries/stats";

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-primary",
  in_progress: "bg-highlight",
  not_started: "bg-brand-accent",
  abandoned: "bg-destructive",
  not_yet_marked: "bg-muted",
};

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  in_progress: "In progress",
  not_started: "Not started",
  abandoned: "Abandoned",
  not_yet_marked: "Not yet marked",
};

export function WeeklyStatsBar({ stats }: { stats: WeeklyTaskStats }) {
  if (stats.total === 0) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">No tasks yet this week.</p>
      </div>
    );
  }

  const segments = Object.entries(stats.percentages)
    .filter(([, pct]) => pct > 0)
    .map(([status, pct]) => ({
      status,
      pct,
      color: STATUS_COLORS[status],
      label: STATUS_LABELS[status],
      count: stats.byStatus[status as keyof typeof stats.byStatus],
    }));

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-primary">This week&apos;s tasks</p>

      {/* Segmented bar */}
      <div className="h-4 w-full overflow-hidden rounded-full bg-muted flex">
        {segments.map((seg) => (
          <div
            key={seg.status}
            className={`${seg.color} h-full transition-all`}
            style={{ width: `${seg.pct}%` }}
            title={`${seg.label}: ${seg.count} (${seg.pct}%)`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {segments.map((seg) => (
          <div key={seg.status} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
            <span>{seg.label}</span>
            <span className="font-medium text-foreground">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
