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
  return { ok: true as const };
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const body = await req.json();
  const bookId: string = body.bookId;
  const publish: boolean = body.publish;

  if (!bookId || typeof publish !== "boolean") {
    return NextResponse.json({ error: "bookId and publish are required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("books")
    .update({
      is_published: publish,
      published_at: publish ? new Date().toISOString() : null,
    })
    .eq("id", bookId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
