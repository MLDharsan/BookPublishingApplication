import type { NextRequest } from "next/server";
import { createSupabaseMiddleware } from "./lib/supabaseMiddleware";

export async function middleware(req: NextRequest) {
  const { res } = createSupabaseMiddleware(req);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
