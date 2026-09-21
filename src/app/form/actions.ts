"use server";

import { and, asc, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDb } from "@/db";
import { attendance, entries, entryTasks, taskStatus } from "@/db/schema";
import { requireUser } from "@/lib/auth-guard";
import { classifyDate, isPastCutoff, todayInTz } from "@/lib/dates";
import { getSettings } from "@/lib/queries/settings";

export type SaveEntryState = { error?: string } | undefined;

export async function saveEntry(_prevState: SaveEntryState, formData: FormData): Promise<SaveEntryState> {
  const session = await requireUser();
  const userId = Number(session.sub);

  const todayStr = formData.get("today") as string;
  const devOverride = process.env.NODE_ENV !== "production" ? todayStr : undefined;
  const today = todayInTz(devOverride);

  const dayType = await classifyDate(today);
  if (dayType === "holiday" || dayType === "weekend") {
    return { error: "There's no 1-5 due today." };
  }

  // Parse task arrays from form data
  const taskIds = formData.getAll("taskId");
  const taskTexts = formData.getAll("taskText");

  // Validate: at least one non-empty task
  const filledTasks = taskTexts.filter((text) => typeof text === "string" && text.trim());
  if (filledTasks.length === 0) {
    return { error: "Add at least one task for today." };
  }

  const blocker = (formData.get("blocker") as string) || "";
  const yesterdayComment = (formData.get("yesterdayComment") as string) || "";

  const db = getDb();
  const [existing] = await db.select().from(entries).where(and(eq(entries.userId, userId), eq(entries.entryDate, today))).limit(1);

  let entryId: number;
  if (existing) {
    entryId = existing.id;
    await db
      .update(entries)
      .set({
        blocker: blocker || null,
        yesterdayComment: yesterdayComment || null,
        updatedAt: new Date(),
      })
      .where(eq(entries.id, entryId));
  } else {
    const [created] = await db
      .insert(entries)
      .values({
        userId,
        entryDate: today,
        blocker: blocker || null,
        yesterdayComment: yesterdayComment || null,
      })
      .returning({ id: entries.id });
    entryId = created.id;
  }

  // Get existing tasks for this entry to determine slots
  const existingTasks = await db
    .select({ id: entryTasks.id, slot: entryTasks.slot })
    .from(entryTasks)
    .where(eq(entryTasks.entryId, entryId))
    .orderBy(asc(entryTasks.slot));

  const existingSlotMap = new Map(existingTasks.map((t) => [String(t.id), t.slot]));
  let maxSlot = existingTasks.length > 0 ? Math.max(...existingTasks.map((t) => t.slot)) : 0;

  // Track which task IDs we're keeping
  const keptTaskIds = new Set<string>();

  // Process each task row
  for (let i = 0; i < taskTexts.length; i++) {
    const taskId = taskIds[i] as string;
    const text = (taskTexts[i] as string)?.trim();

    if (!text) {
      // Empty text + existing id → delete that task
      if (taskId && existingSlotMap.has(taskId)) {
        await db.delete(entryTasks).where(eq(entryTasks.id, Number(taskId)));
      }
      continue;
    }

    if (taskId && existingSlotMap.has(taskId)) {
      // Non-empty text + existing id → update text only
      keptTaskIds.add(taskId);
      await db
        .update(entryTasks)
        .set({ taskText: text })
        .where(eq(entryTasks.id, Number(taskId)));
    } else {
      // Non-empty text + no id → insert with next slot
      maxSlot++;
      await db.insert(entryTasks).values({
        entryId,
        slot: maxSlot,
        taskText: text,
      });
    }
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

export async function markTaskStatus(taskId: number, status: string): Promise<void> {
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

/** Helper to add a task to an entry at the next available slot */
async function addTaskToEntry(entryId: number, taskText: string): Promise<void> {
  const db = getDb();

  // Find current max slot
  const [maxSlotRow] = await db
    .select({ maxSlot: max(entryTasks.slot) })
    .from(entryTasks)
    .where(eq(entryTasks.entryId, entryId));

  const nextSlot = (maxSlotRow?.maxSlot ?? 0) + 1;

  await db.insert(entryTasks).values({
    entryId,
    slot: nextSlot,
    taskText,
  });
}

/** Carry a task from a previous day to today */
export async function carryTaskToToday(taskId: number): Promise<void> {
  const session = await requireUser();
  const userId = Number(session.sub);

  const settings = await getSettings();
  if (!settings.taskCarryoverEnabled) return;

  const db = getDb();

  // Get the source task with ownership check
  const [row] = await db
    .select({ taskText: entryTasks.taskText, ownerId: entries.userId })
    .from(entryTasks)
    .innerJoin(entries, eq(entryTasks.entryId, entries.id))
    .where(eq(entryTasks.id, taskId))
    .limit(1);

  if (!row || row.ownerId !== userId) return;

  const today = todayInTz();

  // Get or create today's entry
  const [existing] = await db
    .select()
    .from(entries)
    .where(and(eq(entries.userId, userId), eq(entries.entryDate, today)))
    .limit(1);

  let entryId: number;
  if (existing) {
    entryId = existing.id;
  } else {
    const [created] = await db
      .insert(entries)
      .values({ userId, entryDate: today })
      .returning({ id: entries.id });
    entryId = created.id;
  }

  // Add the task to today's entry
  await addTaskToEntry(entryId, row.taskText);

  revalidatePath("/form");
}
