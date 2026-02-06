import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: auth.status });
  }

  const body = await req.json();
  const bookId: string = body.bookId;
  const publish: boolean = body.publish;

  if (!bookId || typeof publish !== "boolean") {
    return NextResponse.json(
      { error: "bookId and publish are required" },
      { status: 400 }
    );
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
