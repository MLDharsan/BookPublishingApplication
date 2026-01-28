import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">BookPeradise</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          <Link href="/books" className="text-muted-foreground hover:text-foreground">
            Browse Books
          </Link>
          <Link href="/auth/signin" className="text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-md bg-black px-3 py-2 text-white hover:opacity-90"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
