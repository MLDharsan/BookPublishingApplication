import Link from "next/link";
import { books } from "@/data/books";

function formatLKR(amount: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = books.find((b) => b.id === id);

  if (!book) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-bold">Book not found</h1>
        <Link href="/books" className="text-sm hover:underline">
          Back to books
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link href="/books" className="text-sm text-muted-foreground hover:underline">
          ← Back to books
        </Link>

        <h1 className="text-3xl font-bold">{book.title}</h1>
        <p className="text-sm text-muted-foreground">by {book.authorName}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border px-3 py-1 text-xs">
            {formatLKR(book.priceLKR)}
          </span>
          <span className="rounded-full border px-3 py-1 text-xs">
            {book.allowDownload ? "Download allowed" : "View only"}
          </span>
          {book.tags.map((t) => (
            <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="text-sm text-muted-foreground">{book.description}</p>

          <div className="rounded-xl border p-4">
            <div className="text-sm font-semibold">Preview (UI placeholder)</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Later we’ll render a PDF preview here (view-only mode).
            </p>
          </div>
        </div>

        <aside className="rounded-xl border p-5 space-y-3">
          <h3 className="text-base font-semibold">Buy this book</h3>
          <p className="text-sm text-muted-foreground">
            {book.allowDownload
              ? "After payment, you can download the PDF."
              : "After payment, you can view the book online (no downloads)."}
          </p>

          <button className="w-full rounded-md bg-black px-4 py-2 text-sm text-white hover:opacity-90">
            Buy now
          </button>

          <button className="w-full rounded-md border px-4 py-2 text-sm hover:bg-muted">
            Add to wishlist
          </button>

          <p className="text-xs text-muted-foreground">
            Payment + download/view access will be connected when we build backend.
          </p>
        </aside>
      </div>
    </div>
  );
}
