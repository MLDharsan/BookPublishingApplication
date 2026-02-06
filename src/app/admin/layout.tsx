"use client";

import Link from "next/link";
import { useAdminGate } from "@/hooks/useAdminGate";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { checking } = useAdminGate();

  if (checking) return <p>Authenticating admin...</p>;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Link href="/admin/authors" className="px-3 py-2 text-sm">
          Authors
        </Link>
        <Link href="/admin/books" className="px-3 py-2 text-sm">
          Books
        </Link>
        <Link href="/admin/payments" className="px-3 py-2 text-sm">
          Payments
        </Link>
      </div>

      {children}
    </div>
  );
}
