"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useAuthorGate } from "@/hooks/useAuthorGate";

type Book = {
  id: string;
  title: string;
  description: string | null;
  price_lkr: number;
  tags: string[] | null;
  allow_download: boolean;
  cover_image_url: string | null;
  pdf_url: string | null;
  author_id: string;
  is_published: boolean;
};

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export default function EditBookPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const { checking, isAuthor } = useAuthorGate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [tags, setTags] = useState("");
  const [allowDownload, setAllowDownload] = useState(true);

  // optional new files
  const [newCover, setNewCover] = useState<File | null>(null);
  const [newPdf, setNewPdf] = useState<File | null>(null);

  useEffect(() => {
    if (checking) return;
    if (!isAuthor) return;

    let mounted = true;

    async function load() {
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/signin");
        return;
      }

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single<Book>();

      if (!mounted) return;

      if (error || !data) {
        setError(error?.message ?? "Book not found");
        setLoading(false);
        return;
      }

      // Safety: ensure only owner can edit
      if (data.author_id !== user.id) {
        router.replace("/author");
        return;
      }

      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setPrice(data.price_lkr ?? 0);
      setTags((data.tags ?? []).join(", "));
      setAllowDownload(!!data.allow_download);

      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [checking, isAuthor, id, router, supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Upload cover if replaced
      let coverUrl: string | undefined = undefined;
      if (newCover) {
        const path = `${user.id}/${Date.now()}-${safeFileName(newCover.name)}`;
        const { error: upErr } = await supabase.storage
          .from("book-covers")
          .upload(path, newCover, { contentType: newCover.type });

        if (upErr) throw new Error(`Cover upload failed: ${upErr.message}`);

        const { data } = supabase.storage.from("book-covers").getPublicUrl(path);
        coverUrl = data.publicUrl;
      }

      // Upload pdf if replaced
      let pdfUrl: string | undefined = undefined;
      if (newPdf) {
        const path = `${user.id}/${Date.now()}-${safeFileName(newPdf.name)}`;
        const { error: upErr } = await supabase.storage
          .from("book-pdfs")
          .upload(path, newPdf, { contentType: newPdf.type });

        if (upErr) throw new Error(`PDF upload failed: ${upErr.message}`);

        const { data } = supabase.storage.from("book-pdfs").getPublicUrl(path);
        pdfUrl = data.publicUrl;
      }

      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Build update payload (don’t overwrite URLs unless new file uploaded)
      const payload: {
        title: string;
        description: string;
        price_lkr: number;
        tags: string[];
        allow_download: boolean;
        cover_image_url?: string;
        pdf_url?: string;
        } = {
        title: title.trim(),
        description: description.trim(),
        price_lkr: Number(price) || 0,
        tags: tagArray,
        allow_download: allowDownload,
        };


      if (coverUrl) payload.cover_image_url = coverUrl;
      if (pdfUrl) payload.pdf_url = pdfUrl;

      const { error: updateErr } = await supabase
        .from("books")
        .update(payload)
        .eq("id", id);

      if (updateErr) throw new Error(updateErr.message);

      router.push("/author");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (checking) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border p-6 text-sm text-muted-foreground">
        Checking author profile...
      </div>
    );
  }

  if (!isAuthor) return null;

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading book...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Edit Book</h1>
          <p className="text-sm text-muted-foreground">
            Update book details or replace files.
          </p>
        </div>
        <Link href="/author" className="text-sm hover:underline">
          ← Back to dashboard
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-2xl border p-6">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows={4}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="Price (LKR)"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allowDownload}
            onChange={(e) => setAllowDownload(e.target.checked)}
          />
          Allow download after purchase (otherwise view-only)
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium">Replace cover (optional)</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewCover(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Replace PDF (optional)</div>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setNewPdf(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-500 bg-red-50 p-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          disabled={saving}
          className="w-full rounded-md bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
