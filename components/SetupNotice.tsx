import { AlertTriangle, ArrowRight } from "lucide-react";

/**
 * Shown when the Supabase environment variables are missing.
 *
 * The app must never white-screen just because it has not been connected to a
 * database yet. This renders in place of the catalogue with the exact steps
 * needed to finish setup.
 */
export default function SetupNotice() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-20">
      <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-8 md:p-12">
        <div className="w-14 h-14 rounded-full bg-gold/20 text-deep grid place-items-center">
          <AlertTriangle size={26} />
        </div>

        <h1 className="font-serif text-3xl md:text-4xl mt-6">Setup required</h1>
        <p className="muted mt-3 leading-7">
          The catalogue is stored in Supabase, and this deployment has not been connected to a
          project yet. Two environment variables are missing.
        </p>

        <ol className="mt-8 space-y-5">
          <li className="flex gap-4">
            <span className="shrink-0 w-7 h-7 rounded-full bg-brand text-white grid place-items-center text-sm font-bold">
              1
            </span>
            <div>
              <b>Create a Supabase project</b>
              <p className="muted text-sm mt-1">
                Free tier is enough. Then open <b>SQL Editor</b> and run the file{" "}
                <code className="bg-cream px-1.5 py-0.5 rounded text-[13px]">
                  supabase/schema.sql
                </code>{" "}
                from this repository. It creates the table, the security policies and the storage
                bucket.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="shrink-0 w-7 h-7 rounded-full bg-brand text-white grid place-items-center text-sm font-bold">
              2
            </span>
            <div>
              <b>Copy your project URL and anon key</b>
              <p className="muted text-sm mt-1">
                Supabase dashboard → <b>Settings → API</b>. Both values are safe to expose — Row
                Level Security is what protects the data.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="shrink-0 w-7 h-7 rounded-full bg-brand text-white grid place-items-center text-sm font-bold">
              3
            </span>
            <div>
              <b>Set them as environment variables</b>
              <p className="muted text-sm mt-1">
                Locally, copy <code className="bg-cream px-1.5 py-0.5 rounded text-[13px]">.env.example</code>{" "}
                to <code className="bg-cream px-1.5 py-0.5 rounded text-[13px]">.env.local</code> and
                fill in both values. On Vercel, add them under <b>Settings → Environment
                Variables</b>, then redeploy.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="shrink-0 w-7 h-7 rounded-full bg-brand text-white grid place-items-center text-sm font-bold">
              4
            </span>
            <div>
              <b>Create your owner account</b>
              <p className="muted text-sm mt-1">
                Supabase dashboard → <b>Authentication → Users → Add user</b>. Use your own email
                and a strong password. That is the login for <b>/admin</b>.
              </p>
            </div>
          </li>
        </ol>

        <div className="mt-9 pt-7 border-t border-black/5">
          <p className="muted text-sm">
            The full walkthrough, with screenshots of each screen, is in{" "}
            <b>SETUP.md</b> in the repository root.
          </p>
          <a
            href="https://github.com/praneshpranesh5705-star/Gunavathi-devi-textile-#readme"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-full font-semibold"
          >
            Read the setup guide <ArrowRight size={17} />
          </a>
        </div>
      </div>
    </div>
  );
}
