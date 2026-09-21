import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { appSettings } from "@/db/schema";

export async function getSettings() {
  const db = getDb();

  // Insert default row if missing, then select
  await db
    .insert(appSettings)
    .values({ id: 1, taskCarryoverEnabled: false })
    .onConflictDoNothing({ target: appSettings.id });

  const [settings] = await db.select().from(appSettings).where(eq(appSettings.id, 1)).limit(1);

  return settings!;
}
