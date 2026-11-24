# Setup guide — connecting Gunavathi Tex to Supabase

This takes about ten minutes. You need a Supabase account (the free tier is enough) and access to this repository.

There are five steps. Do them in order.

---

## Step 1 — Create a Supabase project

1. Go to **[supabase.com](https://supabase.com)** and sign in.
2. Click **New project**.
3. Fill in:
   - **Name**: `gunavathi-tex`
   - **Database Password**: click **Generate a password** and save it somewhere safe. You will not need it for this app, but you will need it if you ever connect to the database directly.
   - **Region**: choose the one closest to your customers. For Tamil Nadu, **Mumbai (ap-south-1)** is the closest.
4. Click **Create new project** and wait about two minutes for it to finish provisioning.

---

## Step 2 — Create the database table and security rules

This is the step that makes the CMS work. You are running one SQL file that creates the products table, the security policies, and the photo storage bucket.

1. In your Supabase project, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file **`supabase/schema.sql`** from this repository and copy **all** of it.
4. Paste it into the SQL editor.
5. Click **Run** (or press Ctrl/Cmd + Enter).

You should see **Success. No rows returned**. That is correct — the file creates structure, not data.

### What it just created

- A `products` table with the four original products already in it.
- **Row Level Security** policies: anyone may read published products; only a signed-in user may add, edit or delete.
- A **`product-images`** storage bucket, publicly readable but writable only by a signed-in user.

> **Safe to re-run.** Every statement is idempotent, and the seed data is only inserted if the table is empty. If something goes wrong, just run the whole file again.

### Verify it worked

Open **Table Editor** in the sidebar. You should see a `products` table with four rows: Cotton Name Tape, Custom Printed Name Tape, Woven Name Rope, Custom Textile Labels.

---

## Step 3 — Copy your API credentials

1. In Supabase, open **Settings** (the gear icon) → **API**.
2. You need two values:

| What it is called in Supabase | What it goes into |
|---|---|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon** / **public** key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

> **Do not use the `service_role` key.** It bypasses all security and this app does not need it. If you paste it anywhere, you have given away full database access.

The anon key is meant to be public. It is safe in the browser and safe in your repository's environment settings. Security comes from the policies you created in Step 2, not from hiding this key.

---

## Step 4 — Create your owner account

This is the login for `/admin`. There is no public sign-up — you create the account yourself, which is what keeps the admin area private.

1. In Supabase, open **Authentication** → **Users**.
2. Click **Add user** → **Create new user**.
3. Enter your email address and a strong password.
4. Leave **Auto Confirm User** switched **on**, so you can sign in immediately without confirming by email.
5. Click **Create user**.

That email and password is now your admin login.

### Turn off public sign-ups

While you are here, make sure nobody else can create an account:

1. Go to **Authentication** → **Sign In / Providers** (or **Providers** → **Email**).
2. Turn **off** *Allow new users to sign up*.
3. Save.

Without this, anyone who finds your Supabase project URL could register an account and then edit your products.

---

## Step 5 — Set the environment variables

### Running locally

1. In the project folder, copy the example file:

   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and paste in your two values:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Restart the dev server.** Environment variables are read at startup, so a running server will not pick them up:

   ```bash
   npm run dev
   ```

4. Open <http://localhost:3000>. The catalogue should now show your four products.
5. Open <http://localhost:3000/admin> and sign in with the account from Step 4.

### Deploying to Vercel

1. In Vercel, open your project → **Settings** → **Environment Variables**.
2. Add both variables. Set them for **Production**, **Preview** and **Development**.
3. **Redeploy** — environment variables only apply to new deployments.
4. In Supabase, go to **Authentication** → **URL Configuration** and set **Site URL** to your Vercel domain (for example `https://gunavathi-tex.vercel.app`). Add the same domain under **Redirect URLs**.

   Without this step, signing in on the live site will fail even though it works locally.

---

## Checking it works

Do this once, and you will know the whole chain is connected.

1. Sign in at `/admin`.
2. Click **Edit** on any product and change the price.
3. Click **Save changes**.
4. Open the website in a **different browser**, or on your phone.
5. The new price is there.

That is the difference from the old version. Before, step 5 would have shown the old price on every device except the one you edited from.

### Try the other controls

- **Add product** — upload a photo from your phone. It is resized automatically before upload.
- **Hide** — the product disappears from the website but stays in your admin list as a draft.
- **↑ / ↓** — change the order products appear in.
- **Delete** — asks for confirmation first.

---

## If something goes wrong

| Symptom | Cause | Fix |
|---|---|---|
| Homepage shows "Setup required" | Env vars missing, or the server was not restarted | Add them to `.env.local`, then restart `npm run dev` |
| "Incorrect email or password" | Wrong credentials, or the user was not created | Check **Authentication → Users** in Supabase |
| "new row violates row-level security policy" | Not signed in, or `schema.sql` was not run | Re-run the whole `schema.sql` file |
| Image upload fails | The storage bucket or its policies are missing | Re-run `schema.sql` |
| Products missing from the site | They are marked **Draft** | Click **Show** in the admin panel |
| Sign-in works locally but not on Vercel | Site URL not set in Supabase | **Authentication → URL Configuration** |

---

## What you still need to do yourself

These are the things only you can do — they need your accounts and your credentials.

- [ ] Create the Supabase project (Step 1)
- [ ] Run `supabase/schema.sql` (Step 2)
- [ ] Copy the Project URL and anon key (Step 3)
- [ ] Create your owner account and disable public sign-ups (Step 4)
- [ ] Set the environment variables locally and on Vercel (Step 5)
- [ ] Replace the four placeholder photos with real photographs of your products
- [ ] Set the **Site URL** in Supabase to your live domain

Nothing in this repository contains a real key or password. The `.env.local` file you create is ignored by git and will never be committed.
