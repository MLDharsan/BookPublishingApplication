import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return { ok: false as const, status: 401 };

  const { data: userData } = await supabaseAdmin.auth.getUser(token);
  const user = userData?.user;
  if (!user) return { ok: false as const, status: 401 };

  const { data: adminRow } = await supabaseAdmin
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) return { ok: false as const, status: 403 };
  return { ok: true as const, userId: user.id };
}

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const { data, error } = await supabaseAdmin
    .from("books")
    .select("id, title, price_lkr, allow_download, is_published, created_at, author_id")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ books: data ?? [] });
}
