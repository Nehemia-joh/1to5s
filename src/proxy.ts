import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { verifySession } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (pathname === "/login") {
    if (session) {
      return NextResponse.redirect(new URL(session.role === "admin" ? "/admin/board" : "/form", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/form", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/form", "/history", "/admin/:path*", "/login"],
};
