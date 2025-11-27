import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const url = request.nextUrl.clone();

  // 🔐 Protect ONLY /admin routes
  if (url.pathname.startsWith("/admin")) {
    if (!token) {
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }
  }

  // Allow everything else
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*", // Protect only admin routes
  ],
};