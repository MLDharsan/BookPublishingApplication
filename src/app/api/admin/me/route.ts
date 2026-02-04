import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ isAdmin: false }, { status: 200 });

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user) return NextResponse.json({ isAdmin: false }, { status: 200 });

  const { data: adminRow } = await supabaseAdmin
    .from("admins")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  return NextResponse.json({ isAdmin: !!adminRow }, { status: 200 });
}
