import { and, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import { getDb } from "@/db";
import { attendance } from "@/db/schema";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { isWorkingDay, todayInTz } from "@/lib/dates";
import { writeAuditLog } from "@/lib/audit";

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const today = todayInTz();
  if (!(await isWorkingDay(today))) {
    return NextResponse.json({ ok: true, date: today, skipped: true });
  }

  const db = getDb();

  // Flip any 'late' rows for today to 'not_submitted'
  const result = await db
    .update(attendance)
    .set({ status: "not_submitted", updatedAt: new Date() })
    .where(and(eq(attendance.date, today), eq(attendance.status, "late")))
    .returning();

  await writeAuditLog({
    actorId: null,
    action: "cron.deadline_run",
    targetType: "date",
    targetId: today,
    metadata: { lateToNotSubmitted: result.length },
  });

  return NextResponse.json({ ok: true, date: today, lateToNotSubmitted: result.length });
}
