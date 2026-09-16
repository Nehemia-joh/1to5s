import { asc } from "drizzle-orm";

import { getDb } from "@/db";
import { users } from "@/db/schema";

export async function listRoster() {
  return getDb().select().from(users).orderBy(asc(users.name));
}
