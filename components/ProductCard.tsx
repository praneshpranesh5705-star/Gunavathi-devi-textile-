import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { whatsappLink, type Product } from "@/lib/types";

/**
 * A single product card in the collection grid.
 *
 * Presentational only — it takes a Product and renders it. The whole card
 * links to the product's detail page, and the Enquire link goes straight to
 * WhatsApp with the product name pre-filled, which is the flow this business
 * actually sells through.
 */
export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:shadow-xl transition flex flex-col">
      <a href={`/products/${product.slug}`} className="block relative overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={900}
          height={900}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="w-full h-72 object-cover group-hover:scale-105 transition duration-500"
        />
      </a>

      <div className="p-5 flex flex-col flex-1">
        <div className="text-xs text-brand uppercase tracking-wider font-bold">
          {product.category}
        </div>

        <h3 className="font-serif text-xl mt-1">
          <a href={`/products/${product.slug}`} className="hover:text-brand">
            {product.name}
          </a>
        </h3>

        <p className="text-sm muted mt-2 leading-6 flex-1">{product.description}</p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5">
          <span className="font-bold text-deep">
            {product.price}{" "}
            <span className="text-xs font-normal muted-soft">{product.unit}</span>
          </span>
          <a
            href={whatsappLink(product.name)}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-brand inline-flex items-center gap-1"
          >
            Enquire <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}
