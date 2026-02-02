"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import Image from "next/image";


type Book = {
  id: string;
  title: string;
  price_lkr: number;
  cover_image_url: string | null;
  allow_download: boolean;
};

export default function BooksPage() {
  const supabase = getSupabaseBrowserClient();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBooks() {
      const { data, error } = await supabase
        .from("books")
        .select("id, title, price_lkr, cover_image_url, allow_download")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setBooks(data ?? []);
      }

      setLoading(false);
    }

    loadBooks();
  }, [supabase]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading books...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Books</h1>

      {books.length === 0 ? (
        <p className="text-sm text-muted-foreground">No books published yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="rounded-xl border p-4 hover:bg-muted"
            >
              {book.cover_image_url ? (
                <div className="relative mb-3 h-48 w-full overflow-hidden rounded-md">
                  <Image
                    src={book.cover_image_url}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
              ): (
                <div className="mb-3 flex h-48 items-center justify-center rounded-md bg-muted text-sm">
                  No cover
                </div>
              )}

              <h2 className="font-semibold">{book.title}</h2>

              <div className="mt-2 flex items-center justify-between text-sm">
                <span>LKR {book.price_lkr}</span>
                <span className="text-muted-foreground">
                  {book.allow_download ? "Download" : "View only"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
