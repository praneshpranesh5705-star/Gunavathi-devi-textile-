"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, Save, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { compressImage, formatBytes } from "@/lib/image";
import { CATEGORIES, type ActionState, type Product } from "@/lib/types";
import { createProductAction, updateProductAction } from "@/app/admin/actions";

/**
 * The product editor.
 *
 * Handles both adding a new product and editing an existing one. The image
 * upload is the interesting part: the file is compressed in the browser, then
 * sent to Supabase Storage, and only the resulting public URL is saved on the
 * product row. The old panel stored a base64 string in localStorage, which
 * filled the ~5 MB quota after two or three photos and threw an uncaught
 * QuotaExceededError.
 */
export default function ProductEditor({
  product,
  onDone,
}: {
  product?: Product;
  onDone: () => void;
}) {
  const isNew = !product;
  const action = isNew ? createProductAction : updateProductAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});

  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  // Close the editor once a save succeeds.
  useEffect(() => {
    if (state.success) {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
  }, [state.success, onDone]);

  async function handleFile(file: File) {
    setUploadError("");
    setUploadNote("");

    const supabase = createClient();
    if (!supabase) {
      setUploadError("Supabase is not configured. See SETUP.md.");
      return;
    }

    setUploading(true);
    try {
      // 1. Shrink it in the browser. A 4 MB phone photo becomes ~200-400 KB.
      const { blob, originalBytes, compressedBytes } = await compressImage(file);

      // 2. Upload to Storage. The path is unique so a new upload never
      //    overwrites an existing photo.
      const ext = blob.type === "image/webp" ? "webp" : "jpg";
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, blob, { contentType: blob.type, upsert: false });

      if (error) throw new Error(error.message);

      // 3. Keep only the public URL on the product row.
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setImageUrl(data.publicUrl);
      setUploadNote(
        `Uploaded — ${formatBytes(originalBytes)} reduced to ${formatBytes(compressedBytes)}.`,
      );
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "The upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-brand/20 shadow-lg p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl">{isNew ? "Add a product" : "Edit product"}</h3>
          <p className="muted text-sm mt-1">
            {isNew
              ? "It appears on the website as soon as you save."
              : "Changes are visible to every visitor immediately."}
          </p>
        </div>
        <button
          type="button"
          onClick={onDone}
          aria-label="Close editor"
          className="p-2 rounded-full hover:bg-black/5 text-deep"
        >
          <X size={20} />
        </button>
      </div>

      <form action={formAction} className="mt-6 grid md:grid-cols-[260px_1fr] gap-7">
        {product && <input type="hidden" name="id" value={product.id} />}
        <input type="hidden" name="imageUrl" value={imageUrl} />

        {/* ---------------------------------------------------------------- */}
        {/* Image                                                            */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <div className="rounded-xl overflow-hidden border border-black/10 bg-cream aspect-square grid place-items-center">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="Product preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center px-4">
                <ImagePlus className="mx-auto text-black/25" size={34} />
                <p className="muted-soft text-xs mt-2">No image yet</p>
              </div>
            )}
          </div>

          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              e.currentTarget.value = "";
            }}
          />

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInput.current?.click()}
            className="mt-3 w-full border border-brand text-brand rounded-xl py-2.5 font-semibold flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={17} className="animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <ImagePlus size={17} /> {imageUrl ? "Replace image" : "Upload image"}
              </>
            )}
          </button>

          {uploadNote && (
            <p className="mt-2 text-xs text-green-800 bg-green-50 border border-green-200 rounded-lg p-2">
              {uploadNote}
            </p>
          )}
          {uploadError && (
            <p className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
              {uploadError}
            </p>
          )}
          <p className="muted-soft text-xs mt-2 leading-5">
            JPG, PNG or WebP. Large photos are resized automatically before upload.
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Fields                                                           */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-deep">
            Product name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={product?.name ?? ""}
            placeholder="e.g. Cotton Name Tape"
            className="w-full mt-2 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
          />

          <div className="grid grid-cols-2 gap-4 mt-5">
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-deep">
                Price
              </label>
              <input
                id="price"
                name="price"
                required
                defaultValue={product?.price ?? ""}
                placeholder="₹120"
                className="w-full mt-2 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label htmlFor="unit" className="block text-sm font-semibold text-deep">
                Unit
              </label>
              <input
                id="unit"
                name="unit"
                defaultValue={product?.unit ?? ""}
                placeholder="per roll"
                className="w-full mt-2 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          <label htmlFor="category" className="block text-sm font-semibold text-deep mt-5">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={product?.category ?? CATEGORIES[0]}
            className="w-full mt-2 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label htmlFor="description" className="block text-sm font-semibold text-deep mt-5">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={product?.description ?? ""}
            placeholder="What is it, and who is it for?"
            className="w-full mt-2 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand min-h-28"
          />

          <label className="flex items-center gap-3 mt-5 cursor-pointer">
            <input
              type="checkbox"
              name="published"
              defaultChecked={product?.published ?? true}
              className="w-5 h-5 accent-[#9B1C31]"
            />
            <span className="text-sm">
              <b>Visible on the website</b>
              <span className="muted block text-xs mt-0.5">
                Uncheck to keep it as a draft that only you can see.
              </span>
            </span>
          </label>

          {state.error && (
            <p className="mt-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {state.error}
            </p>
          )}
          {state.success && (
            <p className="mt-5 text-sm text-green-800 bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              {state.success}
            </p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={pending || uploading}
              className="bg-brand text-white rounded-xl px-6 py-3 font-bold flex items-center gap-2 disabled:opacity-50 hover:bg-deep transition"
            >
              {pending ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
              {pending ? "Saving…" : isNew ? "Add product" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={onDone}
              className="border border-black/10 rounded-xl px-6 py-3 font-semibold text-deep"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
