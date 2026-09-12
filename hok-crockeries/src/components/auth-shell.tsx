import Link from 'next/link';
import type { ReactNode } from 'react';

import { Wordmark } from '@/components/brand';
import { ThemeToggle } from '@/components/theme-toggle';

/**
 * Shared frame for sign-in, sign-up and invitation pages: the form on the left,
 * a quiet marketing panel on the right that disappears on small screens.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  panelTitle,
  panelBody,
  panelPoints,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  panelTitle: string;
  panelBody: string;
  panelPoints: string[];
}) {
  return (
    <main className="relative grid min-h-dvh lg:grid-cols-2">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-block transition hover:opacity-80">
            <Wordmark />
          </Link>
          <h1 className="mt-8 font-display text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm muted">{subtitle}</p>
          {children}
          {footer ? <div className="mt-8 text-center text-sm muted">{footer}</div> : null}
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-ink-950 lg:block">
        <div
          className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-brand-400/25 blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-clay-500/20 blur-[110px]"
          aria-hidden
        />
        <div className="relative flex h-full flex-col justify-center p-12 text-white">
          <h2 className="max-w-md font-display text-4xl font-semibold leading-tight tracking-tight">
            {panelTitle}
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-white/70">{panelBody}</p>
          <ul className="mt-10 space-y-4 border-t border-white/15 pt-8">
            {panelPoints.map((point) => (
              <li key={point} className="flex gap-3 text-sm text-white/80">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/60"
                  aria-hidden
                />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
