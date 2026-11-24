import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <main>
      <SiteHeader />
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <p className="text-brand uppercase tracking-[.2em] text-xs font-bold">404</p>
        <h1 className="font-serif text-4xl md:text-5xl mt-3">Page not found</h1>
        <p className="muted mt-4 leading-7">
          That page does not exist, or the product may have been removed from the catalogue.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex items-center gap-2 bg-brand text-white px-6 py-3.5 rounded-full font-semibold"
        >
          Back to the collection <ArrowRight size={17} />
        </a>
      </div>
    </main>
  );
}
