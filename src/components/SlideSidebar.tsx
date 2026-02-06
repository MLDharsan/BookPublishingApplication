"use client";

import Link from "next/link";

export default function SlideSidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <>
      {/* Toggle button (like ChatGPT) */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed left-4 top-4 z-50 rounded-md border bg-white px-3 py-2 text-sm shadow"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Sidebar (push type) */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 border-r bg-white p-4 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 mt-12">
          <h2 className="text-lg font-semibold">Menu</h2>
          <p className="text-xs text-muted-foreground">
            Quick navigation
          </p>
        </div>

        <nav className="space-y-2 text-sm">
          <Link
            href="/"
            className="block rounded-md px-3 py-2 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            🏠 Home
          </Link>

          <Link
            href="/books"
            className="block rounded-md px-3 py-2 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            📚 Browse Books
          </Link>

          <Link
            href="/settings"
            className="block rounded-md px-3 py-2 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            ⚙ Settings
          </Link>

          <Link
            href="/admin"
            className="block rounded-md bg-black px-3 py-2 text-white hover:opacity-90"
            onClick={() => setOpen(false)}
          >
            🛠 Admin Dashboard
          </Link>
        </nav>
      </aside>
    </>
  );
}
