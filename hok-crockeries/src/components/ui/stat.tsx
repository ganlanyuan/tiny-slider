'use client';

import { type ReactNode } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { ArrowDownRight, ArrowUpRight, Lock } from 'lucide-react';

import { cn, money, moneyShort, number as fmtNumber } from '@/lib/utils';

/** Counts a number up when it scrolls into view. Respects reduced motion. */
function AnimatedValue({
  value,
  format,
}: {
  value: number;
  format: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 90, damping: 20, mass: 0.6 });
  const text = useTransform(spring, (latest) => format(latest));

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  return (
    <span ref={ref} className="tabular">
      <motion.span>{text}</motion.span>
    </span>
  );
}

export type StatTone = 'brand' | 'green' | 'amber' | 'rose' | 'violet' | 'slate';

const TONE_RING: Record<StatTone, string> = {
  brand: 'from-brand-500/12 to-transparent text-brand-600 dark:text-brand-300',
  green: 'from-emerald-500/12 to-transparent text-emerald-600 dark:text-emerald-300',
  amber: 'from-amber-500/14 to-transparent text-amber-600 dark:text-amber-300',
  rose: 'from-rose-500/12 to-transparent text-rose-600 dark:text-rose-300',
  violet: 'from-violet-500/12 to-transparent text-violet-600 dark:text-violet-300',
  slate: 'from-ink-500/10 to-transparent text-ink-600 dark:text-ink-300',
};

export function StatCard({
  label,
  sublabel,
  value,
  kind = 'money',
  suffix,
  icon,
  tone = 'brand',
  delta,
  hint,
  locked,
  compact,
  className,
}: {
  label: string;
  sublabel?: string;
  value: number | string;
  /** `money` groups with ৳, `short` abbreviates to K/L/Cr, `count` is plain. */
  kind?: 'money' | 'short' | 'count' | 'text';
  suffix?: string;
  icon?: ReactNode;
  tone?: StatTone;
  delta?: number;
  hint?: string;
  /** Renders a lock instead of the figure — used for owner-only numbers. */
  locked?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const format = (n: number): string => {
    if (kind === 'money') return money(n);
    if (kind === 'short') return moneyShort(n);
    return fmtNumber(Math.round(n));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'card relative overflow-hidden p-4 transition hover:shadow-lift sm:p-5',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl',
          TONE_RING[tone],
        )}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide muted">{label}</p>
          {sublabel ? <p className="mt-0.5 truncate text-[11px] muted">{sublabel}</p> : null}
        </div>
        {icon ? (
          <span className={cn('shrink-0 rounded-xl bg-white/60 p-2 dark:bg-white/5', TONE_RING[tone])}>
            {icon}
          </span>
        ) : null}
      </div>

      <div className="relative mt-3 flex items-baseline gap-2">
        {locked ? (
          <span className="inline-flex items-center gap-2 font-display text-lg font-semibold muted">
            <Lock size={16} strokeWidth={1.75} /> Owner only
          </span>
        ) : (
          <p
            className={cn(
              'font-display font-semibold tracking-tight',
              compact ? 'text-xl' : 'text-2xl sm:text-[1.7rem]',
            )}
          >
            {kind === 'text' || typeof value === 'string' ? (
              <span className="tabular">{value}</span>
            ) : (
              <AnimatedValue value={value} format={format} />
            )}
            {suffix ? <span className="ml-1 text-sm font-medium muted">{suffix}</span> : null}
          </p>
        )}
        {delta !== undefined && !locked ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium',
              delta >= 0
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
            )}
          >
            {delta >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        ) : null}
      </div>

      {hint ? <p className="relative mt-2 text-xs muted">{hint}</p> : null}
    </motion.div>
  );
}

/** A labelled bar used for expense breakdowns and stock splits. */
export function MeterRow({
  label,
  value,
  total,
  tone = 'brand',
  valueLabel,
}: {
  label: string;
  value: number;
  total: number;
  tone?: StatTone;
  valueLabel?: string;
}) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  const bar: Record<StatTone, string> = {
    brand: 'bg-brand-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    violet: 'bg-violet-500',
    slate: 'bg-ink-400',
  };
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
        <span className="truncate">{label}</span>
        <span className="tabular shrink-0 font-medium">{valueLabel ?? money(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
        <motion.div
          className={cn('h-full rounded-full', bar[tone])}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
