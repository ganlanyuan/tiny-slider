'use client';

import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

import { formatMonth } from '@/lib/utils';

function shift(month: string, by: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return d.toISOString().slice(0, 7);
}

/** Month stepper used on every month-scoped page. Never steps into the future. */
export function MonthPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (month: string) => void;
}) {
  const thisMonth = new Date().toISOString().slice(0, 7);
  const atLatest = value >= thisMonth;

  return (
    <div className="surface inline-flex items-center gap-1 rounded-xl border p-1">
      <button
        type="button"
        onClick={() => onChange(shift(value, -1))}
        aria-label="Previous month"
        className="rounded-lg p-1.5 muted transition hover:bg-ink-100 dark:hover:bg-white/5"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="flex items-center gap-1.5 px-2 text-sm font-medium">
        <CalendarDays size={14} className="muted" />
        {formatMonth(value)}
      </span>
      <button
        type="button"
        onClick={() => onChange(shift(value, 1))}
        disabled={atLatest}
        aria-label="Next month"
        className="rounded-lg p-1.5 muted transition hover:bg-ink-100 disabled:opacity-35 dark:hover:bg-white/5"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
