import { desc } from "drizzle-orm";

import { getDb } from "@/db";
import { extraDays, holidays } from "@/db/schema";

export async function listHolidays() {
  return getDb().select().from(holidays).orderBy(desc(holidays.date));
}

export async function listExtraDays() {
  return getDb().select().from(extraDays).orderBy(desc(extraDays.date));
}
