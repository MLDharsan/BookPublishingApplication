import Link from "next/link";

export default function AuthorDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Author Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Manage your profile and publish books.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/author/profile"
          className="rounded-xl border p-5 hover:bg-muted"
        >
          <h2 className="font-semibold">Author Profile</h2>
          <p className="text-sm text-muted-foreground">
            Edit your name, bio, and profile image.
          </p>
        </Link>

        <Link
          href="/author/upload"
          className="rounded-xl border p-5 hover:bg-muted"
        >
          <h2 className="font-semibold">Upload Book</h2>
          <p className="text-sm text-muted-foreground">
            Publish a new book to the platform.
          </p>
        </Link>
      </div>
    </div>
  );
}
