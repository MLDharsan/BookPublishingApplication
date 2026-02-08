"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminGate } from "@/hooks/useAdminGate";

function TabLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={
        "rounded-md px-3 py-2 text-sm border transition " +
        (active ? "bg-black text-white" : "hover:bg-muted")
      }
    >
      {label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { checking } = useAdminGate();

  if (checking) {
    return (
      <div className="mx-auto max-w-6xl p-6 text-sm text-muted-foreground">
        Authenticating admin...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage authors, books, and payments.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <TabLink href="/admin/authors" label="Authors" />
        <TabLink href="/admin/books" label="Books" />
        <TabLink href="/admin/payments" label="Payments" />
      </div>

      {children}
    </div>
  );
}
