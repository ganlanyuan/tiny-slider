'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Button, Input, Spinner } from '@/components/ui';
import { apiGet, apiPost } from '@/lib/client';
import { ROLE_DESCRIPTION, ROLE_LABEL, type Role, type SafeUser } from '@/lib/types';

interface InviteDetails {
  email: string;
  name: string;
  role: Role;
  organizationName: string;
}

export function AcceptInviteForm({ token }: { token: string }) {
  const router = useRouter();
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiGet<InviteDetails>(`/api/auth/accept-invite?token=${encodeURIComponent(token)}`)
      .then((details) => {
        if (cancelled) return;
        setInvite(details);
        setForm((f) => ({ ...f, name: details.name }));
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'This invitation is not valid.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { user } = await apiPost<{ user: SafeUser }>('/api/auth/accept-invite', {
        token,
        ...form,
      });
      toast.success(`Welcome to the team, ${user.name.split(' ')[0]}`);
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete sign-up.');
      setBusy(false);
    }
  }

  if (loadError) {
    return (
      <div className="mt-8 rounded-xl bg-rose-50 px-4 py-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
        <p className="flex items-start gap-2 font-medium">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {loadError}
        </p>
        <p className="mt-2 leading-relaxed opacity-80">
          Ask the workspace owner to send you a fresh invitation link.
        </p>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="mt-8 flex items-center gap-2 text-sm muted">
        <Spinner /> Checking your invitation…
      </div>
    );
  }

  const weak = form.password.length > 0 && form.password.length < 8;

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div className="rounded-xl border bg-brand-50/60 px-4 py-3 text-sm dark:bg-brand-500/10">
        <p className="font-medium">{invite.organizationName}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs muted">
          <Mail size={12} /> {invite.email}
        </p>
        <p className="mt-2 flex items-start gap-1.5 text-xs">
          <ShieldCheck size={13} className="mt-0.5 shrink-0 text-brand-600" />
          <span>
            <span className="font-medium">{ROLE_LABEL[invite.role]}</span>
            <span className="block muted">{ROLE_DESCRIPTION[invite.role]}</span>
          </span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Your name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <Input
          label="Phone"
          placeholder="Optional"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
      </div>

      <div className="relative">
        <Input
          label="Choose a password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
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
        loading={busy}
        disabled={weak}
        icon={<ArrowRight size={16} />}
        className="w-full"
      >
        Join {invite.organizationName}
      </Button>
    </form>
  );
}
