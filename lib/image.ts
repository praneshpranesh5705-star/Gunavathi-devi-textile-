/**
 * Client-side image compression.
 *
 * The old admin panel read the file straight into a base64 string and pushed
 * it into localStorage, which blew the ~5 MB quota after two or three photos
 * and threw an uncaught QuotaExceededError. Now the file goes to Supabase
 * Storage instead, but we still shrink it first: a 4 MB phone photo becomes
 * roughly 200-400 KB, which uploads quickly on a mobile connection and keeps
 * the bucket small.
 *
 * Runs entirely in the browser. Nothing is sent anywhere until the caller
 * uploads the returned Blob.
 */

export type CompressResult = {
  blob: Blob;
  width: number;
  height: number;
  originalBytes: number;
  compressedBytes: number;
};

const MAX_EDGE = 1600; // longest side, in pixels
const QUALITY = 0.82; // WebP/JPEG quality

export async function compressImage(file: File): Promise<CompressResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (JPG, PNG or WebP).");
  }

  const bitmap = await loadBitmap(file);

  // Scale down so the longest edge is at most MAX_EDGE. Never scale up.
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser could not process the image.");

  ctx.drawImage(bitmap, 0, 0, width, height);
  if ("close" in bitmap) bitmap.close();

  // Prefer WebP — smaller at the same quality, and supported everywhere that
  // matters. Fall back to JPEG if the browser cannot encode it.
  let blob = await toBlob(canvas, "image/webp", QUALITY);
  if (!blob) blob = await toBlob(canvas, "image/jpeg", QUALITY);
  if (!blob) throw new Error("This browser could not compress the image.");

  return {
    blob,
    width,
    height,
    originalBytes: file.size,
    compressedBytes: blob.size,
  };
}

/** Decode the file, preferring the fast createImageBitmap path. */
async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // Some browsers refuse certain formats here; fall through to <img>.
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That image could not be read. Try a different file."));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Human-readable file size, for the upload feedback line. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
