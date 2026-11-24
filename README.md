# Gunavathi Tex

Gunavathi Tex — the website for **Gunavathi Devi Textiles**, Komarapalayam, Tamil Nadu. Name tapes, name ropes, design tapes and custom textile labels for schools, garment units and bulk buyers.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS and Supabase.

---

## What changed in v2

The first version was a static site with an admin panel that only *looked* like a CMS. It stored product edits in the browser's `localStorage`, so a price changed on the owner's phone never reached a single visitor, and the admin password was hardcoded in the JavaScript bundle.

This version puts the catalogue in a real database.

| | Before | Now |
|---|---|---|
| Product data | `localStorage` in one browser | Supabase Postgres |
| Who sees an edit | Only the device that made it | Every visitor, every device |
| Admin login | Hardcoded `gunavathi123` in the bundle | Supabase Auth, httpOnly session cookie |
| Product photos | base64 strings in `localStorage` (crashed past ~5 MB) | Supabase Storage, compressed before upload |
| Mobile navigation | None — nav was `hidden md:flex` | Hamburger + slide-down sheet |
| `npm start` | Failed (`output: "export"` has no server) | Works |
| Small caption text | ~3.4–4.0:1 contrast (below WCAG AA) | 5.9–7.1:1 |
| Two different default catalogues | Yes — page and admin disagreed | One source of truth |

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then fill in the two values
npm run dev                    # http://localhost:3000
```

**The app runs before you have a database.** With no environment variables set, the storefront renders a **Setup required** panel with the four steps, and the admin login explains what is missing. Nothing white-screens.

To make it actually work, follow **[SETUP.md](./SETUP.md)** — it walks through creating the Supabase project, running the SQL, and creating your owner account.

---

## Environment variables

Two are required. Both are safe to expose to the browser.

| Variable | Where to find it | Example |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | `https://abcdefgh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public | `eyJhbGciOi...` |
| `NEXT_PUBLIC_SITE_URL` | Optional. Your live domain, for canonical and Open Graph tags. | `https://gunavathitex.com` |

### Why the anon key is safe to ship

It is designed to be public. It identifies your project; it does not grant access. **Row Level Security** in the database is what decides who may read and write — see `supabase/schema.sql`. An anonymous visitor holding this key can read published products and nothing else.

### The service-role key is not used

This app never needs it, so it is not in `.env.example` and not in the code. There is no privileged key to leak. Every write is authorised by the owner's own signed-in session.

**Never commit `.env.local`.** It is already in `.gitignore`.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript check, no emit |
| `npm run lint` | Next.js lint |

---

## How it works

### The storefront reads the database directly

`app/page.tsx` is a **Server Component**. It queries Postgres on each request, so the HTML a visitor receives already contains the current prices. There is no client-side fetch, no loading spinner, and no stale cache to invalidate.

### The admin writes through Server Actions

Every button in the admin panel submits a **Server Action** (`app/admin/actions.ts`). The database call happens on the server, and the action revalidates the storefront paths — so a save is visible on the next page load, with no redeploy.

### Security is enforced by the database, not the UI

The admin panel hides buttons, but that is cosmetic. The real gate is Row Level Security:

| | Visitor (anon) | Owner (authenticated) |
|---|---|---|
| Read products | published only | all, including drafts |
| Create / edit / delete | **denied** | allowed |
| Read product photos | allowed | allowed |
| Upload / replace / delete photos | **denied** | allowed |

Someone calling the Supabase REST API directly with the public anon key gets exactly the same treatment as the website: read-only, published rows only.

### Images are compressed before upload

`lib/image.ts` resizes a photo so its longest edge is at most 1600px and re-encodes it as WebP. A 4 MB phone photo becomes roughly 200–400 KB. The file goes to Supabase Storage; only the public URL is stored on the product row.

---

## Project structure

```
app/
  layout.tsx                 root layout, metadata, Open Graph
  globals.css                Tailwind + contrast and focus utilities
  page.tsx                   storefront (Server Component)
  not-found.tsx              404
  products/[slug]/page.tsx   product detail, statically generated
  admin/
    page.tsx                 dashboard (session-gated)
    login/page.tsx           sign-in
    actions.ts               all writes (Server Actions)
  auth/signout/route.ts      POST-only sign-out
components/
  SiteHeader.tsx             header + mobile nav sheet
  ProductCard.tsx            collection card
  SetupNotice.tsx            shown when env vars are missing
  admin/AdminDashboard.tsx   list, reorder, publish, delete
  admin/ProductEditor.tsx    add/edit form + image upload
  admin/LoginForm.tsx        sign-in form
lib/
  types.ts                   Product type, slugify, WhatsApp link
  products.ts                every catalogue query
  image.ts                   browser-side compression
  supabase/client.ts         browser client
  supabase/server.ts         server client (cookies)
  supabase/middleware.ts     session refresh + /admin guard
middleware.ts                wires the above into Next.js
supabase/schema.sql          the SQL you run once
```

---

## Deployment

### Vercel (recommended)

1. Push this repository to GitHub.
2. In Vercel, **Add New → Project** and import the repository.
3. Add the environment variables from the table above under **Settings → Environment Variables**. Add them for **Production, Preview and Development**.
4. Deploy.
5. In Supabase, go to **Authentication → URL Configuration** and set the **Site URL** to your Vercel domain. Without this, sign-in redirects will fail.

> **Note:** the previous version was configured as a static export for Vercel. That is no longer the case — this app needs a server, which Vercel provides by default. Do not re-add `output: "export"` to `next.config.mjs`.

### Any Node host

```bash
npm install
npm run build
npm start          # serves on port 3000
```

Set the two environment variables in the host's dashboard. The app needs Node 18.18 or newer.

> `package-lock.json` is not committed. The first `npm install` generates it — commit it afterwards if you want pinned dependency versions across machines and deploys.

---

## Troubleshooting

**"Setup required" panel on the homepage**
The environment variables are missing or the dev server was not restarted after you added them. Environment variables are read at startup — restart with `npm run dev`.

**Sign-in says "Incorrect email or password"**
Check the user exists under Supabase → Authentication → Users. If you created it before running `schema.sql`, that is fine — the SQL does not touch auth users.

**"new row violates row-level security policy"**
You are not signed in, or the policies from `schema.sql` were not applied. Re-run the whole file; it is idempotent.

**Image upload fails with a policy error**
The `product-images` bucket or its policies are missing. Re-run `schema.sql` — it creates the bucket and all four storage policies.

**Products do not appear on the site**
Check the product is marked **Live**, not **Draft**. Drafts are visible only to a signed-in owner.

---

## Licence

Private — © Gunavathi Devi Textiles.
