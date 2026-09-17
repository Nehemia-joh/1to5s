"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { read, utils } from "xlsx";
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

const emailSchema = z.string().trim().toLowerCase().email();

function normalizeKey(key: string): string {
  return key.trim().toLowerCase();
}

function findField(row: Record<string, unknown>, candidates: string[]): string {
  const normalized = new Map(Object.entries(row).map(([k, v]) => [normalizeKey(k), v]));
  for (const candidate of candidates) {
    const value = normalized.get(candidate);
    if (value != null && String(value).trim() !== "") return String(value).trim();
  }
  return "";
}

export type ImportRosterState =
  | { error: string; summary?: undefined }
  | { error?: undefined; summary: { created: number; skipped: number; invalid: number; invalidRows: string[] } }
  | undefined;

export async function importRosterFromExcel(_prevState: ImportRosterState, formData: FormData): Promise<ImportRosterState> {
  const admin = await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an Excel (.xlsx) or CSV file first." };
  }

  let rows: Record<string, unknown>[];
  try {
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer, { type: "buffer" });
    const firstSheet = workbook.SheetNames[0];
    rows = utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: "" });
  } catch {
    return { error: "Couldn't read that file. Make sure it's a valid .xlsx or .csv export." };
  }

  const db = getDb();
  const existingUsers = await db.select({ email: users.email }).from(users);
  const existingEmails = new Set(existingUsers.map((u) => u.email));

  const toInsert: { name: string; email: string; role: "member" | "admin" }[] = [];
  const seenInBatch = new Set<string>();
  let skipped = 0;
  let invalid = 0;
  const invalidRows: string[] = [];

  rows.forEach((row, index) => {
    const rawName = findField(row, ["name", "full name", "fullname"]);
    const rawEmail = findField(row, ["email", "email address"]);
    const rawRole = findField(row, ["role"]);

    if (!rawName && !rawEmail) return; // blank row

    const emailResult = emailSchema.safeParse(rawEmail);
    if (!rawName || !emailResult.success) {
      invalid++;
      invalidRows.push(`Row ${index + 2}: ${rawName || "(no name)"} / ${rawEmail || "(no email)"}`);
      return;
    }

    const email = emailResult.data;
    if (existingEmails.has(email) || seenInBatch.has(email)) {
      skipped++;
      return;
    }

    seenInBatch.add(email);
    toInsert.push({
      name: rawName,
      email,
      role: rawRole.toLowerCase().includes("admin") ? "admin" : "member",
    });
  });

  if (toInsert.length > 0) {
    await db.insert(users).values(toInsert.map((r) => ({ ...r, active: true }))).onConflictDoNothing({ target: users.email });
  }

  await writeAuditLog({
    actorId: Number(admin.sub),
    action: "roster.import",
    targetType: "roster",
    metadata: { created: toInsert.length, skipped, invalid, fileName: file.name },
  });

  revalidatePath("/admin/roster");
  return { summary: { created: toInsert.length, skipped, invalid, invalidRows } };
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

export type SetRoleResult = { error?: string } | undefined;

export async function setRosterRole(userId: number, role: "member" | "admin"): Promise<SetRoleResult> {
  const admin = await requireAdmin();
  const db = getDb();

  if (role === "member") {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(eq(users.role, "admin"), eq(users.active, true)));
    const [target] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);

    if (target?.role === "admin" && count <= 1) {
      return { error: "Can't remove the last admin. Promote someone else first." };
    }
  }

  await db.update(users).set({ role }).where(eq(users.id, userId));

  await writeAuditLog({
    actorId: Number(admin.sub),
    action: role === "admin" ? "roster.promote_admin" : "roster.demote_admin",
    targetType: "user",
    targetId: String(userId),
  });

  revalidatePath("/admin/roster");
  return undefined;
}
