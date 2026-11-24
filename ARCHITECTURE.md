# Architecture — Gunavathi Tex CMS

## Goal

Replace the browser-localStorage "admin" with a real backend so that a product edit made on the owner's phone is visible to every visitor on every device.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Already in the repo. Server Components let the storefront read the database directly — no client fetch, no loading flash, and edits appear on the next request. |
| Language | TypeScript (strict) | Already in the repo. |
| Database | Supabase Postgres | Managed Postgres with row-level security built in. |
| Auth | Supabase Auth (email + password) | Replaces the hardcoded `gunavathi123`. Sessions live in httpOnly cookies, not in the bundle. |
| Storage | Supabase Storage | Product photos as real files with public URLs, instead of base64 strings in the browser. |
| Styling | Tailwind CSS 3 | Unchanged — the existing maroon/gold/cream design is preserved exactly. |

## Why `output: "export"` had to go

The original `next.config.mjs` set `output: "export"`, which produces a folder of static HTML with no server. That is why `next start` could never work, and it is also why the admin panel had nowhere to save to except the browser. A CMS needs a server: to hold the session cookie, to run the write operations, and to render the catalogue from the database. Removing the export flag fixes the broken `start` script as a side effect.

## Data flow

```
Visitor                    Owner (phone or laptop)
   |                              |
   | GET /                        | POST /admin/login
   v                              v
Next.js Server Component      Supabase Auth  ->  httpOnly session cookie
   |                              |
   | supabase.from('products')    | Server Action (create/update/delete/reorder)
   | .select().eq('published',true)   |
   v                              v
Supabase Postgres  <---- RLS ----  Supabase Postgres
   |                              |
   | public read                  | authenticated write
   v                              v
Rendered HTML                 Supabase Storage (product-images bucket)
```

Both paths hit the same table. That is the whole point: one source of truth.

## Security model

**Row Level Security is the enforcement layer, not the UI.** The admin panel hides buttons, but the database is what actually refuses an unauthorised write. If someone calls the Supabase REST API directly with the public anon key, RLS still blocks them.

| Table / bucket | anon (visitor) | authenticated (owner) |
|---|---|---|
| `products` SELECT | only rows where `published = true` | all rows |
| `products` INSERT / UPDATE / DELETE | denied | allowed |
| `product-images` SELECT | allowed (public bucket) | allowed |
| `product-images` INSERT / UPDATE / DELETE | denied | allowed |

**The service-role key is never used by this app.** It is not in `.env.example` and not in the code. The owner's authenticated session plus RLS is sufficient for every operation, so there is no privileged key to leak. The only two environment variables are the project URL and the anon key — both of which are designed to be public.

## Graceful degradation

If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing, the app must not white-screen. `lib/supabase/server.ts` returns `null` when unconfigured, and every page checks for that and renders a **Setup required** panel linking to `SETUP.md`. This means the project builds and runs before the owner has created a Supabase project, which is the state it is in right now.

## File layout

```
app/
  layout.tsx              root layout + metadata
  globals.css             Tailwind + base styles
  page.tsx                storefront (Server Component, reads DB)
  not-found.tsx           404
  products/[slug]/page.tsx  product detail (Server Component)
  admin/
    page.tsx              dashboard (Server Component, session-gated)
    login/page.tsx        sign-in form
    actions.ts            Server Actions: all writes
  auth/signout/route.ts   POST -> clears session
components/
  SiteHeader.tsx          client — mobile nav sheet
  ProductCard.tsx         presentational
  SetupNotice.tsx         shown when env vars are absent
  admin/AdminDashboard.tsx  client — list, reorder, publish toggle
  admin/ProductEditor.tsx   client — edit form + image upload
  admin/LoginForm.tsx       client — sign-in
lib/
  types.ts                Product type + row mapping
  products.ts             all product queries
  image.ts                client-side compression before upload
  supabase/client.ts      browser client
  supabase/server.ts      server client (cookies)
  supabase/middleware.ts  session refresh
middleware.ts             protects /admin/*
supabase/schema.sql       the SQL the owner runs once
```

## What is deliberately NOT here

- **No shopping cart.** This business sells in bulk to schools and garment units; those buyers want a quote and a conversation, not a checkout. The WhatsApp-first flow is preserved exactly as it was.
- **No public sign-up.** Only the owner has an account. The login page has no "create account" link, and sign-up is disabled in the Supabase dashboard during setup.
- **No image storage in the database.** Photos go to Storage; the table holds only the public URL.
