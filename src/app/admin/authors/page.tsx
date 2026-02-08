"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type AdminAuthor = {
  id: string;
  full_name: string;
  bio: string | null;
  profile_image_url: string | null;
  created_at: string;
  books_count: number;
};

export default function AdminAuthorsPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authors, setAuthors] = useState<AdminAuthor[]>([]);
  const [selected, setSelected] = useState<AdminAuthor | null>(null);

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

    const res = await fetch("/api/admin/authors", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Failed to load authors");
      setAuthors([]);
      setLoading(false);
      return;
    }

    setAuthors(json.authors ?? []);
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

    const res = await fetch("/api/admin/authors", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();

    if (!mounted) return;

    if (!res.ok) {
      setError(json.error ?? "Failed to load authors");
      setAuthors([]);
    } else {
      setAuthors(json.books ?? []);
    }

    setLoading(false);
  }

  init();

  return () => {
    mounted = false;
  };
}, [getToken]);


  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Authors</h2>
          <p className="text-sm text-muted-foreground">
            View author profiles and how many books they uploaded.
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border p-6 text-sm text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* List */}
          <div className="lg:col-span-2 rounded-2xl border overflow-hidden">
            <div className="grid grid-cols-6 gap-2 border-b bg-muted px-4 py-3 text-xs font-semibold">
              <div className="col-span-2">Name</div>
              <div className="col-span-2">Bio</div>
              <div>Books</div>
              <div>Joined</div>
            </div>

            {authors.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No authors found.</div>
            ) : (
              authors.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="w-full text-left grid grid-cols-6 gap-2 px-4 py-3 text-sm border-b hover:bg-muted/50"
                >
                  <div className="col-span-2">
                    <div className="font-medium">{a.full_name}</div>
                    <div className="text-xs text-muted-foreground truncate">{a.id}</div>
                  </div>

                  <div className="col-span-2 text-muted-foreground">
                    {a.bio ? a.bio.slice(0, 60) : "—"}
                  </div>

                  <div>{a.books_count}</div>

                  <div className="text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Details */}
          <div className="rounded-2xl border p-4">
            <h3 className="font-semibold">Author details</h3>
            {!selected ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Click an author from the list to view details.
              </p>
            ) : (
              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Full name</div>
                  <div className="font-medium">{selected.full_name}</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Bio</div>
                  <div className="text-muted-foreground">
                    {selected.bio ?? "—"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Books uploaded</div>
                  <div className="font-medium">{selected.books_count}</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Author ID</div>
                  <div className="break-all text-muted-foreground">{selected.id}</div>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="mt-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
