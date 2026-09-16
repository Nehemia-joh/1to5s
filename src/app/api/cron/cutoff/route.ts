import { and, eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import { getDb } from "@/db";
import { attendance, entries } from "@/db/schema";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { classifyDate, todayInTz } from "@/lib/dates";
import { writeAuditLog } from "@/lib/audit";
import { listActiveUsers } from "@/lib/queries/roster";

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const today = todayInTz();
  const dayType = await classifyDate(today);
  const activeUsers = await listActiveUsers();

  if (dayType === "holiday" || dayType === "weekend") {
    for (const user of activeUsers) {
      await db
        .insert(attendance)
        .values({ userId: user.id, date: today, status: dayType })
        .onConflictDoNothing({ target: [attendance.userId, attendance.date] });
    }
  } else {
    for (const user of activeUsers) {
      const [entry] = await db
        .select({ id: entries.id })
        .from(entries)
        .where(and(eq(entries.userId, user.id), eq(entries.entryDate, today)))
        .limit(1);

      if (!entry) {
        await db
          .insert(attendance)
          .values({ userId: user.id, date: today, status: "late" })
          .onConflictDoNothing({ target: [attendance.userId, attendance.date] });
      }
    }
  }

  await writeAuditLog({
    actorId: null,
    action: "cron.cutoff_run",
    targetType: "date",
    targetId: today,
    metadata: { dayType, activeUserCount: activeUsers.length },
  });

  return NextResponse.json({ ok: true, date: today, dayType });
}
