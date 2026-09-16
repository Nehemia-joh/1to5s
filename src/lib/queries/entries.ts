import { and, asc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { entries, entryTasks } from "@/db/schema";

export type TaskRow = typeof entryTasks.$inferSelect;
export type EntryRow = typeof entries.$inferSelect;

export type EntryWithTasks = EntryRow & { tasks: TaskRow[] };

export async function getEntryWithTasks(userId: number, dateKey: string): Promise<EntryWithTasks | null> {
  const db = getDb();
  const [entry] = await db
    .select()
    .from(entries)
    .where(and(eq(entries.userId, userId), eq(entries.entryDate, dateKey)))
    .limit(1);

  if (!entry) return null;

  const tasks = await db
    .select()
    .from(entryTasks)
    .where(eq(entryTasks.entryId, entry.id))
    .orderBy(asc(entryTasks.slot));

  return { ...entry, tasks };
}

export async function getUserHistory(userId: number, limit = 30): Promise<EntryWithTasks[]> {
  const db = getDb();
  const rows = await db.query.entries.findMany({
    where: eq(entries.userId, userId),
    orderBy: (e, { desc }) => [desc(e.entryDate)],
    limit,
    with: { tasks: { orderBy: (t, { asc }) => [asc(t.slot)] } },
  });
  return rows;
}
