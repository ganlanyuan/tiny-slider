'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, LogOut, Menu, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';

import { Logo, Wordmark } from '@/components/brand';
import { ThemeToggle } from '@/components/theme-toggle';
import { useWorkspace } from '@/components/workspace';
import { navForRole, SECTION_ORDER } from '@/lib/nav';
import { apiPost } from '@/lib/client';
import { ROLE_LABEL, type SafeUser } from '@/lib/types';
import { avatarTone, cn, initials } from '@/lib/utils';

function RoleBadge({ user }: { user: SafeUser }) {
  const tone =
    user.role === 'ADMIN'
      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
      : user.role === 'MANAGER'
        ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300'
        : user.role === 'SR'
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
          : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300';
  return <span className={cn('chip', tone)}>{ROLE_LABEL[user.role]}</span>;
}

function NavList({ user, onNavigate }: { user: SafeUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = navForRole(user.role);

  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 scrollbar-thin">
      {SECTION_ORDER.map((section) => {
        const group = items.filter((i) => i.section === section);
        if (group.length === 0) return null;
        return (
          <div key={section}>
            <p className="mb-1.5 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] muted">
              {section}
            </p>
            <ul className="space-y-0.5">
              {group.map((item) => {
                // `/dashboard` must not light up for every child route.
                const active =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                        active
                          ? 'font-medium text-brand-700 dark:text-brand-300'
                          : 'muted hover:bg-ink-100/70 hover:text-ink-900 dark:hover:bg-white/5 dark:hover:text-white',
                      )}
                    >
                      {active ? (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-xl bg-brand-50 dark:bg-brand-500/10"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      ) : null}
                      <item.icon
                        size={18}
                        strokeWidth={active ? 2 : 1.6}
                        className="shrink-0"
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function UserPanel({ user }: { user: SafeUser }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await apiPost('/api/auth/logout', {});
      toast.success('Signed out.');
      router.replace('/login');
      router.refresh();
    } catch {
      toast.error('Could not sign out. Try again.');
      setBusy(false);
    }
  }

  return (
    <div className="border-t p-3">
      <div className="flex items-center gap-3 rounded-xl px-2 py-2">
        <span
          className={cn(
            'grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold',
            avatarTone(user.id),
          )}
        >
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs muted">{ROLE_LABEL[user.role]}</p>
        </div>
        <button
          type="button"
          onClick={signOut}
          disabled={busy}
          aria-label="Sign out"
          className="rounded-lg p-2 muted transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-500/10"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, org } = useWorkspace();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Closing on navigation keeps the drawer from covering the page it opened.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const current = navForRole(user.role).find((i) =>
    i.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(i.href),
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[264px_1fr]">
      {/* ------------------------------------------------- desktop sidebar */}
      <aside className="surface sticky top-0 hidden h-dvh flex-col border-r lg:flex">
        <div className="flex h-16 items-center px-5">
          <Link href="/dashboard" className="min-w-0 transition hover:opacity-80">
            <Wordmark compact name={org.name} />
          </Link>
        </div>
        <NavList user={user} />
        {user.role === 'ADMIN' ? (
          <div className="mx-3 mb-3 rounded-xl bg-brand-50 px-3 py-2.5 text-xs leading-relaxed text-brand-800 dark:bg-brand-500/10 dark:text-brand-200">
            <ShieldCheck size={14} className="mb-1" />
            You are the owner. Purchase cost and profit are visible only to you.
          </div>
        ) : null}
        <UserPanel user={user} />
      </aside>

      {/* -------------------------------------------------- mobile drawer */}
      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="surface fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            >
              <div className="flex h-16 items-center justify-between px-4">
                <Wordmark compact name={org.name} />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="rounded-lg p-2 muted"
                >
                  <X size={18} />
                </button>
              </div>
              <NavList user={user} onNavigate={() => setMobileOpen(false)} />
              <UserPanel user={user} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      {/* -------------------------------------------------------- content */}
      <div className="flex min-w-0 flex-col">
        <header className="no-print sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-[rgb(var(--surface))]/85 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 muted transition hover:bg-ink-100 lg:hidden dark:hover:bg-white/5"
          >
            <Menu size={19} />
          </button>

          <Link href="/dashboard" className="lg:hidden">
            <Logo size={30} />
          </Link>

          <div className="hidden min-w-0 items-center gap-1.5 text-sm muted sm:flex">
            <Link href="/dashboard" className="transition hover:text-brand-600">
              Dashboard
            </Link>
            {current && current.href !== '/dashboard' ? (
              <>
                <ChevronRight size={14} />
                <span className="truncate font-medium text-ink-800 dark:text-ink-100">
                  {current.label}
                </span>
              </>
            ) : null}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <RoleBadge user={user} />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
