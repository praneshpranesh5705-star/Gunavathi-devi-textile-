import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { getProductBySlug, listPublishedProducts } from "@/lib/products";
import { whatsappLink } from "@/lib/types";

/**
 * Product detail page.
 *
 * Statically generated per product at build time, and revalidated every five
 * minutes so an owner's edit appears without a redeploy. Each product gets a
 * shareable URL, which the WhatsApp-first flow needs — the owner can send a
 * customer a direct link to the exact product.
 */
export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await listPublishedProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <main>
      <SiteHeader />

      <div className="max-w-7xl mx-auto px-5 py-10 md:py-16">
        <a
          href="/#collections"
          className="inline-flex items-center gap-2 text-sm font-semibold muted hover:text-brand"
        >
          <ArrowLeft size={16} /> Back to collection
        </a>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 mt-8 items-start">
          <div className="rounded-[2rem] overflow-hidden border border-black/5 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-[320px] md:h-[520px] object-cover"
            />
          </div>

          <div>
            <p className="text-brand uppercase tracking-[.2em] text-xs font-bold">
              {product.category}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl mt-3 leading-tight">{product.name}</h1>

            <p className="mt-6 muted leading-8">{product.description}</p>

            <div className="mt-8 flex items-baseline gap-3">
              <span className="font-serif text-4xl text-deep">{product.price}</span>
              <span className="muted">{product.unit}</span>
            </div>

            <a
              href={whatsappLink(product.name)}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-brand text-white px-7 py-4 rounded-full font-bold hover:bg-deep transition"
            >
              <MessageCircle size={19} /> Enquire on WhatsApp
            </a>

            <div className="mt-10 pt-8 border-t border-black/5 space-y-4 text-sm">
              <div className="flex gap-3 items-start">
                <ShieldCheck className="text-brand shrink-0" size={19} />
                <div>
                  <b>Custom requirements welcome</b>
                  <p className="muted mt-1">
                    Text, colour, size, quantity and finish can all be discussed before production.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Truck className="text-brand shrink-0" size={19} />
                <div>
                  <b>Bulk and institutional orders</b>
                  <p className="muted mt-1">
                    We supply schools, garment units and businesses. Ask for bulk pricing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-deep text-white/70 mt-10">
        <div className="max-w-7xl mx-auto px-5 py-8 flex flex-col sm:flex-row justify-between gap-3 text-sm">
          <span>© {new Date().getFullYear()} Gunavathi Tex. All rights reserved.</span>
          <span>Gunavathi Devi Textiles • Komarapalayam</span>
        </div>
      </footer>
    </main>
  );
}
