import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { isAdminRole } from "@/lib/permissions/policies";

export default withAuth(
  function proxy(req) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth.token;

    if (pathname.startsWith("/admin") && !isAdminRole(token?.role as string | null)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname.startsWith("/portal") && !token?.customerId) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        if (pathname.startsWith("/admin")) {
          return Boolean(token?.role);
        }

        if (pathname.startsWith("/portal")) {
          return Boolean(token?.sub);
        }

        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
