import { redirect } from "next/navigation";

import { getSession } from "@/lib/session-cookies";
import type { SessionPayload } from "@/lib/session";

/** Redirects to /login if there is no valid session. Call at the top of every protected page. */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/** Redirects non-admins away. Call at the top of every admin page, in addition to middleware. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireUser();
  if (session.role !== "admin") {
    redirect("/form");
  }
  return session;
}
