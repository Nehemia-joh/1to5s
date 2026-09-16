import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/constants";
import { type SessionPayload, verifySession } from "@/lib/session";

/** Reads and verifies the session cookie. Only usable in server components / server actions. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE_NAME)?.value);
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}
