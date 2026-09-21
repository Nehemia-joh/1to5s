"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db";
import { appSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-guard";
import { writeAuditLog } from "@/lib/audit";

export async function setTaskCarryover(enabled: boolean): Promise<void> {
  const session = await requireAdmin();

  const db = getDb();

  // Ensure settings row exists
  await db
    .insert(appSettings)
    .values({ id: 1, taskCarryoverEnabled: false })
    .onConflictDoNothing({ target: appSettings.id });

  // Update the setting
  await db
    .update(appSettings)
    .set({ taskCarryoverEnabled: enabled })
    .where(eq(appSettings.id, 1));

  await writeAuditLog({
    actorId: Number(session.sub),
    action: "settings.update",
    targetType: "settings",
    targetId: "task_carryover",
    metadata: { enabled },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/form");
}
