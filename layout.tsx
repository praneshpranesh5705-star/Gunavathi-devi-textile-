import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Gunavathi Devi Textiles",
  description:
    "Traditional sarees, dhotis, fabrics and home textiles from Komarapalayam.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans text-maroon-dark">
        <CartProvider>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-6 min-h-[70vh]">
            {children}
          </main>
          <footer className="bg-maroon-dark text-cream text-center text-sm py-6 mt-10">
            © {new Date().getFullYear()} Gunavathi Devi Textiles, Komarapalayam
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
