# Gunavathi Devi Textiles — Online Store

A Next.js 15 + Supabase e-commerce storefront for Gunavathi Devi Textiles
(Komarapalayam) — sarees, dhotis, fabrics, and home textiles.

## What's included

- **Storefront**: home page, product listing with category filter, product
  detail pages, cart (persisted in the browser), checkout with cash-on-delivery
  and a WhatsApp order-confirmation link.
- **Admin dashboard** (`/admin`): Supabase-auth-gated product manager
  (add/edit/delete/toggle active) and a read-only recent-orders table.
- **Database**: `supabase/schema.sql` — categories, products, orders,
  order_items, with row-level security so the public can only read active
  products/categories and place orders; product writes go through the admin
  API routes using the service-role key.

## Setup

1. **Create a Supabase project** at supabase.com.
2. Run `supabase/schema.sql` in the Supabase SQL Editor. This creates the
   tables, RLS policies, and seeds four starter categories (Sarees, Dhotis,
   Fabrics & Material, Home Textiles) — edit these to fit your catalog.
3. In Supabase → Authentication → Users, create yourself an admin login
   (email + password). Anyone with a Supabase auth account can currently
   reach `/admin` — this is fine for a single-shopkeeper setup, since there's
   only one login to create.
4. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from
     Project Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY` — same page, **keep this secret**, never
     commit it or expose it to the browser.
5. Install and run:
   ```bash
   npm install
   npm run dev
   ```
6. Go to `/admin/login`, log in, and add your first products (image URLs can
   point to Supabase Storage, or any hosted image for now).
7. Before going live, set `WHATSAPP_NUMBER` in `app/checkout/page.tsx` to the
   shop's WhatsApp number.

## Deploying

Push to GitHub and import into Vercel (same workflow as your other
Next.js + Supabase projects) — add the three env vars above in the Vercel
project settings.

## Notes / next steps

- Product images: for real product photos, wire up Supabase Storage uploads
  in the admin form instead of pasting URLs.
- Payments: checkout currently records orders as cash-on-delivery. Adding a
  gateway (Razorpay is the common choice in India) means creating a payment
  session in the `/api/orders` route and confirming it before marking the
  order `confirmed`.
- Stock updates on order happen sequentially, not in a single DB transaction
  — fine at this scale, but worth moving to a Postgres function (`rpc`) if
  order volume grows and race conditions become a concern.
