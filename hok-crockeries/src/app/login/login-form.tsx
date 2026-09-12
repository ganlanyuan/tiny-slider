'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';

import { Button, Input } from '@/components/ui';
import { apiPost } from '@/lib/client';
import type { SafeUser } from '@/lib/types';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Until React hydrates, a click would submit the form natively and put the
  // password in the URL as a query string. Keep submit disabled until then.
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError(null);
    try {
      const { user } = await apiPost<{ user: SafeUser }>('/api/auth/login', { email, password });
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
    </form>
  );
}
