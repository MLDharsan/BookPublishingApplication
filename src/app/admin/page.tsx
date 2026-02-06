"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

type AdminAuthor = {
  id: string;
  full_name: string;
  bio: string | null;
  profile_image_url: string | null;
  created_at: string;
  books_count: number;
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [tab, setTab] = useState<"books" | "authors">("books");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const [books, setBooks] = useState<AdminBook[]>([]);
  const [authors, setAuthors] = useState<AdminAuthor[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const getToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, [supabase]);

  const loadBooks = useCallback(async () => {
    const token = await getToken();
    if (!token) return;

    const res = await fetch("/api/admin/books", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) setBooks(data.books ?? []);
    else setMsg(data.error ?? "Failed to load books");
  }, [getToken]);

  const loadAuthors = useCallback(async () => {
    const token = await getToken();
    if (!token) return;

    const res = await fetch("/api/admin/authors", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) setAuthors(data.authors ?? []);
    else setMsg(data.error ?? "Failed to load authors");
  }, [getToken]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const token = await getToken();
      if (!token) {
        router.replace("/auth/signin");
        return;
      }

      const meRes = await fetch("/api/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const me = await meRes.json();
      if (!mounted) return;

      if (!me.isAdmin) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      await loadBooks();
      await loadAuthors();

      if (!mounted) return;
      setLoading(false);
    }

    init();

    return () => {
      mounted = false;
    };
  }, [getToken, loadAuthors, loadBooks, router]);

  async function togglePublish(bookId: string, nextPublish: boolean) {
    setMsg(null);
    const token = await getToken();
    if (!token) return;

    const res = await fetch("/api/admin/books/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookId, publish: nextPublish }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Failed");
      return;
    }

    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, is_published: nextPublish } : b))
    );

    setMsg(nextPublish ? "Book published ✅" : "Book unpublished ✅");
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading admin...</div>;

  if (isAdmin === false) {
    return (
      <div className="rounded-xl border p-6">
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">You are not an admin.</p>
      </div>
    );
  }

  const totalBooks = books.length;
  const publishedBooks = books.filter((b) => b.is_published).length;
  const totalAuthors = authors.length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage books and authors (publish workflow).
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Pill>Total books: {totalBooks}</Pill>
          <Pill>Published: {publishedBooks}</Pill>
          <Pill>Authors: {totalAuthors}</Pill>
        </div>
      </div>

      {msg && <div className="rounded-md border bg-muted p-3 text-sm">{msg}</div>}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("books")}
          className={
            "rounded-md border px-4 py-2 text-sm " +
            (tab === "books" ? "bg-black text-white" : "hover:bg-muted")
          }
        >
          Books
        </button>
        <button
          onClick={() => setTab("authors")}
          className={
            "rounded-md border px-4 py-2 text-sm " +
            (tab === "authors" ? "bg-black text-white" : "hover:bg-muted")
          }
        >
          Authors
        </button>
      </div>

      {/* BOOKS TAB */}
      {tab === "books" && (
        <div className="rounded-2xl border overflow-hidden">
          <div className="grid grid-cols-6 gap-2 border-b bg-muted px-4 py-3 text-xs font-semibold">
            <div className="col-span-2">Title</div>
            <div>Price</div>
            <div>Access</div>
            <div>Status</div>
            <div className="text-right">Action</div>
          </div>

          {books.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No books yet.</div>
          ) : (
            books.map((b) => (
              <div key={b.id} className="grid grid-cols-6 gap-2 px-4 py-3 text-sm border-b">
                <div className="col-span-2 font-medium">{b.title}</div>
                <div>LKR {b.price_lkr}</div>
                <div className="text-muted-foreground">
                  {b.allow_download ? "Download" : "View only"}
                </div>
                <div className={b.is_published ? "text-green-700" : "text-orange-700"}>
                  {b.is_published ? "Published" : "Draft"}
                </div>
                <div className="text-right">
                  <button
                    onClick={() => togglePublish(b.id, !b.is_published)}
                    className="rounded-md border px-3 py-1.5 hover:bg-muted"
                  >
                    {b.is_published ? "Unpublish" : "Publish"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* AUTHORS TAB */}
      {tab === "authors" && (
        <div className="rounded-2xl border overflow-hidden">
          <div className="grid grid-cols-6 gap-2 border-b bg-muted px-4 py-3 text-xs font-semibold">
            <div className="col-span-2">Author</div>
            <div className="col-span-2">Bio</div>
            <div>Books</div>
            <div>Joined</div>
          </div>

          {authors.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No authors yet.</div>
          ) : (
            authors.map((a) => (
              <div key={a.id} className="grid grid-cols-6 gap-2 px-4 py-3 text-sm border-b">
                <div className="col-span-2">
                  <div className="font-medium">{a.full_name}</div>
                  <div className="text-xs text-muted-foreground">{a.id}</div>
                </div>
                <div className="col-span-2 text-muted-foreground">
                  {a.bio ? a.bio.slice(0, 80) : "—"}
                </div>
                <div>{a.books_count}</div>
                <div className="text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
