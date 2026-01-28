import Link from "next/link";
import { books } from "@/data/books";
import BookCard from "@/components/BookCard";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border bg-gradient-to-b from-muted/60 to-background p-8">
        <h1 className="text-3xl font-bold">Publish books. Reach readers.</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          BookVerse lets authors upload books and choose whether readers can
          download or only view after purchase.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/books"
            className="rounded-md bg-black px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Browse books
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
          >
            Become an author
          </Link>
        </div>

        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">Author profile</div>
            <div className="text-muted-foreground">Create your identity.</div>
          </div>
          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">Upload books</div>
            <div className="text-muted-foreground">PDF + details.</div>
          </div>
          <div className="rounded-xl border bg-background p-4">
            <div className="font-semibold">Sell securely</div>
            <div className="text-muted-foreground">Pay → access.</div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold">Trending books</h2>
          <Link href="/books" className="text-sm hover:underline">
            View all
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.slice(0, 3).map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </section>
    </div>
  );
}
