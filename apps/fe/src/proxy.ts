import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/lock-screen", "/api/auth"];
const AUTH_COOKIE_PREFIX = process.env.NEXT_PUBLIC_AUTH_COOKIE_PREFIX?.trim() || "komando";
const SESSION_COOKIE_NAME = `${AUTH_COOKIE_PREFIX}.session_token`;
const SESSION_COOKIES = [SESSION_COOKIE_NAME, `__Secure-${SESSION_COOKIE_NAME}`];

function hasSessionCookie(request: NextRequest) {
  return SESSION_COOKIES.some((cookieName) => Boolean(request.cookies.get(cookieName)?.value));
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const hasSession = hasSessionCookie(request);

  if (isPublic) {
    if (hasSession && (pathname === "/login" || pathname === "/lock-screen")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/v1|_next/static|_next/image|favicon.ico|favicon.svg|.*\\..*).*)"],
};
