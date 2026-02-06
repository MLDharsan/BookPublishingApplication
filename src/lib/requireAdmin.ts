import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ALLOWED_ADMIN_EMAILS = [
  "dharshanlogadharsan@gmail.com", // ✅ put your admin emails here
];

export async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return { ok: false as const, status: 401 };

  // ✅ Get user from token
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return { ok: false as const, status: 401 };

  const user = data.user;

  // ✅ Extra restriction: only specific emails can be admin
  const email = (user.email ?? "").toLowerCase();
  if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
    return { ok: false as const, status: 403 };
  }

  // ✅ Check admin role table
  const { data: adminRow } = await supabaseAdmin
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) return { ok: false as const, status: 403 };

  return { ok: true as const, userId: user.id, email };
}
