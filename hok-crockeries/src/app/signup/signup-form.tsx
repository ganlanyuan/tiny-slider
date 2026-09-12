'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { Button, Input, Select } from '@/components/ui';
import { apiPost } from '@/lib/client';
import type { SafeUser } from '@/lib/types';

/** Currencies offered up front. Any symbol can be set later in Settings. */
const CURRENCIES = [
  { symbol: '৳', label: '৳ — Bangladeshi taka' },
  { symbol: '₹', label: '₹ — Indian rupee' },
  { symbol: '$', label: '$ — US dollar' },
  { symbol: '€', label: '€ — Euro' },
  { symbol: '£', label: '£ — Pound sterling' },
  { symbol: '₨', label: '₨ — Rupee' },
  { symbol: 'RM', label: 'RM — Malaysian ringgit' },
];

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    organizationName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    currency: '৳',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError(null);
    try {
      const { user } = await apiPost<{ user: SafeUser }>('/api/auth/signup', form);
      toast.success(`Workspace created. Welcome, ${user.name.split(' ')[0]}`);
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the workspace.');
      setBusy(false);
    }
  }

  const weak = form.password.length > 0 && form.password.length < 8;

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <Input
        label="Business name"
        name="organizationName"
        placeholder="Hok Crockeries"
        value={form.organizationName}
        onChange={(e) => set({ organizationName: e.target.value })}
        required
        autoFocus
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Your name"
          name="name"
          autoComplete="name"
          placeholder="Abdul Hoque"
          value={form.name}
          onChange={(e) => set({ name: e.target.value })}
          required
        />
        <Input
          label="Phone"
          name="phone"
          autoComplete="tel"
          placeholder="Optional"
          value={form.phone}
          onChange={(e) => set({ phone: e.target.value })}
        />
      </div>
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        placeholder="you@company.com"
        value={form.email}
        onChange={(e) => set({ email: e.target.value })}
        required
      />

      <div className="relative">
        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(e) => set({ password: e.target.value })}
          required
          className="pr-11"
          error={weak ? 'Use at least 8 characters.' : undefined}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-[34px] rounded-md p-1 muted transition hover:text-brand-600"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <Select
        label="Currency"
        name="currency"
        value={form.currency}
        onChange={(e) => set({ currency: e.target.value })}
        hint="Used for every figure. You can change it later."
      >
        {CURRENCIES.map((c) => (
          <option key={c.symbol} value={c.symbol}>
            {c.label}
          </option>
        ))}
      </Select>

      {error ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
          role="alert"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </motion.p>
      ) : null}

      <Button
        type="submit"
        loading={busy || !ready}
        disabled={!ready || weak}
        icon={<ArrowRight size={16} />}
        className="w-full"
      >
        Create workspace
      </Button>

      <p className="pt-1 text-center text-xs muted">
        You become the owner. Only the owner can see purchase cost and profit.
      </p>
    </form>
  );
}
