'use client';

import { useState } from 'react';
import { Building2, Lock, Save, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'sonner';

import {
  Badge,
  Button,
  Card,
  CardHeader,
  ErrorState,
  Input,
  SectionTitle,
} from '@/components/ui';
import { PageTransition } from '@/components/motion/reveal';
import { useResource } from '@/hooks/useResource';
import { apiPatch } from '@/lib/client';
import { ROLE_CAPABILITIES } from '@/lib/permissions';
import { ROLE_LABEL, ROLES, type Settings } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

export default function SettingsPage() {
  const { data, error, initial, reload, setData } = useResource<{ settings: Settings }>(
    '/api/settings',
  );
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Settings | null>(null);
  const settings = form ?? data?.settings ?? null;

  const set = (patch: Partial<Settings>) => {
    if (!settings) return;
    setForm({ ...settings, ...patch });
  };

  async function save() {
    if (!settings) return;
    setBusy(true);
    try {
      const result = await apiPatch<{ settings: Settings }>('/api/settings', {
        companyName: settings.companyName,
        companyNameBn: settings.companyNameBn,
        tagline: settings.tagline,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        currency: settings.currency,
        lowStockThreshold: settings.lowStockThreshold,
      });
      setData(result);
      setForm(null);
      toast.success('Settings saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the settings.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageTransition>
      <SectionTitle
        title="সেটিংস"
        subtitle="Business details and who can see what."
        action={
          form ? (
            <Button icon={<Save size={15} />} loading={busy} onClick={save}>
              Save changes
            </Button>
          ) : null
        }
      />

      {error ? (
        <Card className="p-0">
          <ErrorState message={error} onRetry={() => void reload()} />
        </Card>
      ) : initial || !settings ? (
        <div className="space-y-4">
          <div className="skeleton h-72" />
          <div className="skeleton h-64" />
        </div>
      ) : (
        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Business details"
              subtitle="Shown on the sign-in screen and the public page"
              icon={<Building2 size={18} strokeWidth={1.7} />}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Company name (English)"
                value={settings.companyName}
                onChange={(e) => set({ companyName: e.target.value })}
              />
              <Input
                label="Company name (Bangla)"
                value={settings.companyNameBn}
                onChange={(e) => set({ companyNameBn: e.target.value })}
              />
              <Input
                label="Phone"
                value={settings.phone}
                onChange={(e) => set({ phone: e.target.value })}
              />
              <Input
                label="Email"
                value={settings.email}
                onChange={(e) => set({ email: e.target.value })}
              />
              <Input
                label="Address"
                value={settings.address}
                onChange={(e) => set({ address: e.target.value })}
                wrapperClassName="sm:col-span-2"
              />
              <Input
                label="Tagline"
                value={settings.tagline}
                onChange={(e) => set({ tagline: e.target.value })}
                wrapperClassName="sm:col-span-2"
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Defaults"
              subtitle="Applied to new products and stock alerts"
              icon={<ShieldCheck size={18} strokeWidth={1.7} />}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Currency symbol"
                value={settings.currency}
                onChange={(e) => set({ currency: e.target.value })}
                hint="Used across every figure"
              />
              <Input
                label="Default low-stock alert"
                type="number"
                min={0}
                value={settings.lowStockThreshold}
                onChange={(e) => set({ lowStockThreshold: Number(e.target.value) || 0 })}
                hint="New products start at this level"
              />
            </div>
            <p className="mt-4 text-xs muted">
              Last updated {formatDateTime(settings.updatedAt)}.
            </p>
          </Card>

          <Card>
            <CardHeader
              title="Who sees what"
              subtitle="The permission model, exactly as the server enforces it"
              icon={<Users size={18} strokeWidth={1.7} />}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {ROLES.map((role) => {
                const caps = ROLE_CAPABILITIES[role];
                const seesCost = caps.includes('cost.view');
                return (
                  <div key={role} className="rounded-2xl border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">
                        {ROLE_LABEL[role].en}
                        <span className="ml-2 text-sm muted">{ROLE_LABEL[role].bn}</span>
                      </p>
                      {seesCost ? (
                        <Badge tone="brand" icon={<Lock size={11} />}>
                          Sees cost
                        </Badge>
                      ) : (
                        <Badge tone="slate">No cost access</Badge>
                      )}
                    </div>
                    <p className="mt-2 text-xs muted">{caps.length} capabilities</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {caps.slice(0, 10).map((c) => (
                        <span
                          key={c}
                          className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[11px] muted dark:bg-white/5"
                        >
                          {c}
                        </span>
                      ))}
                      {caps.length > 10 ? (
                        <span className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[11px] muted dark:bg-white/5">
                          +{caps.length - 10} more
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-brand-800 dark:bg-brand-500/10 dark:text-brand-200">
              The purchase price is removed from every API response before it leaves the server for
              anyone without <code>cost.view</code>. That covers products, stock intake, expense
              lines and every profit figure derived from them.
            </p>
          </Card>
        </div>
      )}
    </PageTransition>
  );
}
