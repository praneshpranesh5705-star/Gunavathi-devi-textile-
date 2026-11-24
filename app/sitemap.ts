import type { MetadataRoute } from "next";
import { listPublishedProducts } from "@/lib/products";

/**
 * The sitemap.
 *
 * Generated from the live catalogue, so a product the owner adds is
 * discoverable by search engines without anyone editing a file.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const products = await listPublishedProducts();

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
