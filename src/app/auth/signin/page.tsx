"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const supabase = getSupabaseBrowserClient();

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/books");
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="text-sm text-muted-foreground">
        Sign in to your account.
      </p>

      <form onSubmit={handleSignIn} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
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
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* ✅ Link to Sign up */}
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-black hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
