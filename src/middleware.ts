import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
const PUBLIC = ["/", "/api/health", "/api/auth/login", "/api/auth/session"];
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.includes(pathname) || pathname.startsWith("/_next") || pathname.includes(".")) return NextResponse.next();
  const session = req.cookies.get("azurex_session")?.value;
  if (!session && !pathname.startsWith("/api/")) {
    const url = req.nextUrl.clone(); url.pathname = "/"; return NextResponse.redirect(url);
  }
  if (!session && pathname.startsWith("/api/")) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
