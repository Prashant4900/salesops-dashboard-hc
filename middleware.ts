import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "salesops_session";
const PROTECTED_PREFIXES = ["/overview", "/deals", "/pipeline", "/forecasting", "/customers", "/reports", "/team", "/settings"];
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

async function isValidSession(token: string | undefined) {
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = await isValidSession(
    request.cookies.get(SESSION_COOKIE)?.value
  );

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (isProtected && !authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (authenticated && AUTH_ROUTES.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/overview";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/overview/:path*",
    "/deals/:path*",
    "/pipeline/:path*",
    "/forecasting/:path*",
    "/customers/:path*",
    "/reports/:path*",
    "/team/:path*",
    "/settings/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
