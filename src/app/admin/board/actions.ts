"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDb } from "@/db";
import { attendance } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-guard";
import { writeAuditLog } from "@/lib/audit";

const skipSchema = z.object({
  userId: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().trim().min(1, "A reason is required").max(500),
});

export type MarkSkippedState = { error?: string } | undefined;

export async function markAttendanceSkipped(_prevState: MarkSkippedState, formData: FormData): Promise<MarkSkippedState> {
  const admin = await requireAdmin();
  const parsed = skipSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  const db = getDb();
  await db
    .insert(attendance)
    .values({
      userId: parsed.data.userId,
      date: parsed.data.date,
      status: "skipped",
      reason: parsed.data.reason,
    })
    .onConflictDoUpdate({
      target: [attendance.userId, attendance.date],
      set: { status: "skipped", reason: parsed.data.reason, updatedAt: new Date() },
    });

  await writeAuditLog({
    actorId: Number(admin.sub),
    action: "attendance.mark_skipped",
    targetType: "attendance",
    targetId: `${parsed.data.userId}:${parsed.data.date}`,
    metadata: { reason: parsed.data.reason },
  });

  revalidatePath("/admin/board");
  return undefined;
}
