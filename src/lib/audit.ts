import { getDb } from "@/db";
import { auditLog } from "@/db/schema";

export type AuditAction =
  | "roster.add"
  | "roster.import"
  | "roster.deactivate"
  | "roster.reactivate"
  | "roster.promote_admin"
  | "roster.demote_admin"
  | "roster.delete"
  | "calendar.add_holiday"
  | "calendar.remove_holiday"
  | "calendar.add_extra_day"
  | "calendar.remove_extra_day"
  | "attendance.mark_skipped"
  | "cron.cutoff_run"
  | "cron.deadline_run"
  | "settings.update";

export async function writeAuditLog(params: {
  actorId: number | null;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  await getDb().insert(auditLog).values({
    actorId: params.actorId,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    metadata: params.metadata,
  });
}
