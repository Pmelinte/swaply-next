import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // Reîmprospătează/sincronizează sesiunea pe fiecare request (fix pt. „sunt pe /add dar nu par logat în header”)
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();
  return res;
}

// Rulează măcar pe rutele noastre
export const config = {
  matcher: ["/", "/login", "/add", "/my-objects", "/auth/:path*"]
};
