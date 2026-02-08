"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type AdminBook = {
  id: string;
  title: string;
  price_lkr: number;
  allow_download: boolean;
  is_published: boolean;
  created_at: string;
  author_id: string;
};

export default function AdminBooksPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [books, setBooks] = useState<AdminBook[]>([]);

  const getToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, [supabase]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = await getToken();
    if (!token) {
      setError("No session. Please sign in as admin.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/admin/books", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Failed to load books");
      setBooks([]);
      setLoading(false);
      return;
    }

    setBooks(json.books ?? []);
    setLoading(false);
  }, [getToken]);

  useEffect(() => {
  let mounted = true;

  async function init() {
    setLoading(true);
    setError(null);

    const token = await getToken();
    if (!token) {
      if (mounted) {
        setError("No session. Please sign in as admin.");
        setLoading(false);
      }
      return;
    }

    const res = await fetch("/api/admin/books", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();

    if (!mounted) return;

    if (!res.ok) {
      setError(json.error ?? "Failed to load books");
      setBooks([]);
    } else {
      setBooks(json.books ?? []);
    }

    setLoading(false);
  }

  init();

  return () => {
    mounted = false;
  };
}, [getToken]);


  async function togglePublish(book: AdminBook) {
    setMsg(null);
    setError(null);
    setBusyId(book.id);

    const token = await getToken();
    if (!token) {
      setError("No session. Please sign in as admin.");
      setBusyId(null);
      return;
    }

    const res = await fetch("/api/admin/books/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookId: book.id, publish: !book.is_published }),
    });

    const json = await res.json();
    setBusyId(null);

    if (!res.ok) {
      setError(json.error ?? "Failed to update publish status");
      return;
    }

    setBooks((prev) =>
      prev.map((b) =>
        b.id === book.id ? { ...b, is_published: !b.is_published } : b
      )
    );

    setMsg(!book.is_published ? "Book published ✅" : "Book unpublished ✅");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Books</h2>
          <p className="text-sm text-muted-foreground">
            Publish/unpublish books uploaded by authors.
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
        >
          Refresh
        </button>
      </div>

      {msg && <div className="rounded-xl border bg-muted p-3 text-sm">{msg}</div>}

      {error && (
        <div className="rounded-xl border border-red-500 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border p-6 text-sm text-muted-foreground">Loading...</div>
      ) : (
        <div className="rounded-2xl border overflow-hidden">
          <div className="grid grid-cols-7 gap-2 border-b bg-muted px-4 py-3 text-xs font-semibold">
            <div className="col-span-2">Title</div>
            <div>Price</div>
            <div>Access</div>
            <div>Status</div>
            <div className="col-span-2">Author</div>
          </div>

          {books.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No books found.</div>
          ) : (
            books.map((b) => (
              <div key={b.id} className="grid grid-cols-7 gap-2 px-4 py-3 text-sm border-b">
                <div className="col-span-2 font-medium">{b.title}</div>
                <div>LKR {b.price_lkr}</div>
                <div className="text-muted-foreground">
                  {b.allow_download ? "Download" : "View only"}
                </div>

                <div className={b.is_published ? "text-green-700" : "text-orange-700"}>
                  {b.is_published ? "Published" : "Draft"}
                </div>

                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground truncate">
                    {b.author_id}
                  </div>
                </div>

                <div className="text-right">
                  <button
                    disabled={busyId === b.id}
                    onClick={() => togglePublish(b)}
                    className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-60"
                  >
                    {busyId === b.id
                      ? "Updating..."
                      : b.is_published
                      ? "Unpublish"
                      : "Publish"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
