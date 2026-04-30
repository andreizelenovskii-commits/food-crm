import { NextResponse, type NextRequest } from "next/server";

const BACKEND_SESSION_COOKIE_NAME = "food_crm_api_session";

export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(BACKEND_SESSION_COOKIE_NAME)?.value);

  if (hasSession) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (returnTo !== "/dashboard") {
    loginUrl.searchParams.set("returnTo", returnTo);
  }

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
