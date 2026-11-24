"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, Menu, MessageCircle, X } from "lucide-react";
import { whatsappLink } from "@/lib/types";

/**
 * The site header.
 *
 * This is a client component for one reason: the mobile navigation. The
 * original header hid the nav behind `hidden md:flex` with no alternative, so
 * on a phone — which is how most of this business's customers will arrive —
 * Collections, About and Contact were simply unreachable. This adds a
 * hamburger and a slide-down sheet.
 */
export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  // Close the sheet on Escape, and lock the page behind it.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { href: "#collections", label: "Collections" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-black/5">
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-brand text-white grid place-items-center font-serif text-xl">
            G
          </div>
          <div>
            <div className="font-serif text-xl font-bold text-brand">Gunavathi Tex</div>
            <div className="text-[10px] tracking-[.22em] uppercase muted">
              Gunavathi Devi Textiles
            </div>
          </div>
        </a>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-brand">
              {l.label}
            </a>
          ))}
          <a href="/admin" className="muted hover:text-brand flex items-center gap-1">
            <LockKeyhole size={14} /> Admin
          </a>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="bg-brand text-white px-5 py-2.5 rounded-full hover:bg-deep transition"
          >
            WhatsApp Us
          </a>
        </nav>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat on WhatsApp"
            className="bg-brand text-white p-2.5 rounded-full"
          >
            <MessageCircle size={18} />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="p-2.5 rounded-full border border-black/10 text-deep"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div id="mobile-nav" className="md:hidden border-t border-black/5 bg-white">
          <nav className="max-w-7xl mx-auto px-5 py-4 flex flex-col">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3.5 border-b border-black/5 font-semibold text-deep"
              >
                {l.label}
              </a>
            ))}
            <a
              href="/admin"
              onClick={() => setOpen(false)}
              className="py-3.5 border-b border-black/5 font-semibold muted flex items-center gap-2"
            >
              <LockKeyhole size={15} /> Admin
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="mt-4 bg-brand text-white px-5 py-3.5 rounded-full text-center font-bold"
            >
              WhatsApp Us
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
