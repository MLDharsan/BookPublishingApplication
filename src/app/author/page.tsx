"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useAuthorGate } from "@/hooks/useAuthorGate";

type MyBook = {
  id: string;
  title: string;
  price_lkr: number;
  allow_download: boolean;
  is_published: boolean;
  created_at: string;
  cover_image_url: string | null;
};

function formatLKR(amount: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatusPill({ published }: { published: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-3 py-1 text-xs border " +
        (published
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-orange-50 text-orange-700 border-orange-200")
      }
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

export default function AuthorDashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const { checking, isAuthor } = useAuthorGate();

  const [books, setBooks] = useState<MyBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (checking) return;
    if (!isAuthor) return;

    let mounted = true;

    async function loadMyBooks() {
      setError(null);
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/signin");
        return;
      }

      const { data, error } = await supabase
        .from("books")
        .select(
          "id, title, price_lkr, allow_download, is_published, created_at, cover_image_url"
        )
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        setError(error.message);
        setBooks([]);
      } else {
        setBooks((data ?? []) as MyBook[]);
      }

      setLoading(false);
    }

    loadMyBooks();

    return () => {
      mounted = false;
    };
  }, [checking, isAuthor, router, supabase]);

  if (checking) {
    return (
      <div className="mx-auto max-w-5xl rounded-xl border p-6 text-sm text-muted-foreground">
        Checking author profile...
      </div>
    );
  }

  if (!isAuthor) return null;

  const total = books.length;
  const publishedCount = books.filter((b) => b.is_published).length;
  const draftCount = total - publishedCount;


  async function handleDelete(bookId: string) {
  setError(null);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    router.replace("/auth/signin");
    return;
  }

  const { error } = await supabase.from("books").delete().eq("id", bookId);

  if (error) {
    setError(error.message);
    return;
  }

  // remove from UI immediately
  setBooks((prev) => prev.filter((b) => b.id !== bookId));
}


  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Author Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage your books and publishing status.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/author/upload"
            className="rounded-md bg-black px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Upload new book
          </Link>

          <Link
            href="/author/profile"
            className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
          >
            Edit profile
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-muted-foreground">Total books</div>
          <div className="mt-1 text-2xl font-bold">{total}</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-muted-foreground">Published</div>
          <div className="mt-1 text-2xl font-bold">{publishedCount}</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-muted-foreground">Drafts</div>
          <div className="mt-1 text-2xl font-bold">{draftCount}</div>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl border">
        <div className="flex items-center justify-between border-b bg-muted px-4 py-3">
          <div className="text-sm font-semibold">My books</div>
          <Link href="/books" className="text-sm hover:underline">
            View public store →
          </Link>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : books.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            You haven’t uploaded any books yet.
            <div className="mt-3">
              <Link
                href="/author/upload"
                className="inline-block rounded-md bg-black px-4 py-2 text-sm text-white hover:opacity-90"
              >
                Upload your first book
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {books.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center gap-3 px-4 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate font-semibold">{b.title}</div>
                    <StatusPill published={b.is_published} />
                    <span className="text-xs text-muted-foreground">
                      {b.allow_download ? "Download" : "View only"}
                    </span>
                  </div>

                  <div className="mt-1 text-sm text-muted-foreground">
                    {formatLKR(b.price_lkr)} • Uploaded{" "}
                    {new Date(b.created_at).toLocaleDateString()}
                  </div>
                </div>

                  <div className="flex gap-2">
                      <Link
                        href={`/books/${b.id}`}
                        className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
                      >
                        View
                      </Link>

                      <Link
                        href={`/author/books/${b.id}/edit`}
                        className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => {
                          const ok = confirm(`Delete "${b.title}"? This cannot be undone.`);
                          if (!ok) return;
                          // we'll wire delete function below
                          handleDelete(b.id);
                        }}
                        className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>

              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        Tip: Draft books are visible only to you. Admin must publish them before
        they appear publicly.
      </div>
    </div>
  );
}
