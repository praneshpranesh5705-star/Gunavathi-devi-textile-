import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import SetupNotice from "@/components/SetupNotice";
import { listAllProducts } from "@/lib/products";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { signOutAction } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Admin panel",
  robots: { index: false, follow: false },
};

// Always read the live catalogue — never serve a cached admin view.
export const dynamic = "force-dynamic";

/**
 * The admin dashboard.
 *
 * Gated twice: the middleware redirects anyone without a session before this
 * renders, and this page checks again. The second check is not redundant —
 * middleware can be bypassed in some deployment setups, and a page that
 * assumes it ran is a page that leaks drafts.
 */
export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="min-h-screen bg-cream">
        <SetupNotice />
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase!.auth.getUser()) ?? { data: { user: null } };

  if (!user) redirect("/admin/login");

  const products = await listAllProducts();

  return (
    <main className="min-h-screen bg-cream">
      <header className="bg-deep text-white">
        <div className="max-w-6xl mx-auto px-5 py-5 flex flex-wrap justify-between items-center gap-4">
          <div>
            <p className="text-gold text-xs tracking-[.2em] uppercase">Gunavathi Tex</p>
            <h1 className="font-serif text-2xl">Textile Admin Panel</h1>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-2 border border-white/20 rounded-full px-4 py-2 text-sm hover:bg-white/10"
            >
              <ArrowLeft size={16} /> Website
            </a>
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex items-center gap-2 border border-white/20 rounded-full px-4 py-2 text-sm hover:bg-white/10"
              >
                <LogOut size={16} /> Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <AdminDashboard products={products} email={user.email ?? "owner"} />
    </main>
  );
}
