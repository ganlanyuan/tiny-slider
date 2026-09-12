import type { Metadata } from 'next';

import { LoginForm } from './login-form';
import { Wordmark } from '@/components/brand';
import { ThemeToggle } from '@/components/theme-toggle';
import { readDb } from '@/lib/db';

export const metadata: Metadata = { title: 'Sign in' };
export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const db = await readDb();
  // A brand-new install has nobody to sign in as, so say so plainly rather than
  // letting the owner guess at credentials.
  const needsSeed = db.users.length === 0;

  return (
    <main className="relative grid min-h-dvh lg:grid-cols-2">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      {/* ------------------------------------------------------------ form */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <Wordmark />
          <h1 className="mt-8 font-display text-2xl font-semibold tracking-tight">
            আবার স্বাগতম
          </h1>
          <p className="mt-1.5 text-sm muted">
            Sign in with the phone number or email the owner registered for you.
          </p>

          {needsSeed ? (
            <div className="mt-6 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              <p className="font-medium">No accounts exist yet.</p>
              <p className="mt-1 leading-relaxed">
                Run <code className="rounded bg-black/10 px-1 py-0.5">npm run seed</code> once to
                create the owner account and demo data.
              </p>
            </div>
          ) : null}

          <LoginForm />

          <p className="mt-8 text-center text-xs muted">
            Trouble signing in? Ask the owner to reset your password from Team settings.
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------------- visual */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-ink-950 lg:block">
        <div
          className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-brand-400/25 blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-clay-500/20 blur-[110px]"
          aria-hidden
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div />
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/50">
              {db.settings.companyName}
            </p>
            <h2 className="mt-4 max-w-md font-display text-4xl font-semibold leading-tight tracking-tight">
              চালান থেকে ক্যাশ — প্রতিটি হিসেব এক জায়গায়
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-white/70">
              Stock in, stock out, market demand, deposits and payroll. One ledger for the whole
              operation, with the purchase price kept to the owner alone.
            </p>
          </div>
          <dl className="grid max-w-md grid-cols-3 gap-6 border-t border-white/15 pt-8">
            {[
              { k: 'Products', v: db.products.length },
              { k: 'Sales reps', v: db.users.filter((u) => u.role === 'SR').length },
              { k: 'Invoices', v: db.sales.length },
            ].map((s) => (
              <div key={s.k}>
                <dt className="tabular font-display text-2xl font-semibold">{s.v}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wide text-white/50">{s.k}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </main>
  );
}
