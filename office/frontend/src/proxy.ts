import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js proxy (middleware) for route protection under /office.
 *
 * - Redirects unauthenticated users to /office/login
 * - Redirects authenticated users away from /office/login to /office/dashboard
 * - Protects all routes under /(protected)/
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for the frontend session presence cookie (presence only — validity checked by backend)
  const hasSession = request.cookies.has("nevolyn_session");

  // Root redirect (/office -> /office/dashboard or /office/login)
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = hasSession ? "/dashboard" : "/login";
    return NextResponse.redirect(url);
  }

  // Protected routes that require authentication
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/attendance") ||
    pathname.startsWith("/employees") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/tasks") ||
    pathname.startsWith("/work-logs") ||
    pathname.startsWith("/training") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/audit") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/admin-management");

  // Auth routes (redirect away if already logged in)
  const isAuthRoute = pathname.startsWith("/login");

  if (isProtectedRoute && !hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && hasSession) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    dashUrl.search = "";
    return NextResponse.redirect(dashUrl);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)).*)",
  ],
};
