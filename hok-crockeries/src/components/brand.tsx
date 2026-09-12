import { cn } from '@/lib/utils';

/** Wordmark: a stylised stack of plates beside the Bangla name. */
export function Logo({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow',
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="none">
        <ellipse cx="12" cy="7" rx="8" ry="3.1" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M4 11.4c0 1.71 3.58 3.1 8 3.1s8-1.39 8-3.1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M4 15.8c0 1.71 3.58 3.1 8 3.1s8-1.39 8-3.1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/**
 * The product wordmark. Inside a workspace, pass the organisation's own name so
 * the sidebar reads as the customer's business rather than the platform's.
 */
export function Wordmark({
  className,
  compact,
  name,
  sub,
}: {
  className?: string;
  compact?: boolean;
  name?: string;
  sub?: string;
}) {
  return (
    <span className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <Logo size={compact ? 32 : 38} />
      <span className="min-w-0 leading-tight">
        <span className="block truncate font-display text-[0.95rem] font-semibold tracking-tight">
          {name ?? 'Hok Crockeries'}
        </span>
        <span className="block truncate text-[0.68rem] uppercase tracking-[0.18em] muted">
          {sub ?? (name ? 'Workspace' : 'Distribution OS')}
        </span>
      </span>
    </span>
  );
}
