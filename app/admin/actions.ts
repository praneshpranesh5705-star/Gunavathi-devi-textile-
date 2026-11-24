"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createProduct,
  deleteProduct,
  reorderProducts,
  setPublished,
  uniqueSlug,
  updateProduct,
} from "@/lib/products";
import { slugify, type ActionState, type ProductInput } from "@/lib/types";

/**
 * Every write in the admin panel goes through a Server Action in this file.
 *
 * Two reasons this matters:
 *   1. The database call happens on the server, so the browser never holds a
 *      privileged key. The owner's session cookie is what authorises it.
 *   2. Row Level Security is the real gate. Even if someone crafted a request
 *      to these actions while signed out, Postgres would refuse the write.
 *
 * Each action revalidates the storefront paths so the change is visible on the
 * very next page load, with no redeploy.
 */

/** Confirm the caller is signed in before touching anything. */
async function requireUser() {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You are not signed in. Please sign in again." };
  return { supabase };
}

/** Refresh every page that shows the catalogue. */
function revalidateCatalogue() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/products/[slug]", "page");
}

/** Read and trim the editable fields out of a submitted form. */
function readInput(formData: FormData): ProductInput {
  return {
    name: String(formData.get("name") ?? "").trim(),
    price: String(formData.get("price") ?? "").trim(),
    unit: String(formData.get("unit") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    imageUrl: String(formData.get("imageUrl") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim() || "Name Tape & Name Rope",
    published: formData.get("published") === "on" || formData.get("published") === "true",
  };
}

/** Validate the fields that must not be empty. */
function validate(input: ProductInput): string | null {
  if (!input.name) return "Product name is required.";
  if (input.name.length > 120) return "Product name is too long (120 characters maximum).";
  if (!input.price) return "Price is required.";
  if (!input.imageUrl) return "Please upload a product image.";
  return null;
}

/** Create a new product. */
export async function createProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireUser();
  if ("error" in auth) return { error: auth.error };

  const input = readInput(formData);
  const problem = validate(input);
  if (problem) return { error: problem };

  const slug = await uniqueSlug(slugify(input.name) || "product");
  const { error } = await createProduct(input, slug);
  if (error) return { error: `Could not save: ${error}` };

  revalidateCatalogue();
  return { success: `“${input.name}” was added to the catalogue.` };
}

/** Update an existing product. */
export async function updateProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireUser();
  if ("error" in auth) return { error: auth.error };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing product id." };

  const input = readInput(formData);
  const problem = validate(input);
  if (problem) return { error: problem };

  const slug = await uniqueSlug(slugify(input.name) || "product", id);
  const { error } = await updateProduct(id, input, slug);
  if (error) return { error: `Could not save: ${error}` };

  revalidateCatalogue();
  return { success: `“${input.name}” was updated.` };
}

/** Delete a product. */
export async function deleteProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireUser();
  if ("error" in auth) return { error: auth.error };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "this product");
  if (!id) return { error: "Missing product id." };

  const { error } = await deleteProduct(id);
  if (error) return { error: `Could not delete: ${error}` };

  revalidateCatalogue();
  return { success: `“${name}” was deleted.` };
}

/** Show or hide a product on the storefront. */
export async function togglePublishedAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireUser();
  if ("error" in auth) return { error: auth.error };

  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("published") ?? "") === "true";
  if (!id) return { error: "Missing product id." };

  const { error } = await setPublished(id, next);
  if (error) return { error: `Could not update: ${error}` };

  revalidateCatalogue();
  return { success: next ? "Product is now visible on the site." : "Product is now hidden." };
}

/** Move a product up or down in the display order. */
export async function moveProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await requireUser();
  if ("error" in auth) return { error: auth.error };

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  const orderedIds = String(formData.get("orderedIds") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!id || orderedIds.length === 0) return { error: "Missing product order." };

  const index = orderedIds.indexOf(id);
  if (index === -1) return { error: "Product not found in the current order." };

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= orderedIds.length) return {}; // already at the end

  const next = [...orderedIds];
  [next[index], next[target]] = [next[target], next[index]];

  const { error } = await reorderProducts(next);
  if (error) return { error: `Could not reorder: ${error}` };

  revalidateCatalogue();
  return { success: "Order updated." };
}

/** Sign the owner out and return to the login page. */
export async function signOutAction() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}
