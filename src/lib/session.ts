import { jwtVerify, SignJWT } from "jose";

import { SESSION_TTL_SECONDS } from "@/lib/constants";

/**
 * Pure JWT sign/verify — no `next/headers`, so this stays importable from
 * `middleware.ts` (Edge runtime, no request-scoped cookie store). Cookie
 * read/write helpers live in `session-cookies.ts` instead.
 */
export type SessionPayload = {
  sub: string; // user id, as a string
  email: string;
  name: string;
  role: "member" | "admin";
};

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

/** Verifies a session token. Returns null on any invalid/expired/missing token — never throws. */
export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
