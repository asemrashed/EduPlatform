import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const requiredRole = (p: string) => (p.startsWith("/admin/") ? "admin" : p.startsWith("/instructor/") ? "instructor" : p.startsWith("/student/") ? "student" : null);
export async function middleware(req: NextRequest) {
  const role = requiredRole(req.nextUrl.pathname); if (!role) return NextResponse.next();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub || token.role !== role) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}
export const config = { matcher: ["/student/:path*", "/instructor/:path*", "/admin/:path*"] };
