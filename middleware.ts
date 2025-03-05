import { defaultLocale } from "./constant/locale";
import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  if (pathname === "/robots.txt") {
    return NextResponse.rewrite(new URL("/robots.txt", request.url));
  }
  if (pathname === "/favicon.ico") {
    return NextResponse.rewrite(new URL("/favicon.ico", request.url));
  }

  if (
    pathname.startsWith(`/${defaultLocale}/`) ||
    pathname === `/${defaultLocale}`
  ) {
    return NextResponse.redirect(
      new URL(
        pathname.replace(
          `/${defaultLocale}`,
          pathname === `/${defaultLocale}` ? "/" : ""
        ),
        request.url
      )
    );
  }
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next).*)",
    // Optional: only run on root (/) URL
    // '/'
  ],
};
