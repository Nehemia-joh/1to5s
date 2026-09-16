import { desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { auditLog, users } from "@/db/schema";

export async function listAuditLog(limit = 100) {
  const db = getDb();
  return db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      targetType: auditLog.targetType,
      targetId: auditLog.targetId,
      metadata: auditLog.metadata,
      createdAt: auditLog.createdAt,
      actorName: users.name,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.actorId, users.id))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
}
