import {
  ArrowRight,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import ProductCard from "@/components/ProductCard";
import SetupNotice from "@/components/SetupNotice";
import { listPublishedProducts } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { whatsappLink } from "@/lib/types";

/**
 * The storefront.
 *
 * This is a Server Component: it reads the catalogue from Postgres on every
 * request, so a price the owner changes on their phone is what the next
 * visitor sees. There is no client-side fetch and no loading flash.
 *
 * The design is the original one — maroon, gold and cream, serif headings,
 * WhatsApp-first calls to action. Only the data source changed.
 */
export const dynamic = "force-dynamic";

export default async function Home() {
  const configured = isSupabaseConfigured();
  const products = configured ? await listPublishedProducts() : [];

  // The hero image is the second product, matching the original layout.
  const heroImage = products[1]?.imageUrl ?? products[0]?.imageUrl ?? null;

  return (
    <main>
      <SiteHeader />

      {!configured ? (
        <SetupNotice />
      ) : (
        <>
          {/* ---------------------------------------------------------------- */}
          {/* Hero                                                             */}
          {/* ---------------------------------------------------------------- */}
          <section className="bg-deep text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-5 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-gold font-bold tracking-[.25em] uppercase text-xs mb-5">
                  Trusted Textiles • Komarapalayam
                </p>
                <h1 className="font-serif text-5xl md:text-7xl leading-[.95]">
                  Custom name tapes &amp; <span className="text-gold">name rope textiles.</span>
                </h1>
                <p className="mt-7 muted-on-dark text-lg max-w-xl leading-8">
                  Manufacturer and supplier of quality name tapes, name ropes and custom textile
                  identification products for schools, garments, businesses and bulk requirements.
                </p>
                <div className="mt-9 flex flex-wrap gap-4">
                  <a
                    href="#collections"
                    className="bg-gold text-deep font-bold px-6 py-3.5 rounded-full inline-flex items-center gap-2"
                  >
                    Explore Collection <ArrowRight size={18} />
                  </a>
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-white/30 px-6 py-3.5 rounded-full inline-flex items-center gap-2"
                  >
                    <MessageCircle size={18} /> Order on WhatsApp
                  </a>
                </div>
              </div>

              {heroImage && (
                <div className="relative">
                  <div className="absolute -inset-5 rounded-[2rem] bg-gold/10 rotate-3" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImage}
                    alt="Textile collection"
                    className="relative w-full h-[430px] object-cover rounded-[2rem] shadow-2xl"
                  />
                </div>
              )}
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Trust bar                                                        */}
          {/* ---------------------------------------------------------------- */}
          <section className="border-b bg-white">
            <div className="max-w-7xl mx-auto px-5 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: ShoppingBag, title: "Curated Range", sub: "For every occasion" },
                { icon: ShieldCheck, title: "Quality First", sub: "Carefully selected" },
                { icon: Truck, title: "Easy Ordering", sub: "Local & delivery" },
                { icon: Star, title: "Personal Service", sub: "Friendly support" },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex gap-3 items-center">
                  <Icon className="text-brand shrink-0" />
                  <div>
                    <b className="block">{title}</b>
                    <span className="text-xs muted">{sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Collection                                                       */}
          {/* ---------------------------------------------------------------- */}
          <section id="collections" className="max-w-7xl mx-auto px-5 py-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-brand uppercase tracking-[.2em] text-xs font-bold">
                  Our Collection
                </p>
                <h2 className="font-serif text-4xl mt-2">Featured textiles</h2>
              </div>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-2 text-brand font-semibold"
              >
                Ask for product catalogue <ArrowRight size={17} />
              </a>
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-black/5 p-12 text-center">
                <h3 className="font-serif text-2xl">No products published yet</h3>
                <p className="muted mt-2">
                  Sign in to the admin panel to add your first product.
                </p>
                <a
                  href="/admin"
                  className="mt-6 inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-full font-semibold"
                >
                  Open admin panel <ArrowRight size={17} />
                </a>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* About                                                            */}
          {/* ---------------------------------------------------------------- */}
          <section id="about" className="bg-cream">
            <div className="max-w-7xl mx-auto px-5 py-20 grid md:grid-cols-2 gap-14 items-center">
              <div>
                <p className="text-brand uppercase tracking-[.2em] text-xs font-bold">
                  About Gunavathi Tex
                </p>
                <h2 className="font-serif text-4xl md:text-5xl mt-3 leading-tight">
                  A textile store built around quality and trust.
                </h2>
                <p className="mt-6 muted leading-8">
                  Gunavathi Tex (Gunavathi Devi Textiles) specialises in name tapes, name ropes and
                  custom textile identification products. We support schools, garment businesses,
                  institutions and bulk customers.
                </p>
                <p className="mt-4 muted leading-8">
                  From printed and woven name tapes to name ropes and custom labels, we can discuss
                  your required text, size, colour, quantity and finish before production.
                </p>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-full font-semibold"
                >
                  Talk to us <ArrowRight size={18} />
                </a>
              </div>

              <div className="bg-deep rounded-[2rem] p-8 md:p-12 text-white">
                <p className="text-gold font-bold text-sm">WHY CUSTOMERS CHOOSE US</p>
                <div className="mt-8 space-y-7">
                  {[
                    {
                      n: "01. Quality textile products",
                      d: "Name tapes, name ropes and labels made for practical everyday use.",
                    },
                    {
                      n: "02. Custom requirements",
                      d: "Custom text, colours, sizes and quantities can be discussed for your order.",
                    },
                    {
                      n: "03. Direct ordering",
                      d: "Send your requirement directly through WhatsApp for pricing and bulk enquiries.",
                    },
                  ].map((item) => (
                    <div key={item.n}>
                      <b className="text-xl">{item.n}</b>
                      <p className="muted-on-dark mt-1">{item.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Contact                                                          */}
          {/* ---------------------------------------------------------------- */}
          <section id="contact" className="max-w-7xl mx-auto px-5 py-20">
            <div className="bg-brand rounded-[2rem] text-white p-8 md:p-14 grid md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-gold uppercase tracking-[.2em] text-xs font-bold">
                  Visit or contact us
                </p>
                <h2 className="font-serif text-4xl md:text-5xl mt-3">
                  Let&rsquo;s create the right name textile for you.
                </h2>
                <p className="mt-5 muted-on-dark leading-7">
                  For pricing, custom requirements, bulk orders and product availability, contact
                  Gunavathi Tex directly on WhatsApp.
                </p>
              </div>

              <div className="space-y-5 text-sm">
                <div className="flex gap-4 items-start">
                  <MapPin className="text-gold shrink-0" />
                  <div>
                    <b>Location</b>
                    <p className="muted-on-dark mt-1">Komarapalayam, Tamil Nadu, India</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <Phone className="text-gold shrink-0" />
                  <div>
                    <b>Phone / WhatsApp</b>
                    <p className="muted-on-dark mt-1">
                      <a href="tel:+918610732094" className="hover:text-gold">
                        +91 86107 32094
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <Instagram className="text-gold shrink-0" />
                  <div>
                    <b>Social</b>
                    <p className="muted-on-dark mt-1">
                      Follow Gunavathi Tex for new arrivals.
                    </p>
                  </div>
                </div>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 bg-white text-brand px-6 py-3 rounded-full inline-flex items-center gap-2 font-bold"
                >
                  <MessageCircle size={18} /> Chat on WhatsApp
                </a>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                             */}
      {/* ------------------------------------------------------------------ */}
      <footer className="bg-deep text-white/70">
        <div className="max-w-7xl mx-auto px-5 py-8 flex flex-col sm:flex-row justify-between gap-3 text-sm">
          <span>© {new Date().getFullYear()} Gunavathi Tex. All rights reserved.</span>
          <span>Gunavathi Devi Textiles • Komarapalayam</span>
        </div>
      </footer>
    </main>
  );
}
