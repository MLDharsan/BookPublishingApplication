import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="rounded-2xl border p-6">
      <h2 className="text-lg font-semibold">Welcome</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose a tab to start managing the platform.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link className="rounded-md border px-3 py-2 text-sm hover:bg-muted" href="/admin/authors">
          Go to Authors
        </Link>
        <Link className="rounded-md border px-3 py-2 text-sm hover:bg-muted" href="/admin/books">
          Go to Books
        </Link>
        <Link className="rounded-md border px-3 py-2 text-sm hover:bg-muted" href="/admin/payments">
          Go to Payments
        </Link>
      </div>
    </div>
  );
}
