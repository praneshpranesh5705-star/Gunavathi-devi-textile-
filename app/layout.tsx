import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Gunavathi Tex | Quality Textiles in Komarapalayam",
    template: "%s | Gunavathi Tex",
  },
  description:
    "Gunavathi Tex — name tapes, name ropes, design tapes and custom textile labels from Komarapalayam, Tamil Nadu. Manufacturer and supplier for schools, garment units and bulk requirements.",
  keywords: [
    "name tape",
    "name rope",
    "design tape",
    "textile labels",
    "Komarapalayam",
    "Tamil Nadu textiles",
    "school uniform name tape",
    "custom woven labels",
  ],
  openGraph: {
    type: "website",
    siteName: "Gunavathi Tex",
    title: "Gunavathi Tex | Quality Textiles in Komarapalayam",
    description:
      "Name tapes, name ropes and custom textile identification products for schools, garments and bulk requirements.",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
