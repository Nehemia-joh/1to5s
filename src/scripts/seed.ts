import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { users } from "@/db/schema";

function titleize(localPart: string): string {
  return localPart
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function parseAdminEmails(raw: string): Array<{ name: string; email: string }> {
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const match = entry.match(/^(.*)<(.+)>$/);
      if (match) {
        return { name: match[1].trim(), email: match[2].trim().toLowerCase() };
      }
      const email = entry.toLowerCase();
      return { name: titleize(email.split("@")[0]), email };
    });
}

async function main() {
  const db = getDb();
  const raw = process.env.ADMIN_EMAILS;
  if (!raw) {
    console.log("ADMIN_EMAILS is not set — nothing to seed.");
    return;
  }

  const admins = parseAdminEmails(raw);
  if (admins.length === 0) {
    console.log("ADMIN_EMAILS was empty after parsing — nothing to seed.");
    return;
  }

  for (const admin of admins) {
    const [existing] = await db.select().from(users).where(eq(users.email, admin.email)).limit(1);

    if (existing) {
      if (existing.role !== "admin" || !existing.active) {
        await db.update(users).set({ role: "admin", active: true }).where(eq(users.id, existing.id));
        console.log(`Promoted existing user to active admin: ${admin.email}`);
      } else {
        console.log(`Already an active admin: ${admin.email}`);
      }
      continue;
    }

    await db.insert(users).values({ name: admin.name, email: admin.email, role: "admin", active: true });
    console.log(`Created admin: ${admin.name} <${admin.email}>`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
