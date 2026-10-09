import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Sends signed-out visitors to log in before private pages render. This only
 * checks that a session cookie exists; pages and the API still verify the
 * session itself, so a fake cookie gets no data.
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request, { cookiePrefix: "nm" })) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const login = new URL("/auth/login", request.url);
  login.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  // /profile itself is private; /profile/<username> pages are public.
  matcher: [
    "/sell/:path*",
    "/orders/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/profile",
    "/profile/edit",
    "/hire/task/new",
    "/admin/:path*",
  ],
};
