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
import { readDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

const FEATURES = [
  {
    icon: Boxes,
    title: 'Store ledger that adds up',
    bn: 'স্টোরে কতটি ঢুকলো, কতটি আছে',
    body: 'Every purchase, every challan, every invoice moves the same ledger. Units in store, units riding with an SR and units sold always reconcile.',
  },
  {
    icon: Truck,
    title: 'SR stock, not guesswork',
    bn: 'কোন SR এর কাছে কী আছে',
    body: 'Hand stock to a rep against a challan. The system blocks a sale for goods the rep is not actually carrying.',
  },
  {
    icon: Wallet,
    title: 'Cash position per rep',
    bn: 'কত জমা দিলো, কত হাতে আছে',
    body: 'Collected minus deposited, running live. You always know what is still in a rep’s pocket and what the market still owes.',
  },
  {
    icon: ClipboardList,
    title: 'Demand before it bites',
    bn: 'মার্কেটে কী ডিমান্ড',
    body: 'Reps raise demand from the field. The office sees what cannot be filled from the shelf right now, and reorders on time.',
  },
  {
    icon: Receipt,
    title: 'Three prices, one record',
    bn: 'কেনা দাম · SR রেট · বাজার দর',
    body: 'Purchase price, the rate the rep must sell at, and the market price sit on the same product — each visible to exactly the right people.',
  },
  {
    icon: LineChart,
    title: 'The month, in one screen',
    bn: 'মাসে কত খরচ, কত লাভ',
    body: 'Product cost, salaries, transport and sundries broken out; revenue and profit trended over twelve months.',
  },
];

const ROLES = [
  {
    icon: ShieldCheck,
    role: 'মালিক / Owner',
    tone: 'text-brand-600 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-300',
    points: [
      'Sees the purchase price — nobody else does',
      'Appoints SRs, managers and dealers',
      'Pays salaries, bonuses and commission',
      'Full profit, margin and expense view',
    ],
  },
  {
    icon: ClipboardList,
    role: 'ম্যানেজার / Manager',
    tone: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-300',
    points: [
      'Runs the store, challans and deliveries',
      'Receives deposits and books expenses',
      'Approves demand from the field',
      'Every number except the owner’s cost',
    ],
  },
  {
    icon: Users,
    role: 'SR / Sales Rep',
    tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300',
    points: [
      'Own stock, own invoices, own cash',
      'Sells at the fixed SR rate',
      'Raises demand from the market',
      'Never sees the purchase price',
    ],
  },
  {
    icon: Eye,
    role: 'ডিলার / Dealer',
    tone: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300',
    points: [
      'Read-only catalogue access',
      'Market price and availability',
      'No edits, no internal figures',
      'Built for sharing outside the office',
    ],
  },
];

export default async function LandingPage() {
  const [user, db] = await Promise.all([getCurrentUser(), readDb()]);
  const stats = [
    { value: db.products.filter((p) => p.active).length, label: 'Products catalogued' },
    { value: db.users.filter((u) => u.role === 'SR' && u.active).length, label: 'Active sales reps' },
    { value: db.sales.length, label: 'Invoices recorded' },
    { value: db.categories.length, label: 'Categories' },
  ];

  return (
    <div className="min-h-dvh overflow-x-hidden">
      {/* ------------------------------------------------------------ nav */}
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
            <a className="transition hover:text-brand-600" href="#security">
              Price privacy
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href={user ? '/dashboard' : '/login'}
              className="btn-primary h-9 px-4 py-0 text-sm"
            >
              {user ? 'Open dashboard' : 'Sign in'}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------------- hero */}
      <section className="relative">
        <div
          className="pointer-events-none absolute inset-0 -z-10 grain opacity-70 dark:opacity-20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-brand-400/18 blur-[120px] dark:bg-brand-500/12"
          aria-hidden
        />

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-12 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:pb-24 lg:pt-20">
          <div>
            <Reveal>
              <span className="chip bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                <BadgeCheck size={14} /> Distribution & accounts, one system
              </span>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                হক ক্রোকারিজ
                <span className="mt-2 block bg-gradient-to-r from-brand-600 via-brand-500 to-clay-500 bg-clip-text text-transparent">
                  চালান, বিক্রি, হিসেব — এক জায়গায়
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-5 max-w-xl text-base leading-relaxed muted sm:text-lg">
                Stock into the store, stock out to your reps, sales in the market, cash back to the
                office, and the month’s expenses — all on one ledger that actually reconciles.
                The purchase price stays with the owner alone.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={user ? '/dashboard' : '/login'} className="btn-primary">
                  {user ? 'Go to dashboard' : 'Sign in to your account'}
                  <ArrowRight size={16} />
                </Link>
                <a href="#roles" className="btn-ghost">
                  <Users size={16} strokeWidth={1.75} />
                  Who sees what
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <dl className="mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="tabular font-display text-2xl font-semibold">{s.value}</dt>
                    <dd className="mt-0.5 text-xs muted">{s.label}</dd>
                  </div>
                ))}
              </dl>
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
              Built around how a crockery distribution house actually runs
            </h2>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="card group p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-300">
                  <f.icon size={20} strokeWidth={1.6} />
                </span>
                <h3 className="mt-4 font-display font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-brand-600/80 dark:text-brand-300/80">{f.bn}</p>
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
              Everyone gets the screen they need, and nothing more
            </h2>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r) => (
              <div key={r.role} className="card p-6">
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

      {/* ------------------------------------------------------- security */}
      <section id="security" className="border-t py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <span className="chip bg-clay-50 text-clay-700 dark:bg-clay-500/10 dark:text-clay-300">
              <Lock size={14} /> Price privacy
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              The purchase price never leaves the owner’s screen
            </h2>
            <p className="mt-4 leading-relaxed muted">
              Cost price is stripped at the API boundary, not hidden with CSS. An SR, a dealer, even
              a manager receives a product record with no cost field at all — and anything derived
              from cost, such as profit or margin, is withheld the same way.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Cost removed server-side before the response is sent',
                'Profit, margin and stock valuation are owner-only',
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
                  as SR
                </span>
              </div>
              <pre className="scrollbar-thin overflow-x-auto px-4 py-4 text-xs leading-relaxed muted">
                <code>{`{
  "sku": "DIN-1201",
  "name": "Dinner Plate 10\\"",
  "unit": "dozen",
  "srPrice": 720,        // the rate you sell at
  "marketPrice": 950,    // suggested retail
  "stock": 46
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
                আপনার ব্যবসার হিসেব, আজ থেকেই পরিষ্কার
              </h2>
              <p className="mt-4 max-w-xl text-white/80">
                Sign in and start with your product list. Import it as JSON or CSV, set your three
                prices, and hand the first challan to a rep.
              </p>
              <Link
                href={user ? '/dashboard' : '/login'}
                className="btn mt-8 bg-white px-5 text-brand-700 hover:bg-white/90"
              >
                {user ? 'Open dashboard' : 'Sign in'}
                <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm muted sm:flex-row sm:px-6">
          <Wordmark compact />
          <p>
            © {new Date().getFullYear()} {db.settings.companyName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
