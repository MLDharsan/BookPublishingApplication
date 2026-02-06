"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function useAdminGate() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        router.replace("/admin/signin");
        return;
      }

      const res = await fetch("/api/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!json.isAdmin) {
        router.replace("/");
        return;
      }

      setChecking(false);
    }

    check();
  }, [router, supabase]);

  return { checking };
}
