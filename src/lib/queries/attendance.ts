import { and, asc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { attendance, users } from "@/db/schema";

export type BoardRow = {
  userId: number;
  name: string;
  email: string;
  status: string | null;
  reason: string | null;
  entryId: number | null;
};

export async function getBoardForDate(date: string): Promise<BoardRow[]> {
  const db = getDb();
  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      status: attendance.status,
      reason: attendance.reason,
      entryId: attendance.entryId,
    })
    .from(users)
    .leftJoin(attendance, and(eq(attendance.userId, users.id), eq(attendance.date, date)))
    .where(eq(users.active, true))
    .orderBy(asc(users.name));

  return rows;
}
