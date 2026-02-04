"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function useAuthorGate(options?: { redirectTo?: string }) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const redirectTo = options?.redirectTo ?? "/author/profile";

  const [checking, setChecking] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function run() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        router.replace("/auth/signin");
        return;
      }

      const { data, error } = await supabase
        .from("authors")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        // If something goes wrong, fail safe to profile
        router.replace(redirectTo);
        return;
      }

      if (!data) {
        router.replace(redirectTo);
        return;
      }

      setIsAuthor(true);
      setChecking(false);
    }

    run();

    return () => {
      mounted = false;
    };
  }, [router, supabase, redirectTo]);

  return { checking, isAuthor };
}
