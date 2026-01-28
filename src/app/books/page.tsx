"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import BookCard from "@/components/BookCard";
import { books as allBooks } from "@/data/books";

type ModeFilter = "all" | "download" | "view";
type SortBy = "newest" | "price_asc" | "price_desc" | "title_asc";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function setParam(
  params: URLSearchParams,
  key: string,
  value: string | null
) {
  if (!value || value.length === 0) params.delete(key);
  else params.set(key, value);
}

export default function BooksPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read from URL
  const q = searchParams.get("q") ?? "";
  const mode = (searchParams.get("mode") as ModeFilter) ?? "all";
  const sort = (searchParams.get("sort") as SortBy) ?? "newest";

  // Local input state (so typing feels smooth)
  const [query, setQuery] = useState(q);

  const filtered = useMemo(() => {
    const nq = normalize(q);

    let items = [...allBooks];

    // Search
    if (nq) {
      items = items.filter((b) => {
        const haystack = normalize(
          `${b.title} ${b.authorName} ${b.tags.join(" ")}`
        );
        return haystack.includes(nq);
      });
    }

    // Filter mode
    if (mode === "download") items = items.filter((b) => b.allowDownload);
    if (mode === "view") items = items.filter((b) => !b.allowDownload);

    // Sort
    items.sort((a, b) => {
      if (sort === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      if (sort === "price_asc") return a.priceLKR - b.priceLKR;
      if (sort === "price_desc") return b.priceLKR - a.priceLKR;
      if (sort === "title_asc") return a.title.localeCompare(b.title);
      return 0;
    });

    return items;
  }, [q, mode, sort]);

  function applyURL(next: { q?: string; mode?: ModeFilter; sort?: SortBy }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.q !== undefined) setParam(params, "q", next.q.trim());
    if (next.mode !== undefined) setParam(params, "mode", next.mode);
    if (next.sort !== undefined) setParam(params, "sort", next.sort);

    const url = `${pathname}?${params.toString()}`;
    router.push(url);
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyURL({ q: query });
  }

  function clearAll() {
    setQuery("");
    router.push(pathname);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse Books</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search by title, author, or tags. Filter by download/view-only and
          sort by price or newest.
        </p>
      </div>

      {/* Controls */}
      <div className="rounded-xl border p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <form onSubmit={onSearchSubmit} className="flex w-full gap-2 lg:max-w-xl">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search: title, author, tags..."
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
            />
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm text-white hover:opacity-90"
            >
              Search
            </button>
          </form>

          {/* Filters */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={mode}
              onChange={(e) => applyURL({ mode: e.target.value as ModeFilter })}
              className="rounded-md border px-3 py-2 text-sm"
              aria-label="Mode filter"
            >
              <option value="all">All books</option>
              <option value="download">Download allowed</option>
              <option value="view">View only</option>
            </select>

            <select
              value={sort}
              onChange={(e) => applyURL({ sort: e.target.value as SortBy })}
              className="rounded-md border px-3 py-2 text-sm"
              aria-label="Sort"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="title_asc">Title: A → Z</option>
            </select>

            <button
              type="button"
              onClick={clearAll}
              className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Results summary */}
        <div className="mt-3 text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filtered.length}</span>{" "}
          result(s)
          {q ? (
            <>
              {" "}
              for <span className="font-medium text-foreground">“{q}”</span>
            </>
          ) : null}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <div className="text-lg font-semibold">No books found</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search or clear filters.
          </p>
          <button
            onClick={clearAll}
            className="mt-4 rounded-md bg-black px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      )}
    </div>
  );
}
