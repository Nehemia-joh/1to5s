"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDb } from "@/db";
import { extraDays, holidays } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-guard";
import { writeAuditLog } from "@/lib/audit";

const dateEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date"),
  label: z.string().trim().min(1, "Label is required").max(200),
});

export type CalendarState = { error?: string } | undefined;

export async function addHoliday(_prevState: CalendarState, formData: FormData): Promise<CalendarState> {
  const admin = await requireAdmin();
  const parsed = dateEntrySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  const db = getDb();
  const [conflict] = await db.select().from(extraDays).where(eq(extraDays.date, parsed.data.date)).limit(1);
  if (conflict) {
    return { error: "That date is already marked as an extra working day. Remove it first." };
  }

  await db
    .insert(holidays)
    .values({ date: parsed.data.date, label: parsed.data.label, createdBy: Number(admin.sub) })
    .onConflictDoNothing({ target: holidays.date });

  await writeAuditLog({
    actorId: Number(admin.sub),
    action: "calendar.add_holiday",
    targetType: "holiday",
    targetId: parsed.data.date,
    metadata: { label: parsed.data.label },
  });

  revalidatePath("/admin/calendar");
  return undefined;
}

export async function removeHoliday(id: number): Promise<void> {
  const admin = await requireAdmin();
  const db = getDb();
  const [row] = await db.select().from(holidays).where(eq(holidays.id, id)).limit(1);
  if (!row) return;

  await db.delete(holidays).where(eq(holidays.id, id));

  await writeAuditLog({
    actorId: Number(admin.sub),
    action: "calendar.remove_holiday",
    targetType: "holiday",
    targetId: row.date,
    metadata: { label: row.label },
  });

  revalidatePath("/admin/calendar");
}

export async function addExtraDay(_prevState: CalendarState, formData: FormData): Promise<CalendarState> {
  const admin = await requireAdmin();
  const parsed = dateEntrySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  const db = getDb();
  const [conflict] = await db.select().from(holidays).where(eq(holidays.date, parsed.data.date)).limit(1);
  if (conflict) {
    return { error: "That date is already marked as a holiday. Remove it first." };
  }

  await db
    .insert(extraDays)
    .values({ date: parsed.data.date, label: parsed.data.label, createdBy: Number(admin.sub) })
    .onConflictDoNothing({ target: extraDays.date });

  await writeAuditLog({
    actorId: Number(admin.sub),
    action: "calendar.add_extra_day",
    targetType: "extra_day",
    targetId: parsed.data.date,
    metadata: { label: parsed.data.label },
  });

  revalidatePath("/admin/calendar");
  return undefined;
}

export async function removeExtraDay(id: number): Promise<void> {
  const admin = await requireAdmin();
  const db = getDb();
  const [row] = await db.select().from(extraDays).where(eq(extraDays.id, id)).limit(1);
  if (!row) return;

  await db.delete(extraDays).where(eq(extraDays.id, id));

  await writeAuditLog({
    actorId: Number(admin.sub),
    action: "calendar.remove_extra_day",
    targetType: "extra_day",
    targetId: row.date,
    metadata: { label: row.label },
  });

  revalidatePath("/admin/calendar");
}
