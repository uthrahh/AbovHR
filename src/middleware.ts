import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authEdgeConfig } from "@/lib/auth/edge-config";

const { auth } = NextAuth(authEdgeConfig);

const ROLE_PREFIXES: { prefix: string; roles: string[] }[] = [
  { prefix: "/employer", roles: ["EMPLOYER", "RECRUITER"] },
  { prefix: "/institution", roles: ["INSTITUTION", "EDUCATOR"] },
  { prefix: "/admin", roles: ["ADMIN"] },
];

const AUTHENTICATED_PREFIXES = ["/dashboard"];

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const user = req.auth?.user;

  const roleRule = ROLE_PREFIXES.find((r) => pathname.startsWith(r.prefix));
  if (roleRule) {
    if (!user) {
      const signInUrl = new URL("/sign-in", req.nextUrl);
      signInUrl.searchParams.set("next", pathname + search);
      return NextResponse.redirect(signInUrl);
    }
    if (!roleRule.roles.includes(user.role)) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (AUTHENTICATED_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!user) {
      const signInUrl = new URL("/sign-in", req.nextUrl);
      signInUrl.searchParams.set("next", pathname + search);
      return NextResponse.redirect(signInUrl);
    }
    if (user.role !== "CANDIDATE") {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/employer/:path*", "/institution/:path*", "/admin/:path*"],
};
