import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: auth.status });
  }

  const { data: authors, error: aErr } = await supabaseAdmin
    .from("authors")
    .select("id, full_name, bio, profile_image_url, created_at")
    .order("created_at", { ascending: false });

  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });

  // Count books per author
  const { data: books, error: bErr } = await supabaseAdmin
    .from("books")
    .select("author_id, id");

  if (bErr) return NextResponse.json({ error: bErr.message }, { status: 500 });

  const counts = new Map<string, number>();
  for (const b of books ?? []) {
    counts.set(b.author_id, (counts.get(b.author_id) ?? 0) + 1);
  }

  const rows = (authors ?? []).map((a) => ({
    ...a,
    books_count: counts.get(a.id) ?? 0,
  }));

  return NextResponse.json({ authors: rows });
}
