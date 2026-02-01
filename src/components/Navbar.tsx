"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function Navbar() {
  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setEmail(data.user?.email ?? null);
      setLoading(false);
    }

    load();

    // ✅ This is the important part: updates navbar instantly on sign in/out
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    // optional: push to home
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
              <Link href="/author" className="rounded-md border px-3 py-2 hover:bg-muted">
                Author Dashboard
              </Link>
              {/* <Link href="/author/upload" className="rounded-md border px-3 py-2 hover:bg-muted">
                Upload Book
              </Link> */}

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
