"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { clearSessionCookie, setSessionCookie } from "@/lib/session-cookies";
import { signSession } from "@/lib/session";

const emailSchema = z.string().trim().toLowerCase().email();

export type LoginState = { error?: string } | undefined;

export async function loginWithEmail(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const [user] = await getDb().select().from(users).where(eq(users.email, parsed.data)).limit(1);

  if (!user || !user.active) {
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

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
