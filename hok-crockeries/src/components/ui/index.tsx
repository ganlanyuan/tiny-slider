'use client';

import { forwardRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, Inbox, AlertTriangle } from 'lucide-react';

import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ Card */

export function Card({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('card p-5', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-4', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="truncate font-display text-base font-semibold">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm muted">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ---------------------------------------------------------------- Button */

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'subtle';

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    loading?: boolean;
    icon?: ReactNode;
    size?: 'sm' | 'md';
  }
>(function Button(
  { variant = 'primary', loading, icon, size = 'md', className, children, disabled, ...rest },
  ref,
) {
  const styles: Record<ButtonVariant, string> = {
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    subtle: 'btn bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300',
  };
  return (
    <button
      ref={ref}
      className={cn(styles[variant], size === 'sm' && 'px-3 py-1.5 text-xs', className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
});

/* ----------------------------------------------------------------- Input */

/**
 * `className` styles the control itself; `wrapperClassName` sizes the field in
 * its parent layout. Keeping them separate is what lets a filter bar put four
 * fields on one row instead of each one claiming full width.
 */
export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    hint?: string;
    error?: string;
    wrapperClassName?: string;
  }
>(function Input({ label, hint, error, className, wrapperClassName, id, ...rest }, ref) {
  const inputId = id ?? rest.name;
  return (
    <div className={cn('w-full', wrapperClassName)}>
      {label ? (
        <label className="label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className={cn('field', error && 'border-rose-400 focus:ring-rose-500/10', className)}
        {...rest}
      />
      {error ? (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs muted">{hint}</p>
      ) : null}
    </div>
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    hint?: string;
    wrapperClassName?: string;
  }
>(function Select({ label, hint, className, wrapperClassName, children, id, ...rest }, ref) {
  const selectId = id ?? rest.name;
  return (
    <div className={cn('w-full', wrapperClassName)}>
      {label ? (
        <label className="label" htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <select ref={ref} id={selectId} className={cn('field cursor-pointer', className)} {...rest}>
        {children}
      </select>
      {hint ? <p className="mt-1 text-xs muted">{hint}</p> : null}
    </div>
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    hint?: string;
    wrapperClassName?: string;
  }
>(function Textarea({ label, hint, className, wrapperClassName, id, ...rest }, ref) {
  const areaId = id ?? rest.name;
  return (
    <div className={cn('w-full', wrapperClassName)}>
      {label ? (
        <label className="label" htmlFor={areaId}>
          {label}
        </label>
      ) : null}
      <textarea ref={ref} id={areaId} className={cn('field min-h-[84px]', className)} {...rest} />
      {hint ? <p className="mt-1 text-xs muted">{hint}</p> : null}
    </div>
  );
});

/* ----------------------------------------------------------------- Badge */

export type Tone = 'brand' | 'green' | 'amber' | 'rose' | 'violet' | 'slate';

const TONES: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
  slate: 'bg-ink-100 text-ink-700 dark:bg-white/10 dark:text-ink-200',
};

export function Badge({
  tone = 'slate',
  children,
  className,
  icon,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span className={cn('chip', TONES[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------- Modal */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              'surface scrollbar-thin max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border shadow-lift sm:rounded-3xl',
              wide ? 'sm:max-w-4xl' : 'sm:max-w-lg',
            )}
            initial={{ y: 32, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            <div className="surface sticky top-0 z-10 flex items-start justify-between gap-4 border-b px-5 py-4">
              <div>
                <h3 className="font-display text-base font-semibold">{title}</h3>
                {subtitle ? <p className="mt-0.5 text-sm muted">{subtitle}</p> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-1.5 muted transition hover:bg-ink-100 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-5">{children}</div>
            {footer ? (
              <div className="surface sticky bottom-0 flex justify-end gap-2 border-t px-5 py-4">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------ Empty/Error */

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 muted dark:bg-white/5">
        {icon ?? <Inbox size={22} strokeWidth={1.5} />}
      </span>
      <div>
        <p className="font-display font-semibold">{title}</p>
        {description ? <p className="mt-1 max-w-sm text-sm muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10">
        <AlertTriangle size={22} strokeWidth={1.5} />
      </span>
      <p className="max-w-sm text-sm muted">{message}</p>
      {onRetry ? (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((__, c) => (
            <div key={c} className="skeleton h-8" />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- Misc */

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('animate-spin', className)} size={18} />;
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
