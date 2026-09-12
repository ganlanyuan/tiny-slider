'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  PackagePlus,
  Rocket,
  ShoppingCart,
  Truck,
  Upload,
  UserPlus,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button, Card } from '@/components/ui';
import { useWorkspace } from '@/components/workspace';
import { apiPatch } from '@/lib/client';
import type { OrgSummary } from '@/lib/types';

export interface SetupState {
  dismissed: boolean;
  hasProducts: boolean;
  hasTeam: boolean;
  hasStock: boolean;
  hasChallan: boolean;
  hasSales: boolean;
}

/**
 * First-run guide for an empty workspace.
 *
 * Every step is derived from real data rather than a stored flag, so it stays
 * honest if the owner does things out of order or imports data directly.
 */
export function SetupChecklist({ setup }: { setup: SetupState }) {
  const { setOrg, can } = useWorkspace();
  const [hidden, setHidden] = useState(false);

  const steps = [
    {
      done: setup.hasProducts,
      icon: Upload,
      title: 'Add your products',
      body: 'Import a price list as JSON or CSV, or add the first product by hand.',
      href: '/dashboard/products',
      cta: 'Open products',
    },
    {
      done: setup.hasTeam,
      icon: UserPlus,
      title: 'Invite your team',
      body: 'Send a link to your sales reps, manager or dealers. They pick their own password.',
      href: '/dashboard/team',
      cta: 'Invite someone',
    },
    {
      done: setup.hasStock,
      icon: PackagePlus,
      title: 'Receive stock into the store',
      body: 'Record a supplier delivery so there is something to hand out.',
      href: '/dashboard/inventory',
      cta: 'Record intake',
    },
    {
      done: setup.hasChallan,
      icon: Truck,
      title: 'Issue a challan',
      body: 'Load a rep’s van. They can only sell what a challan gave them.',
      href: '/dashboard/assignments',
      cta: 'New challan',
    },
    {
      done: setup.hasSales,
      icon: ShoppingCart,
      title: 'Record your first sale',
      body: 'Once invoices start landing, every figure on this page fills in.',
      href: '/dashboard/sales',
      cta: 'New sale',
    },
  ];

  const done = steps.filter((s) => s.done).length;
  const complete = done === steps.length;

  if (hidden || setup.dismissed) return null;

  async function dismiss() {
    setHidden(true);
    try {
      const { organization } = await apiPatch<{ organization: OrgSummary }>('/api/settings', {
        onboarded: true,
      });
      setOrg(organization);
    } catch {
      // Hiding it locally is enough; it is only a guide.
      toast.message('Setup guide hidden for now.');
    }
  }

  const next = steps.find((s) => !s.done);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="relative overflow-hidden border-brand-200/70 bg-gradient-to-br from-brand-50/70 to-transparent dark:border-brand-500/20 dark:from-brand-500/[0.07]">
        {can('settings.manage') ? (
          <button
            type="button"
            onClick={dismiss}
            aria-label="Hide the setup guide"
            className="absolute right-4 top-4 rounded-lg p-1.5 muted transition hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X size={16} />
          </button>
        ) : null}

        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
            <Rocket size={19} strokeWidth={1.7} />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold">
              {complete ? 'You are all set' : 'Finish setting up your workspace'}
            </h2>
            <p className="mt-0.5 text-sm muted">
              {complete
                ? 'Every step is done. You can hide this guide.'
                : `${done} of ${steps.length} done${next ? ` · next: ${next.title.toLowerCase()}` : ''}`}
            </p>
          </div>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-200/60 dark:bg-white/10">
          <motion.div
            className="h-full rounded-full bg-brand-600"
            initial={{ width: 0 }}
            animate={{ width: `${(done / steps.length) * 100}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <ul className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.title}
              className={`surface rounded-xl border p-4 transition ${
                step.done ? 'opacity-60' : 'hover:shadow-soft'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                    step.done
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                      : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300'
                  }`}
                >
                  {step.done ? <Check size={14} /> : <step.icon size={14} strokeWidth={1.8} />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="mt-1 text-xs leading-relaxed muted">{step.body}</p>
                  {!step.done ? (
                    <Link
                      href={step.href}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                    >
                      {step.cta} <ArrowRight size={11} />
                    </Link>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {complete && can('settings.manage') ? (
          <Button variant="ghost" size="sm" className="mt-4" onClick={dismiss}>
            Hide this guide
          </Button>
        ) : null}
      </Card>
    </motion.div>
  );
}
