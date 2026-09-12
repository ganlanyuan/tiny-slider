import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  ClipboardList,
  Eye,
  LineChart,
  Lock,
  PackageSearch,
  Receipt,
  ShieldCheck,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';

import { Wordmark } from '@/components/brand';
import { ThemeToggle } from '@/components/theme-toggle';
import { Reveal, RevealGroup } from '@/components/motion/reveal';
import { HeroCanvas } from '@/components/three/hero-canvas';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const FEATURES = [
  {
    icon: Boxes,
    title: 'A store ledger that adds up',
    body: 'Every purchase, challan and invoice moves the same ledger. Units in the store, units riding with a rep and units sold always reconcile — no counter to correct by hand.',
  },
  {
    icon: Truck,
    title: 'Rep stock, not guesswork',
    body: 'Hand stock over against a challan. The system refuses a sale for goods the rep is not actually carrying, so the van and the books never disagree.',
  },
  {
    icon: Wallet,
    title: 'Cash position per rep',
    body: 'Collected minus deposited, live. You always know what is still in a rep’s pocket and what the market still owes you.',
  },
  {
    icon: ClipboardList,
    title: 'Demand before it bites',
    body: 'Reps raise demand from the field. The office sees what cannot be filled from the shelf right now and reorders in time.',
  },
  {
    icon: Receipt,
    title: 'Three prices, one record',
    body: 'Purchase cost, the rate the rep must sell at, and the market price sit on the same product — each visible to exactly the right people.',
  },
  {
    icon: LineChart,
    title: 'The month in one screen',
    body: 'Product cost, salaries, transport and sundries broken out. Revenue and profit trended across twelve months.',
  },
];

const ROLES = [
  {
    icon: ShieldCheck,
    role: 'Owner',
    tone: 'text-brand-600 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-300',
    points: [
      'The only person who sees purchase cost',
      'Invites reps, managers and dealers',
      'Pays salary, bonus and commission',
      'Full profit, margin and expense view',
    ],
  },
  {
    icon: Users,
    role: 'Manager',
    tone: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-300',
    points: [
      'Runs the store, challans and deliveries',
      'Receives deposits and books expenses',
      'Approves demand from the field',
      'Every number except the owner’s cost',
    ],
  },
  {
    icon: Truck,
    role: 'Sales Rep',
    tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300',
    points: [
      'Own stock, own invoices, own cash',
      'Sells at the rate the office set',
      'Raises demand from the market',
      'Never sees the purchase cost',
    ],
  },
  {
    icon: Eye,
    role: 'Dealer',
    tone: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300',
    points: [
      'Read-only catalogue access',
      'Market price and availability',
      'No edits, no internal figures',
      'Built for sharing outside the office',
    ],
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Create your workspace',
    body: 'Sign up and you are the owner. Your data is yours alone — no other business can reach it.',
  },
  {
    step: '02',
    title: 'Load your catalogue',
    body: 'Import an existing price list as JSON or CSV, or add products by hand. Set your three prices once.',
  },
  {
    step: '03',
    title: 'Invite your team',
    body: 'Send a link. Reps, managers and dealers each get exactly the screens their role needs.',
  },
  {
    step: '04',
    title: 'Run the month',
    body: 'Receive stock, issue challans, record sales and deposits. The overview keeps itself current.',
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  const primaryHref = user ? '/dashboard' : '/signup';
  const primaryLabel = user ? 'Open dashboard' : 'Start free';

  return (
    <div className="min-h-dvh overflow-x-hidden">
      <header className="sticky top-0 z-40 border-b bg-[rgb(var(--surface))]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Wordmark />
          <nav className="hidden items-center gap-7 text-sm muted md:flex">
            <a className="transition hover:text-brand-600" href="#features">
              Features
            </a>
            <a className="transition hover:text-brand-600" href="#roles">
              Roles
            </a>
            <a className="transition hover:text-brand-600" href="#how">
              How it works
            </a>
            <a className="transition hover:text-brand-600" href="#privacy">
              Cost privacy
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {!user ? (
              <Link href="/login" className="hidden text-sm muted transition hover:text-brand-600 sm:block">
                Sign in
              </Link>
            ) : null}
            <Link href={primaryHref} className="btn-primary h-9 px-4 py-0 text-sm">
              {primaryLabel}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------------- hero */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 grain opacity-70 dark:opacity-20" aria-hidden />
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-brand-400/18 blur-[120px] dark:bg-brand-500/12"
          aria-hidden
        />

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-12 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:pb-24 lg:pt-20">
          <div>
            <Reveal>
              <span className="chip bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                <BadgeCheck size={14} /> Distribution, inventory and accounts in one place
              </span>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                Run your wholesale business
                <span className="mt-2 block bg-gradient-to-r from-brand-600 via-brand-500 to-clay-500 bg-clip-text text-transparent">
                  on numbers that reconcile
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-5 max-w-xl text-base leading-relaxed muted sm:text-lg">
                Stock into the store, stock out to your sales reps, sales in the market, cash back to
                the office, and the month’s expenses — on one ledger that actually adds up. The
                purchase price stays with the owner alone.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={primaryHref} className="btn-primary">
                  {primaryLabel}
                  <ArrowRight size={16} />
                </Link>
                <a href="#roles" className="btn-ghost">
                  <Users size={16} strokeWidth={1.75} />
                  See who sees what
                </a>
              </div>
              {!user ? (
                <p className="mt-3 text-xs muted">
                  No card required. Your workspace is private from the first minute.
                </p>
              ) : null}
            </Reveal>
          </div>

          <Reveal delay={0.1} className="relative">
            <div className="relative h-[340px] sm:h-[420px] lg:h-[520px]">
              <HeroCanvas />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------- features */}
      <section id="features" className="border-t py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
              What it handles
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Built around how a distribution house actually runs
            </h2>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="card group h-full p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-300">
                  <f.icon size={20} strokeWidth={1.6} />
                </span>
                <h3 className="mt-4 font-display font-semibold">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed muted">{f.body}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ---------------------------------------------------------- roles */}
      <section id="roles" className="border-t bg-white/50 py-16 dark:bg-white/[0.02] sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
              Four roles
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Everyone gets the screens they need, and nothing more
            </h2>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r) => (
              <div key={r.role} className="card h-full p-6">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl ${r.tone}`}>
                  <r.icon size={20} strokeWidth={1.6} />
                </span>
                <h3 className="mt-4 font-display font-semibold">{r.role}</h3>
                <ul className="mt-4 space-y-2.5">
                  {r.points.map((p) => (
                    <li key={p} className="flex gap-2 text-sm leading-snug muted">
                      <BadgeCheck size={15} className="mt-0.5 shrink-0 text-brand-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ----------------------------------------------------------- how */}
      <section id="how" className="border-t py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
              How it works
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Live by the end of the afternoon
            </h2>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.step} className="card h-full p-6">
                <span className="font-display text-2xl font-semibold text-brand-500/40">
                  {s.step}
                </span>
                <h3 className="mt-3 font-display font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed muted">{s.body}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* -------------------------------------------------------- privacy */}
      <section id="privacy" className="border-t bg-white/50 py-16 dark:bg-white/[0.02] sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <span className="chip bg-clay-50 text-clay-700 dark:bg-clay-500/10 dark:text-clay-300">
              <Lock size={14} /> Cost privacy
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              The purchase price never leaves the owner’s screen
            </h2>
            <p className="mt-4 leading-relaxed muted">
              Cost is stripped at the API boundary, not hidden with CSS. A rep, a dealer, even a
              manager receives a product record with no cost field at all — and anything derived from
              cost, such as profit or margin, is withheld the same way.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Cost removed server-side before the response is sent',
                'Profit, margin and stock valuation are owner-only',
                'Supplier invoice totals are hidden from managers too',
                'Only the owner can write a purchase price',
                'Every change is written to an audit trail',
              ].map((t) => (
                <li key={t} className="flex gap-2.5 text-sm">
                  <ShieldCheck size={17} className="mt-0.5 shrink-0 text-emerald-500" />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card overflow-hidden p-0">
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <PackageSearch size={16} className="text-brand-500" />
                <span className="text-sm font-medium">GET /api/products</span>
                <span className="ml-auto chip bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-ink-300">
                  as a sales rep
                </span>
              </div>
              <pre className="scrollbar-thin overflow-x-auto px-4 py-4 text-xs leading-relaxed muted">
                <code>{`{
  "sku": "HC-1004",
  "name": "Dinner Plate 10\\"",
  "unit": "dozen",
  "srPrice": 720,        // the rate you sell at
  "marketPrice": 950,    // suggested retail
  "inStore": 31
  //  costPrice — not present in this response
}`}</code>
              </pre>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------------- cta */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 px-6 py-12 text-white sm:px-12 sm:py-16">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-white/10 blur-3xl"
                aria-hidden
              />
              <h2 className="max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Your books, clear from today
              </h2>
              <p className="mt-4 max-w-xl text-white/80">
                Create your workspace, import your product list, and hand the first challan to a rep.
              </p>
              <Link
                href={primaryHref}
                className="btn mt-8 bg-white px-5 text-brand-700 hover:bg-white/90"
              >
                {primaryLabel}
                <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm muted sm:flex-row sm:px-6">
          <Wordmark compact />
          <p>© {new Date().getFullYear()} Hok Crockeries. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
