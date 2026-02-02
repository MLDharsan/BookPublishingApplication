"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import Image from "next/image";


type BookDetail = {
  id: string;
  title: string;
  description: string | null;
  price_lkr: number;
  allow_download: boolean;
  cover_image_url: string | null;
  pdf_url: string | null;
};

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = getSupabaseBrowserClient();

  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBook() {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setBook(data);
      }

      setLoading(false);
    }

    loadBook();
  }, [id, supabase]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!book) return <p>Book not found</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {book.cover_image_url ? (
          <div className="relative h-64 w-full overflow-hidden rounded-xl">
            <Image
              src={book.cover_image_url}
              alt={book.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-xl bg-muted">
            No cover
          </div>
        )}

        <div className="space-y-3">
          <h1 className="text-3xl font-bold">{book.title}</h1>
          <p className="text-sm text-muted-foreground">
            Price: LKR {book.price_lkr}
          </p>
          <p className="text-sm">
            Access: {book.allow_download ? "Download allowed" : "View only"}
          </p>

          {book.allow_download && book.pdf_url && (
            <a
              href={book.pdf_url}
              target="_blank"
              className="inline-block rounded-md bg-black px-4 py-2 text-sm text-white"
            >
              Download PDF
            </a>
          )}
        </div>
      </div>

      {book.description && (
        <div>
          <h2 className="font-semibold">Description</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {book.description}
          </p>
        </div>
      )}
    </div>
  );
}
