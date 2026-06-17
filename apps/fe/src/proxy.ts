import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/lock-screen", "/api/auth"];
const APP_COOKIE = "komando.session_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const hasSession = Boolean(request.cookies.get(APP_COOKIE)?.value);

  if (isPublic) {
    if (hasSession && (pathname === "/login" || pathname === "/lock-screen")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/v1|_next/static|_next/image|favicon.ico|favicon.svg|.*\\..*).*)"],
};
