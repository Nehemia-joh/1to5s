import { asc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { users } from "@/db/schema";

export async function listRoster() {
  return getDb().select().from(users).orderBy(asc(users.name));
}

export async function listActiveUsers() {
  return getDb().select().from(users).where(eq(users.active, true)).orderBy(asc(users.name));
}
