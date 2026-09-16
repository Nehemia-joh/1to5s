import { fromZonedTime } from "date-fns-tz";
import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { extraDays, holidays } from "@/db/schema";
import { CUTOFF_HOUR, CUTOFF_MINUTE, TIMEZONE } from "@/lib/constants";

export type DayType = "holiday" | "weekend" | "extra" | "working";

/** Formats a Date as YYYY-MM-DD in TIMEZONE, matching Postgres `date` columns. */
export function toDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** "Now," honoring a `?asOf=YYYY-MM-DD` override outside production, for manual testing. */
export function todayInTz(asOfOverride?: string | null): string {
  if (process.env.NODE_ENV !== "production" && asOfOverride) {
    return asOfOverride;
  }
  return toDateKey(new Date());
}

function weekdayOf(dateKey: string): number {
  // Noon UTC avoids any date-boundary drift when the key is parsed as UTC.
  const d = new Date(`${dateKey}T12:00:00Z`);
  return d.getUTCDay(); // 0 = Sunday, 6 = Saturday
}

export function isWeekend(dateKey: string): boolean {
  const day = weekdayOf(dateKey);
  return day === 0 || day === 6;
}

export function addDaysToKey(dateKey: string, delta: number): string {
  const d = new Date(`${dateKey}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export async function classifyDate(dateKey: string): Promise<DayType> {
  const db = getDb();
  const [holiday] = await db.select().from(holidays).where(eq(holidays.date, dateKey)).limit(1);
  if (holiday) return "holiday";

  if (isWeekend(dateKey)) {
    const [extra] = await db.select().from(extraDays).where(eq(extraDays.date, dateKey)).limit(1);
    return extra ? "extra" : "weekend";
  }

  return "working";
}

export async function isWorkingDay(dateKey: string): Promise<boolean> {
  const type = await classifyDate(dateKey);
  return type === "working" || type === "extra";
}

/** Walks backward (bounded) to find the most recent working/extra day before `dateKey`. */
export async function previousWorkingDay(dateKey: string, maxLookback = 14): Promise<string | null> {
  let cursor = dateKey;
  for (let i = 0; i < maxLookback; i++) {
    cursor = addDaysToKey(cursor, -1);
    if (await isWorkingDay(cursor)) {
      return cursor;
    }
  }
  return null;
}

/** The UTC instant of the submission cutoff for a given local date. */
export function cutoffInstant(dateKey: string): Date {
  const hh = String(CUTOFF_HOUR).padStart(2, "0");
  const mm = String(CUTOFF_MINUTE).padStart(2, "0");
  return fromZonedTime(`${dateKey}T${hh}:${mm}:00`, TIMEZONE);
}

export function isPastCutoff(dateKey: string, now: Date = new Date()): boolean {
  return now.getTime() >= cutoffInstant(dateKey).getTime();
}

/** e.g. "Monday, Sep 15" — for display only. */
export function formatDateLabel(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(d);
}
