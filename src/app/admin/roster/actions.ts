"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-guard";
import { writeAuditLog } from "@/lib/audit";

const addMemberSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export type AddMemberState = { error?: string } | undefined;

export async function addRosterMember(_prevState: AddMemberState, formData: FormData): Promise<AddMemberState> {
  const admin = await requireAdmin();

  const parsed = addMemberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  const db = getDb();
  const [existing] = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  if (existing) {
    return { error: "That email is already on the roster." };
  }

  const [created] = await db
    .insert(users)
    .values({ name: parsed.data.name, email: parsed.data.email, role: "member", active: true })
    .returning({ id: users.id });

  await writeAuditLog({
    actorId: Number(admin.sub),
    action: "roster.add",
    targetType: "user",
    targetId: String(created.id),
    metadata: { name: parsed.data.name, email: parsed.data.email },
  });

  revalidatePath("/admin/roster");
  return undefined;
}

export async function setRosterActive(userId: number, active: boolean): Promise<void> {
  const admin = await requireAdmin();

  const db = getDb();
  await db.update(users).set({ active }).where(eq(users.id, userId));

  await writeAuditLog({
    actorId: Number(admin.sub),
    action: active ? "roster.reactivate" : "roster.deactivate",
    targetType: "user",
    targetId: String(userId),
  });

  revalidatePath("/admin/roster");
}
