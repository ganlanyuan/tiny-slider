'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff, LogIn, Phone } from 'lucide-react';
import { toast } from 'sonner';

import { Button, Input } from '@/components/ui';
import { apiPost } from '@/lib/client';
import type { SafeUser } from '@/lib/types';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Until React has hydrated, a click would submit the form natively and put
  // the password in the URL as a query string. Keep submit disabled till then.
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError(null);
    try {
      const { user } = await apiPost<{ user: SafeUser }>('/api/auth/login', { phone, password });
      toast.success(`স্বাগতম, ${user.name}`);
      // A full navigation, so the server components pick up the new cookie.
      router.replace(next);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not sign in.';
      setError(message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <Input
        label="Phone or email"
        name="phone"
        autoComplete="username"
        inputMode="text"
        placeholder="01700000000"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        autoFocus
      />

      <div className="relative">
        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="pr-11"
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
        disabled={!ready}
        icon={<LogIn size={16} />}
        className="w-full"
      >
        Sign in
      </Button>

      <p className="flex items-center justify-center gap-1.5 pt-1 text-xs muted">
        <Phone size={13} />
        Accounts are created by the owner — there is no public sign-up.
      </p>
    </form>
  );
}
