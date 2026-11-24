import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Sign-out endpoint.
 *
 * A POST-only route rather than a link, so a stray prefetch or a crawler
 * cannot sign the owner out by following a URL.
 */
export async function POST() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}
