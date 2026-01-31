"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function Navbar() {
  const supabase = getSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
      setLoading(false);
    }
    loadUser();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          BookVerse
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/books" className="hover:underline">
            Browse Books
          </Link>

          {!loading && email ? (
            <>
              <Link
                href="/author/upload"
                className="rounded-md border px-3 py-2 hover:bg-muted"
              >
                Upload Book
              </Link>

              <Link
                href="/author/profile"
                className="rounded-md border px-3 py-2 hover:bg-muted"
              >
                Author Profile
              </Link>

              <span className="text-muted-foreground">{email}</span>

              <button
                onClick={handleLogout}
                className="rounded-md bg-black px-3 py-2 text-white hover:opacity-90"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="hover:underline">
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-md bg-black px-3 py-2 text-white hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
