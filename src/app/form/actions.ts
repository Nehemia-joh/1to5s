"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDb } from "@/db";
import { attendance, entries, entryTasks, taskStatus } from "@/db/schema";
import { requireUser } from "@/lib/auth-guard";
import { classifyDate, isPastCutoff, todayInTz } from "@/lib/dates";

const saveEntrySchema = z
  .object({
    today: z.string().optional(),
    task1: z.string().trim().max(500).optional().default(""),
    task2: z.string().trim().max(500).optional().default(""),
    task3: z.string().trim().max(500).optional().default(""),
    blocker: z.string().trim().max(1000).optional().default(""),
    yesterdayComment: z.string().trim().max(1000).optional().default(""),
  })
  .refine((v) => v.task1 || v.task2 || v.task3, {
    message: "Add at least one task for today.",
  });

export type SaveEntryState = { error?: string } | undefined;

export async function saveEntry(_prevState: SaveEntryState, formData: FormData): Promise<SaveEntryState> {
  const session = await requireUser();
  const userId = Number(session.sub);

  const parsed = saveEntrySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }
  const data = parsed.data;

  const devOverride = process.env.NODE_ENV !== "production" ? data.today : undefined;
  const today = todayInTz(devOverride);

  const dayType = await classifyDate(today);
  if (dayType === "holiday" || dayType === "weekend") {
    return { error: "There's no 1-5 due today." };
  }

  const db = getDb();
  const [existing] = await db.select().from(entries).where(and(eq(entries.userId, userId), eq(entries.entryDate, today))).limit(1);

  let entryId: number;
  if (existing) {
    entryId = existing.id;
    await db
      .update(entries)
      .set({
        blocker: data.blocker || null,
        yesterdayComment: data.yesterdayComment || null,
        updatedAt: new Date(),
      })
      .where(eq(entries.id, entryId));
  } else {
    const [created] = await db
      .insert(entries)
      .values({
        userId,
        entryDate: today,
        blocker: data.blocker || null,
        yesterdayComment: data.yesterdayComment || null,
      })
      .returning({ id: entries.id });
    entryId = created.id;
  }

  await db.delete(entryTasks).where(eq(entryTasks.entryId, entryId));

  const taskRows = [
    { slot: 1, text: data.task1 },
    { slot: 2, text: data.task2 },
    { slot: 3, text: data.task3 },
  ].filter((t) => t.text);

  if (taskRows.length > 0) {
    await db.insert(entryTasks).values(
      taskRows.map((t) => ({
        entryId,
        slot: t.slot,
        taskText: t.text,
      })),
    );
  }

  if (!existing) {
    await db
      .insert(attendance)
      .values({
        userId,
        date: today,
        status: isPastCutoff(today) ? "late" : "submitted",
        entryId,
      })
      .onConflictDoNothing({ target: [attendance.userId, attendance.date] });
  }

  revalidatePath("/form");
  return undefined;
}

const markStatusSchema = z.object({
  taskId: z.coerce.number().int().positive(),
  status: z.enum(taskStatus.enumValues),
});

export async function markPreviousTaskStatus(taskId: number, status: string): Promise<void> {
  const session = await requireUser();
  const userId = Number(session.sub);

  const parsed = markStatusSchema.safeParse({ taskId, status });
  if (!parsed.success) return;

  const db = getDb();
  const [row] = await db
    .select({ taskId: entryTasks.id, ownerId: entries.userId })
    .from(entryTasks)
    .innerJoin(entries, eq(entryTasks.entryId, entries.id))
    .where(eq(entryTasks.id, parsed.data.taskId))
    .limit(1);

  if (!row || row.ownerId !== userId) return;

  await db
    .update(entryTasks)
    .set({ status: parsed.data.status, statusUpdatedAt: new Date() })
    .where(eq(entryTasks.id, parsed.data.taskId));

  revalidatePath("/form");
}
