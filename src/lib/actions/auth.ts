"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { clearSessionCookie, setSessionCookie } from "@/lib/session-cookies";
import { signSession } from "@/lib/session";
import { SELF_SIGNUP_DOMAIN } from "@/lib/constants";

const emailSchema = z.string().trim().toLowerCase().email();

export type LoginState = { error?: string } | undefined;

export async function loginWithEmail(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, parsed.data)).limit(1);

  if (user) {
    // Existing user - sign in and redirect by role
    if (!user.active) {
      return { error: "That email isn't on the roster. Contact your admin." };
    }

    const token = await signSession({
      sub: String(user.id),
      email: user.email,
      name: user.name,
      role: user.role,
    });
    await setSessionCookie(token);

    redirect(user.role === "admin" ? "/admin/board" : "/form");
  }

  // New user - check if email domain allows self-signup
  if (!parsed.data.endsWith("@" + SELF_SIGNUP_DOMAIN)) {
    return { error: "That email isn't on the roster. Contact your admin." };
  }

  // Create new member account
  const [newUser] = await db
    .insert(users)
    .values({
      name: "",
      email: parsed.data,
      role: "member",
      active: true,
    })
    .returning();

  const token = await signSession({
    sub: String(newUser.id),
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
  });
  await setSessionCookie(token);

  redirect("/welcome");
}

export type WelcomeState = { error?: string } | undefined;

export async function setOwnName(_prevState: WelcomeState, formData: FormData): Promise<WelcomeState> {
  const name = formData.get("name") as string;

  if (!name || !name.trim()) {
    return { error: "Please enter your name." };
  }

  const trimmedName = name.trim();
  if (trimmedName.length > 100) {
    return { error: "Name must be 100 characters or less." };
  }

  // Get current session
  const { getSession } = await import("@/lib/session-cookies");
  const currentSession = await getSession();
  if (!currentSession) {
    redirect("/login");
  }

  const db = getDb();
  await db
    .update(users)
    .set({ name: trimmedName })
    .where(eq(users.id, Number(currentSession.sub)));

  // Re-sign session with updated name
  const token = await signSession({
    sub: currentSession.sub,
    email: currentSession.email,
    name: trimmedName,
    role: currentSession.role,
  });
  await setSessionCookie(token);

  redirect("/form");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
