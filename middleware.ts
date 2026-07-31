import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME } from "@/lib/constants";
import { routing } from "@/navigation";

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  // 1. First, process the locale routing
  const response = intlMiddleware(request);

  // 2. We extract the pathname ignoring the locale prefix to run auth checks
  // next-intl automatically sets the x-next-intl-locale header to the resolved locale
  const locale = response.headers.get("x-next-intl-locale") || routing.defaultLocale;
  let pathname = request.nextUrl.pathname;
  if (pathname.startsWith(`/${locale}`)) {
    pathname = pathname.replace(`/${locale}`, "") || "/";
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const role = request.cookies.get(ROLE_COOKIE_NAME)?.value;
  const isAuthed = Boolean(token && role);

  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/onboarding";
  const isUserArea = pathname.startsWith("/user");
  const isPurohitArea = pathname.startsWith("/purohit");
  const isAdminArea = pathname.startsWith("/admin");

  if (isAuthed && isAuthPage) {
    if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.redirect(new URL(role === "purohit" ? "/purohit" : "/user", request.url));
  }

  if (!isAuthed && (isUserArea || isPurohitArea || isAdminArea)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthed) {
    if (isAdminArea && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL(role === "purohit" ? "/purohit" : "/user", request.url));
    }
    if (isUserArea && role !== "user") {
      return NextResponse.redirect(new URL(role === "SUPER_ADMIN" ? "/admin" : "/purohit", request.url));
    }
    if (isPurohitArea && role !== "purohit") {
      return NextResponse.redirect(new URL(role === "SUPER_ADMIN" ? "/admin" : "/user", request.url));
    }
  }

  return response;
}

export const config = {
  // Skip all internal paths (_next), API routes, and static images
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
