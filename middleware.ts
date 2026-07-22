import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME } from "@/lib/constants";

/**
 * Edge-level route guard. The JWT itself is never verified here (that's the
 * FastAPI backend's job on every request) — this only checks for the
 * *presence* of the token/role cookies mirrored by `store/useAuthStore.ts`,
 * so an expired-but-present token still passes through and gets caught by
 * the axios 401 interceptor. This keeps the guard fast and dependency-free
 * at the edge while the backend remains the sole source of truth for auth.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const role = request.cookies.get(ROLE_COOKIE_NAME)?.value;
  const isAuthed = Boolean(token && role);

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isUserArea = pathname.startsWith("/user");
  const isPurohitArea = pathname.startsWith("/purohit");

  if (isAuthed && isAuthPage) {
    return NextResponse.redirect(
      new URL(role === "purohit" ? "/purohit" : "/user", request.url)
    );
  }

  if (!isAuthed && (isUserArea || isPurohitArea)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthed && isUserArea && role !== "user") {
    return NextResponse.redirect(new URL("/purohit", request.url));
  }

  if (isAuthed && isPurohitArea && role !== "purohit") {
    return NextResponse.redirect(new URL("/user", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/purohit/:path*", "/login", "/signup"],
};
