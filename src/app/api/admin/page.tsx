"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
//import { get } from "http";



type AdminBook = {
  id: string;
  title: string;
  price_lkr: number;
  allow_download: boolean;
  is_published: boolean;
  created_at: string;
  author_id: string;
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const getToken = useCallback(async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}, [supabase]);

  useEffect(() => {
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
      if (!me.isAdmin) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      const res = await fetch("/api/admin/books", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setBooks(data.books ?? []);
      setLoading(false);
    }

    init();
  }, [router, getToken]);

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
        <p className="mt-2 text-sm text-muted-foreground">
          You are not an admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Publish/unpublish uploaded books.
        </p>
      </div>

      {msg && (
        <div className="rounded-md border bg-muted p-3 text-sm">
          {msg}
        </div>
      )}

      <div className="rounded-2xl border overflow-hidden">
        <div className="grid grid-cols-5 gap-2 border-b bg-muted px-4 py-3 text-xs font-semibold">
          <div className="col-span-2">Title</div>
          <div>Price</div>
          <div>Status</div>
          <div className="text-right">Action</div>
        </div>

        {books.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No books yet.</div>
        ) : (
          books.map((b) => (
            <div key={b.id} className="grid grid-cols-5 gap-2 px-4 py-3 text-sm border-b">
              <div className="col-span-2 font-medium">{b.title}</div>
              <div>LKR {b.price_lkr}</div>
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
    </div>
  );
}
