// Shared types for the Gunavathi Tex catalogue.

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: string;
  unit: string;
  description: string;
  imageUrl: string;
  category: string;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

/** The shape of a row as it comes back from Postgres (snake_case). */
export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: string;
  unit: string;
  description: string;
  image_url: string;
  category: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

/** Fields the owner can edit. Everything else is managed by the database. */
export type ProductInput = {
  name: string;
  price: string;
  unit: string;
  description: string;
  imageUrl: string;
  category: string;
  published: boolean;
};

/**
 * The result every admin Server Action returns.
 *
 * Lives here rather than in `app/admin/actions.ts` because a "use server"
 * module may only export async functions — a type export there is a build
 * error waiting to happen.
 */
export type ActionState = { error?: string; success?: string };

/** The categories offered in the admin editor. */
export const CATEGORIES = [
  "Name Tape & Name Rope",
  "Design Tape",
  "Textile Labels",
  "Other",
] as const;

/** Convert a database row into the camelCase shape the UI uses. */
export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: row.price,
    unit: row.unit,
    description: row.description,
    imageUrl: row.image_url,
    category: row.category,
    sortOrder: row.sort_order,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Turn a product name into a URL-safe slug.
 * "Custom Printed Name Tape" -> "custom-printed-name-tape"
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** The WhatsApp number and message builder, shared by every CTA on the site. */
export const WHATSAPP_NUMBER = "918610732094";

export function whatsappLink(product?: string): string {
  const text = product
    ? `Hello Gunavathi Tex, I would like to enquire about ${product}.`
    : "Hello Gunavathi Tex, I would like to know about your name tape and name rope textiles.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
