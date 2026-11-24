import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Server-side Supabase client.
 *
 * Used by Server Components and Server Actions. It reads and writes the
 * session cookie, which is how the owner stays signed in across requests
 * without any token ever touching the browser's JavaScript.
 *
 * Returns null when the environment variables are missing. Every caller must
 * handle that — see `isSupabaseConfigured` and the SetupNotice component.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // The middleware refreshes the session instead, so this is safe to
          // ignore — it is the documented @supabase/ssr pattern.
        }
      },
    },
  });
}

/**
 * A cookie-free client for public reads.
 *
 * `createClient()` above calls `cookies()`, which only works inside a request.
 * That is fine for pages and Server Actions, but `generateStaticParams()` runs
 * at build time where there is no request — calling it there throws
 * "`cookies` was called outside a request scope" and the product page 500s.
 *
 * Public catalogue reads do not need a session: Row Level Security already
 * limits an anonymous caller to published rows. So they use this client, which
 * carries no cookies and works in any context.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** True when both public Supabase environment variables are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  );
}

/**
 * The signed-in user, or null.
 * Used to gate the admin area and to decide whether to show draft products.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
