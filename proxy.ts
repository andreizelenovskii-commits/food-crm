import { NextRequest, NextResponse } from "next/server";

const PUBLIC_HOSTS = new Set(["crmandromeda.ru", "www.crmandromeda.ru"]);
const CRM_HOSTS = new Set(["crm.crmandromeda.ru", "dev.crm.crmandromeda.ru"]);
const CRM_ORIGIN = "https://crm.crmandromeda.ru";
const PUBLIC_ORIGIN = "https://crmandromeda.ru";

function getHostname(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host") || request.nextUrl.host;

  return host.split(":")[0]?.toLowerCase() ?? "";
}

function redirectTo(origin: string, request: NextRequest, pathname: string) {
  const target = new URL(pathname, origin);
  target.search = request.nextUrl.search;

  return NextResponse.redirect(target, 307);
}

export function proxy(request: NextRequest) {
  const hostname = getHostname(request);
  const { pathname } = request.nextUrl;

  if (PUBLIC_HOSTS.has(hostname)) {
    if (pathname === "/login" || pathname.startsWith("/dashboard")) {
      return redirectTo(CRM_ORIGIN, request, pathname);
    }

    if (pathname === "/api/auth/session-login") {
      return redirectTo(CRM_ORIGIN, request, "/login");
    }
  }

  if (CRM_HOSTS.has(hostname)) {
    if (pathname === "/") {
      return redirectTo(CRM_ORIGIN, request, "/login");
    }

    if (pathname.startsWith("/menu")) {
      return redirectTo(PUBLIC_ORIGIN, request, pathname);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/menu/:path*", "/api/auth/session-login"],
};
