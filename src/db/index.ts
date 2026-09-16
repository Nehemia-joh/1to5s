import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

// Lazy init: a top-level `neon(process.env.DATABASE_URL!)` call would throw
// at module-evaluation time whenever this file is imported before the env
// is loaded (e.g. standalone scripts, or `next build` before env is wired
// up) — see the "Build-time safety" note in Vercel's Neon storage guide.
let _db: Db | null = null;

export function getDb(): Db {
  if (!_db) {
    const sql = neon(process.env.DATABASE_URL!);
    _db = drizzle(sql, { schema });
  }
  return _db;
}
