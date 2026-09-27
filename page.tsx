import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import ProductCard from "@/components/ProductCard";
import { Product, Category } from "@/lib/types";

// Home page (server component): hero banner + category shortcuts + latest
// products, fetched at request time with the public anon client.
export default async function HomePage() {
  const supabase = createPublicClient();

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return (
    <div>
      <section className="bg-maroon text-cream rounded-lg p-8 md:p-12 text-center mb-10">
        <h1 className="font-serif text-3xl md:text-4xl mb-3">
          Gunavathi Devi Textiles
        </h1>
        <p className="text-cream/90 max-w-xl mx-auto">
          Handpicked sarees, dhotis, fabrics and home textiles — straight
          from Komarapalayam to your home.
        </p>
        <Link
          href="/products"
          className="inline-block mt-6 bg-gold text-maroon-dark font-semibold px-6 py-2 rounded-full hover:bg-gold-light transition-colors"
        >
          Shop All Products
        </Link>
      </section>

      {categories && categories.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif text-xl mb-4">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(categories as Category[]).map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="bg-white border border-gold-light rounded-lg p-4 text-center hover:shadow-md transition-shadow"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-serif text-xl mb-4">New Arrivals</h2>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(products as Product[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-maroon-dark/60">
            No products yet — add some from the admin panel.
          </p>
        )}
      </section>
    </div>
  );
}
