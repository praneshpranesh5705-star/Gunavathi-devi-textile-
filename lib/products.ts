import { createClient, createPublicClient } from "@/lib/supabase/server";
import { toProduct, type Product, type ProductInput, type ProductRow } from "@/lib/types";

/**
 * Every read and write of the catalogue goes through this file.
 *
 * The storefront calls `listPublishedProducts`; the admin calls the rest.
 * Nothing here uses a service-role key — the owner's session plus Row Level
 * Security is what authorises a write.
 */

/**
 * The catalogue for the public storefront: published rows only, in order.
 * Returns an empty array when Supabase is not configured yet, so the page can
 * render its setup notice instead of throwing.
 */
export async function listPublishedProducts(): Promise<Product[]> {
  // Cookie-free: this is called from generateStaticParams() at build time,
  // where `cookies()` would throw. RLS already limits an anonymous caller to
  // published rows, so no session is needed.
  const supabase = createPublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[products] listPublishedProducts failed:", error.message);
    return [];
  }

  return (data as ProductRow[]).map(toProduct);
}

/**
 * The full catalogue for the admin, including unpublished drafts.
 * RLS only returns drafts to a signed-in user, so this is safe to call from
 * anywhere — an anonymous caller simply gets the published rows.
 */
export async function listAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[products] listAllProducts failed:", error.message);
    return [];
  }

  return (data as ProductRow[]).map(toProduct);
}

/** A single published product by its URL slug, for the detail page. */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  // Cookie-free, for the same reason as listPublishedProducts above.
  const supabase = createPublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("[products] getProductBySlug failed:", error.message);
    return null;
  }

  return data ? toProduct(data as ProductRow) : null;
}

/**
 * The next free sort position, so a new product lands at the end of the list
 * rather than at position 0 where it would jump to the front.
 */
export async function nextSortOrder(): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return 1;

  const { data } = await supabase
    .from("products")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const highest = (data as { sort_order: number } | null)?.sort_order ?? 0;
  return highest + 1;
}

/**
 * Make a slug unique by appending -2, -3, ... if it is already taken.
 * `ignoreId` lets an existing product keep its own slug while being edited.
 */
export async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const supabase = await createClient();
  if (!supabase) return base;

  const { data } = await supabase.from("products").select("id, slug");
  const taken = new Set(
    ((data as { id: string; slug: string }[] | null) ?? [])
      .filter((row) => row.id !== ignoreId)
      .map((row) => row.slug),
  );

  if (!taken.has(base)) return base;

  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/** Insert a new product. Returns the created row, or an error message. */
export async function createProduct(
  input: ProductInput,
  slug: string,
): Promise<{ product?: Product; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      slug,
      price: input.price,
      unit: input.unit,
      description: input.description,
      image_url: input.imageUrl,
      category: input.category,
      published: input.published,
      sort_order: await nextSortOrder(),
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { product: toProduct(data as ProductRow) };
}

/** Update an existing product by id. */
export async function updateProduct(
  id: string,
  input: ProductInput,
  slug: string,
): Promise<{ product?: Product; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const { data, error } = await supabase
    .from("products")
    .update({
      name: input.name,
      slug,
      price: input.price,
      unit: input.unit,
      description: input.description,
      image_url: input.imageUrl,
      category: input.category,
      published: input.published,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };
  return { product: toProduct(data as ProductRow) };
}

/** Delete a product by id. */
export async function deleteProduct(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  return {};
}

/** Flip a product between published and draft. */
export async function setPublished(
  id: string,
  published: boolean,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const { error } = await supabase.from("products").update({ published }).eq("id", id);
  if (error) return { error: error.message };
  return {};
}

/**
 * Persist a new ordering.
 *
 * `orderedIds` is the full list of product ids in their new display order.
 * Each row is written with its index as sort_order. This is a handful of small
 * updates rather than one statement, which is fine at this catalogue size and
 * keeps the logic readable.
 */
export async function reorderProducts(orderedIds: string[]): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("products").update({ sort_order: index + 1 }).eq("id", id),
    ),
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };
  return {};
}
