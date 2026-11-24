"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * The owner sign-in form.
 *
 * Replaces the old hardcoded `gunavathi123` check, which shipped the password
 * inside the JavaScript bundle where anyone could read it. Now the credentials
 * are verified by Supabase Auth and the resulting session lives in an httpOnly
 * cookie that browser JavaScript cannot read.
 *
 * There is deliberately no "create account" link: only the owner has an
 * account, and it is created in the Supabase dashboard (see SETUP.md).
 */
export default function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [configured, setConfigured] = useState(true);

  // If the browser client is unavailable, the env vars are missing.
  useEffect(() => {
    setConfigured(createClient() !== null);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured. See SETUP.md.");
      return;
    }

    setBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);

    if (signInError) {
      // Supabase returns "Invalid login credentials" for both a wrong password
      // and an unknown email. Keep that ambiguity — it avoids confirming which
      // email addresses have accounts.
      setError(
        signInError.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : signInError.message,
      );
      return;
    }

    // Refresh so the server picks up the new session cookie, then go to the
    // dashboard (or wherever the user was originally headed).
    router.replace(nextPath || "/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-cream grid place-items-center px-5 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-black/5">
        <div className="w-14 h-14 rounded-full bg-brand text-white grid place-items-center mx-auto">
          <LockKeyhole />
        </div>

        <h1 className="font-serif text-3xl text-center mt-5">Gunavathi Tex Admin</h1>
        <p className="text-center muted mt-2">
          Sign in to manage name tape, name rope, design tape and textile products
        </p>

        {!configured && (
          <div className="mt-6 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm">
            <b>Supabase is not configured.</b> Add your project URL and anon key to{" "}
            <code className="bg-white px-1 rounded">.env.local</code>, then restart the dev server.
            See <b>SETUP.md</b>.
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-7">
          <label htmlFor="email" className="block text-sm font-semibold text-deep">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full mt-2 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
          />

          <label htmlFor="password" className="block text-sm font-semibold text-deep mt-5">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="w-full mt-2 border border-black/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
          />

          {error && (
            <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !configured}
            className="w-full mt-6 bg-brand text-white rounded-xl py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-deep transition"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <a href="/" className="block text-center mt-6 text-brand text-sm font-semibold">
          ← Back to website
        </a>
      </div>
    </main>
  );
}
