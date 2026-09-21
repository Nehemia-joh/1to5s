import { and, count, eq, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { entries, entryTasks } from "@/db/schema";
import { addDaysToKey } from "@/lib/dates";

export type WeeklyTaskStats = {
  total: number;
  byStatus: {
    completed: number;
    in_progress: number;
    abandoned: number;
    not_started: number;
    not_yet_marked: number;
  };
  percentages: {
    completed: number;
    in_progress: number;
    abandoned: number;
    not_started: number;
    not_yet_marked: number;
  };
};

export async function getWeeklyTaskStats(userId: number, weekStartKey: string): Promise<WeeklyTaskStats> {
  const db = getDb();
  const weekEndKey = addDaysToKey(weekStartKey, 6);

  // Get counts by status for the week
  const rows = await db
    .select({
      status: entryTasks.status,
      count: count(),
    })
    .from(entryTasks)
    .innerJoin(entries, eq(entryTasks.entryId, entries.id))
    .where(
      and(
        eq(entries.userId, userId),
        sql`${entries.entryDate} >= ${weekStartKey}`,
        sql`${entries.entryDate} <= ${weekEndKey}`
      )
    )
    .groupBy(entryTasks.status);

  // Initialize counts
  const byStatus = {
    completed: 0,
    in_progress: 0,
    abandoned: 0,
    not_started: 0,
    not_yet_marked: 0,
  };

  let total = 0;
  for (const row of rows) {
    total += row.count;
    if (row.status === "completed") byStatus.completed = row.count;
    else if (row.status === "in_progress") byStatus.in_progress = row.count;
    else if (row.status === "abandoned") byStatus.abandoned = row.count;
    else if (row.status === "not_started") byStatus.not_started = row.count;
    else if (row.status === null) byStatus.not_yet_marked = row.count;
  }

  // Calculate percentages
  const percentages = {
    completed: total > 0 ? Math.round((byStatus.completed / total) * 100) : 0,
    in_progress: total > 0 ? Math.round((byStatus.in_progress / total) * 100) : 0,
    abandoned: total > 0 ? Math.round((byStatus.abandoned / total) * 100) : 0,
    not_started: total > 0 ? Math.round((byStatus.not_started / total) * 100) : 0,
    not_yet_marked: total > 0 ? Math.round((byStatus.not_yet_marked / total) * 100) : 0,
  };

  return { total, byStatus, percentages };
}
