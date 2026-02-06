"use client";

import { useState } from "react";
import SlideSidebar from "@/components/SlideSidebar";

export default function SidebarShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      <SlideSidebar open={open} setOpen={setOpen} />

      {/* Content wrapper gets pushed */}
      <div
        className={`transition-all duration-300 ${
          open ? "ml-64" : "ml-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
