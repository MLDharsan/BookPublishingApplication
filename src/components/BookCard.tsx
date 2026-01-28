import Link from "next/link";
import { Book } from "@/data/books";

function formatLKR(amount: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function BookCard({ book }: { book: Book }) {
  return (
    <div className="rounded-xl border p-5 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{book.title}</h3>
          <p className="text-sm text-muted-foreground">by {book.authorName}</p>
        </div>

        <span className="rounded-full border px-3 py-1 text-xs">
          {formatLKR(book.priceLKR)}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
        {book.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {book.tags.map((t) => (
          <span key={t} className="rounded-md bg-muted px-2 py-1 text-xs">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {book.allowDownload ? "Download allowed" : "View only"}
        </span>

        <Link
          href={`/books/${book.id}`}
          className="rounded-md bg-black px-3 py-2 text-xs text-white hover:opacity-90"
        >
          View details
        </Link>
      </div>
    </div>
  );
}
