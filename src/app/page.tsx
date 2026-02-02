"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type BookRow = {
  id: string;
  title: string;
  price_lkr: number;
  cover_image_url: string | null;
  allow_download: boolean;
  created_at: string;
};

function formatLKR(amount: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
      {text}
    </span>
  );
}

function BookCard({
  id,
  title,
  price,
  coverUrl,
  mode,
}: {
  id: string;
  title: string;
  price: number;
  coverUrl: string | null;
  mode: "Download" | "View only";
}) {
  return (
    <Link
      href={`/books/${id}`}
      className="group relative overflow-hidden rounded-2xl border bg-background transition hover:shadow-md"
    >
      <div className="relative h-52 w-full bg-muted">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            No cover
          </div>
        )}

        <div className="absolute left-3 top-3">
          <Badge text={mode} />
        </div>
      </div>

      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-base font-semibold">{title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{formatLKR(price)}</span>
          <span className="text-xs text-muted-foreground group-hover:underline">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [latest, setLatest] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ NEW: auth state (ONLY for Upload button logic)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    async function loadLatest() {
      const { data } = await supabase
        .from("books")
        .select("id, title, price_lkr, cover_image_url, allow_download, created_at")
        .order("created_at", { ascending: false })
        .limit(6);

      if (!mounted) return;
      setLatest((data ?? []) as BookRow[]);
      setLoading(false);
    }

    loadLatest();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-b from-muted/60 to-background p-8">
        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge text="For Authors" />
            <Badge text="For Readers" />
            <Badge text="Digital Publishing" />
          </div>

          <h1 className="text-3xl font-bold sm:text-4xl">
            Publish books. Reach readers.
          </h1>

          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            BookVerse lets authors upload books and choose whether readers can
            download or only view after purchase.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/books"
              className="rounded-md bg-black px-5 py-2.5 text-sm text-white hover:opacity-90"
            >
              Browse books
            </Link>

            <Link
              href="/auth/signup"
              className="rounded-md border px-5 py-2.5 text-sm hover:bg-muted"
            >
              Become an author
            </Link>

            {/* ✅ FIXED LOGIC (nothing else changed) */}
            <Link
              href={isLoggedIn ? "/author/upload" : "/auth/signin"}
              className="rounded-md border px-5 py-2.5 text-sm hover:bg-muted"
            >
              Upload book
            </Link>
          </div>
        </div>
      </section>

      {/* LATEST BOOKS */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold">Latest books</h2>
          <Link href="/books" className="text-sm hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((b) => (
              <BookCard
                key={b.id}
                id={b.id}
                title={b.title}
                price={b.price_lkr}
                coverUrl={b.cover_image_url}
                mode={b.allow_download ? "Download" : "View only"}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
