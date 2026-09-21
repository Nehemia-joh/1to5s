"use client";

import type { WeeklyTaskStats } from "@/lib/queries/stats";

const STATUS_CONFIG: Record<string, { color: string; label: string; hex: string }> = {
  completed: { color: "bg-primary", label: "Completed", hex: "hsl(var(--primary))" },
  in_progress: { color: "bg-highlight", label: "In progress", hex: "hsl(var(--highlight))" },
  not_started: { color: "bg-brand-accent", label: "Not started", hex: "hsl(var(--brand-accent))" },
  abandoned: { color: "bg-destructive", label: "Abandoned", hex: "hsl(var(--destructive))" },
  not_yet_marked: { color: "bg-muted", label: "Not yet marked", hex: "hsl(var(--muted))" },
};

function DonutChart({ stats }: { stats: WeeklyTaskStats }) {
  const radius = 60;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const center = radius + strokeWidth;

  const segments = Object.entries(stats.percentages)
    .filter(([, pct]) => pct > 0)
    .map(([status, pct]) => ({
      status,
      pct,
      ...STATUS_CONFIG[status],
      count: stats.byStatus[status as keyof typeof stats.byStatus],
    }));

  let accumulatedOffset = 0;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={center * 2} height={center * 2} className="-rotate-90 w-32 h-32 sm:w-40 sm:h-40">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        {/* Segments */}
        {segments.map((seg) => {
          const dashLength = (seg.pct / 100) * circumference;
          const dashOffset = -accumulatedOffset;
          accumulatedOffset += dashLength;

          return (
            <circle
              key={seg.status}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={seg.hex}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl sm:text-3xl font-bold text-foreground">{stats.total}</span>
        <span className="text-[10px] sm:text-xs text-muted-foreground">tasks</span>
      </div>
    </div>
  );
}

export function WeeklyStatsBar({ stats }: { stats: WeeklyTaskStats }) {
  if (stats.total === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center">
          <svg className="h-8 w-8 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">No tasks yet this week</p>
      </div>
    );
  }

  const segments = Object.entries(stats.percentages)
    .filter(([, pct]) => pct > 0)
    .map(([status, pct]) => ({
      status,
      pct,
      ...STATUS_CONFIG[status],
      count: stats.byStatus[status as keyof typeof stats.byStatus],
    }));

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile: Stack vertically, Desktop: Side by side */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
        {/* Donut Chart */}
        <DonutChart stats={stats} />

        {/* Legend */}
        <div className="flex flex-col gap-2.5 flex-1 w-full">
          {segments.map((seg) => (
            <div key={seg.status} className="flex items-center gap-2.5">
              <div className={`h-3 w-3 rounded-full ${seg.color} shrink-0`} />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm text-foreground">{seg.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{seg.count}</span>
                  <span className="text-xs text-muted-foreground w-10 text-right">{seg.pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Weekly Progress</span>
          <span>{stats.total} total tasks</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted/30 flex">
          {segments.map((seg) => (
            <div
              key={seg.status}
              className={`${seg.color} h-full transition-all duration-500`}
              style={{ width: `${seg.pct}%` }}
              title={`${seg.label}: ${seg.count} (${seg.pct}%)`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
