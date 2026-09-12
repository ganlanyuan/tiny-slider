'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

import { cn } from '@/lib/utils';

const STORAGE_KEY = 'hok-theme';

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    setReady(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    } catch {
      // Private browsing can block storage; the toggle still works for the session.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'surface relative grid h-9 w-9 place-items-center rounded-xl border transition hover:bg-ink-50 dark:hover:bg-white/5',
        className,
      )}
    >
      {ready ? (
        <motion.span
          key={dark ? 'moon' : 'sun'}
          initial={{ rotate: -50, opacity: 0, scale: 0.7 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="muted"
        >
          {dark ? <Moon size={17} strokeWidth={1.6} /> : <Sun size={17} strokeWidth={1.6} />}
        </motion.span>
      ) : (
        <span className="h-[17px] w-[17px]" />
      )}
    </button>
  );
}
