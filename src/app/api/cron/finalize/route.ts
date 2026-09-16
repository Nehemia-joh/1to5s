import { and, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import { getDb } from "@/db";
import { attendance, entries } from "@/db/schema";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { classifyDate, isWorkingDay, todayInTz } from "@/lib/dates";
import { writeAuditLog } from "@/lib/audit";

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const today = todayInTz();
  if (!(await isWorkingDay(today))) {
    return NextResponse.json({ ok: true, date: today, skipped: true, dayType: await classifyDate(today) });
  }

  const db = getDb();
  const lateRows = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.date, today), eq(attendance.status, "late")));

  let missedCount = 0;
  for (const row of lateRows) {
    const [entry] = await db
      .select({ id: entries.id })
      .from(entries)
      .where(and(eq(entries.userId, row.userId), eq(entries.entryDate, today)))
      .limit(1);

    if (entry) {
      if (!row.entryId) {
        await db.update(attendance).set({ entryId: entry.id, updatedAt: new Date() }).where(eq(attendance.id, row.id));
      }
    } else {
      await db.update(attendance).set({ status: "missed", updatedAt: new Date() }).where(eq(attendance.id, row.id));
      missedCount++;
    }
  }

  await writeAuditLog({
    actorId: null,
    action: "cron.finalize_run",
    targetType: "date",
    targetId: today,
    metadata: { lateCount: lateRows.length, missedCount },
  });

  return NextResponse.json({ ok: true, date: today, lateCount: lateRows.length, missedCount });
}
