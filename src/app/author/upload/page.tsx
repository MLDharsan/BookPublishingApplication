"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";

function parseTags(input: string) {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export default function AuthorUploadPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceLKR, setPriceLKR] = useState<number>(0);
  const [tags, setTags] = useState("");
  const [allowDownload, setAllowDownload] = useState(false);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!pdfFile) {
      setError("Please select a PDF file.");
      return;
    }

    setLoading(true);

    try {
      // 1) Ensure logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/signin");
        return;
      }

      // 2) Upload cover (optional) to Supabase Storage
      let coverUrl: string | null = null;

      if (coverFile) {
        const coverPath = `${user.id}/${Date.now()}-${safeFileName(coverFile.name)}`;

        const { error: coverErr } = await supabase.storage
          .from("book-covers")
          .upload(coverPath, coverFile, { contentType: coverFile.type });

        if (coverErr) throw new Error(`Cover upload failed: ${coverErr.message}`);

        const { data } = supabase.storage.from("book-covers").getPublicUrl(coverPath);
        coverUrl = data.publicUrl;
      }

      // 3) Upload PDF to Supabase Storage (required)
      const pdfPath = `${user.id}/${Date.now()}-${safeFileName(pdfFile.name)}`;

      const { error: pdfErr } = await supabase.storage
        .from("book-pdfs")
        .upload(pdfPath, pdfFile, { contentType: "application/pdf" });

      if (pdfErr) throw new Error(`PDF upload failed: ${pdfErr.message}`);

      // Since bucket is public (for now)
      const { data: pdfPublic } = supabase.storage.from("book-pdfs").getPublicUrl(pdfPath);
      const pdfUrl = pdfPublic.publicUrl;

      // 4) Insert book metadata into Supabase DB
      const tagsArray = parseTags(tags);

      const { error: insertErr } = await supabase.from("books").insert({
        author_id: user.id,
        title,
        description,
        price_lkr: priceLKR,
        tags: tagsArray,
        allow_download: allowDownload,
        cover_image_url: coverUrl,
        pdf_path: pdfPath,
        pdf_url: pdfUrl,
      });

      if (insertErr) throw new Error(insertErr.message);

      router.push("/books");
    } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError("Something went wrong");
  }
    }finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Upload a Book</h1>
      <p className="text-sm text-muted-foreground">
        Upload your cover (optional) and PDF (required). For now PDFs are stored in Supabase Storage.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border p-5">
        <input
          required
          placeholder="Book title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
          rows={4}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="number"
            min={0}
            required
            placeholder="Price (LKR)"
            value={Number.isFinite(priceLKR) ? priceLKR : 0}
            onChange={(e) => setPriceLKR(parseInt(e.target.value || "0", 10))}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />

          <input
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
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

        <div className="space-y-2">
          <div className="text-sm font-medium">Cover image (optional)</div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Book PDF (required)</div>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
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
          {loading ? "Uploading..." : "Publish book"}
        </button>
      </form>
    </div>
  );
}
