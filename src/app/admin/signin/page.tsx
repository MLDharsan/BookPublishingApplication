"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const ADMIN_EMAILS = [
  "dharshanlogadharsan@gmail.com", // ✅ change/add your admin emails here
];

export default function AdminSignInPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdminSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!ADMIN_EMAILS.includes(normalizedEmail)) {
      setError("This email is not allowed for admin access.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Go to admin after sign-in
    router.push("/admin/authors");
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Admin Sign in</h1>
      <p className="text-sm text-muted-foreground">
        Restricted access. Admins only.
      </p>

      <form onSubmit={handleAdminSignIn} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />

        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />

        {error && (
          <div className="rounded-md border border-red-500 bg-red-50 p-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          disabled={loading}
          className="w-full rounded-md bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in as admin"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Not an admin?{" "}
        <Link href="/" className="font-medium text-black hover:underline">
          Go back home
        </Link>
      </p>
    </div>
  );
}
