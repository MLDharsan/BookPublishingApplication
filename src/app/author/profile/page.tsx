"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

type AuthorRow = {
  id: string;
  full_name: string;
  bio: string | null;
  profile_image_url: string | null;
};

export default function AuthorProfilePage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      setError(null);

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (userErr || !user) {
        router.push("/auth/signin");
        return;
      }

      // Use maybeSingle so it doesn't throw when row doesn't exist yet
      const { data, error: fetchErr } = await supabase
        .from("authors")
        .select("id, full_name, bio, profile_image_url")
        .eq("id", user.id)
        .maybeSingle<AuthorRow>();

      if (!mounted) return;

      if (fetchErr) {
        // If RLS blocks select, you'll see it here. But usually select policy is ok.
        setError(fetchErr.message);
      } else if (data) {
        setFullName(data.full_name ?? "");
        setBio(data.bio ?? "");
      }

      setInitialLoading(false);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr || !user) {
        throw new Error("Not authenticated. Please sign in again.");
      }

      // 1) Upload image if selected
      let uploadedImageUrl: string | null = null;

      if (imageFile) {
        const filePath = `${user.id}/${Date.now()}-${safeFileName(imageFile.name)}`;

        const { error: uploadError } = await supabase.storage
          .from("author-images")
          .upload(filePath, imageFile, {
            contentType: imageFile.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from("author-images")
          .getPublicUrl(filePath);

        uploadedImageUrl = urlData.publicUrl;
      }

      // 2) Build payload (do NOT overwrite image with null)
      const payload: {
        id: string;
        full_name: string;
        bio: string;
        profile_image_url?: string;
      } = {
        id: user.id,
        full_name: fullName.trim(),
        bio: bio.trim(),
      };

      if (uploadedImageUrl) {
        payload.profile_image_url = uploadedImageUrl;
      }

      // 3) Upsert (insert if new, update if exists)
      const { error: saveError } = await supabase.from("authors").upsert(payload);

      if (saveError) {
        // This is the error you're seeing when RLS isn't set right
        throw new Error(saveError.message);
      }

      router.push("/author/upload");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-xl border p-6 text-sm text-muted-foreground">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Author Profile</h1>
        <p className="text-sm text-muted-foreground">
          Create your author identity before publishing books.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-xl border p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full name</label>
          <input
            required
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Bio</label>
          <textarea
            placeholder="Short bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Profile image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-500 bg-red-50 p-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          disabled={loading}
          className="w-full rounded-md bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}
