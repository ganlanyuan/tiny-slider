'use client';

import { useState } from 'react';
import {
  Building2,
  Coins,
  KeyRound,
  Lock,
  Plus,
  Ruler,
  Save,
  ShieldCheck,
  Tag,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Badge,
  Button,
  Card,
  CardHeader,
  ErrorState,
  Input,
  Modal,
  SectionTitle,
} from '@/components/ui';
import { PageTransition } from '@/components/motion/reveal';
import { useWorkspace } from '@/components/workspace';
import { useResource } from '@/hooks/useResource';
import { apiDelete, apiPatch, apiPost } from '@/lib/client';
import { ROLE_CAPABILITIES } from '@/lib/permissions';
import { ROLE_DESCRIPTION, ROLE_LABEL, ROLES, type OrgSummary } from '@/lib/types';

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  productCount: number;
}

export default function SettingsPage() {
  const { org, setOrg, can } = useWorkspace();
  const canManage = can('settings.manage');

  return (
    <PageTransition>
      <SectionTitle
        title="Settings"
        subtitle="Your business details, how figures are shown, and who can see what."
      />

      <div className="space-y-5">
        <BusinessCard org={org} canManage={canManage} onSaved={setOrg} />
        <UnitsCard org={org} canManage={canManage} onSaved={setOrg} />
        <CategoriesCard canManage={can('product.manage')} />
        <PasswordCard />
        <PermissionsCard />
      </div>
    </PageTransition>
  );
}

/* ------------------------------------------------------- business details */

function BusinessCard({
  org,
  canManage,
  onSaved,
}: {
  org: OrgSummary;
  canManage: boolean;
  onSaved: (org: OrgSummary) => void;
}) {
  const [form, setForm] = useState<OrgSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const current = form ?? org;
  const dirty = form !== null;

  const set = (patch: Partial<OrgSummary>) => setForm({ ...current, ...patch });

  async function save() {
    setBusy(true);
    try {
      const { organization } = await apiPatch<{ organization: OrgSummary }>('/api/settings', {
        name: current.name,
        tagline: current.tagline,
        address: current.address,
        phone: current.phone,
        email: current.email,
        currency: current.currency,
        lowStockThreshold: current.lowStockThreshold,
      });
      onSaved(organization);
      setForm(null);
      toast.success('Settings saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the settings.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Business details"
        subtitle="Shown across the app and on printed reports"
        icon={<Building2 size={18} strokeWidth={1.7} />}
        action={
          canManage && dirty ? (
            <Button size="sm" icon={<Save size={14} />} loading={busy} onClick={save}>
              Save changes
            </Button>
          ) : null
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Business name"
          value={current.name}
          onChange={(e) => set({ name: e.target.value })}
          disabled={!canManage}
        />
        <Input
          label="Phone"
          value={current.phone}
          onChange={(e) => set({ phone: e.target.value })}
          disabled={!canManage}
        />
        <Input
          label="Email"
          value={current.email}
          onChange={(e) => set({ email: e.target.value })}
          disabled={!canManage}
        />
        <Input
          label="Address"
          value={current.address}
          onChange={(e) => set({ address: e.target.value })}
          disabled={!canManage}
        />
        <Input
          label="Tagline"
          value={current.tagline}
          onChange={(e) => set({ tagline: e.target.value })}
          disabled={!canManage}
          wrapperClassName="sm:col-span-2"
        />
      </div>

      <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-2">
        <Input
          label="Currency symbol"
          value={current.currency}
          onChange={(e) => set({ currency: e.target.value })}
          disabled={!canManage}
          hint="Applied to every figure across the workspace, immediately."
        />
        <Input
          label="Default low-stock alert"
          type="number"
          min={0}
          value={current.lowStockThreshold}
          onChange={(e) => set({ lowStockThreshold: Number(e.target.value) || 0 })}
          disabled={!canManage}
          hint="New products start at this level."
        />
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ units */

function UnitsCard({
  org,
  canManage,
  onSaved,
}: {
  org: OrgSummary;
  canManage: boolean;
  onSaved: (org: OrgSummary) => void;
}) {
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  async function persist(units: string[]) {
    setBusy(true);
    try {
      const { organization } = await apiPatch<{ organization: OrgSummary }>('/api/settings', {
        units,
      });
      onSaved(organization);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update the units.');
    } finally {
      setBusy(false);
    }
  }

  const add = async () => {
    const unit = draft.trim();
    if (!unit) return;
    if (org.units.some((u) => u.toLowerCase() === unit.toLowerCase())) {
      toast.error('That unit already exists.');
      return;
    }
    setDraft('');
    await persist([...org.units, unit]);
  };

  return (
    <Card>
      <CardHeader
        title="Units of measure"
        subtitle="What your products are counted in"
        icon={<Ruler size={18} strokeWidth={1.7} />}
      />
      <div className="flex flex-wrap gap-2">
        {org.units.map((unit) => (
          <span
            key={unit}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1.5 text-sm dark:bg-white/5"
          >
            {unit}
            {canManage && org.units.length > 1 ? (
              <button
                type="button"
                aria-label={`Remove ${unit}`}
                disabled={busy}
                onClick={() => persist(org.units.filter((u) => u !== unit))}
                className="rounded-full p-0.5 muted transition hover:text-rose-600"
              >
                <X size={13} />
              </button>
            ) : null}
          </span>
        ))}
      </div>

      {canManage ? (
        <div className="mt-4 flex items-end gap-2">
          <Input
            label="Add a unit"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void add();
              }
            }}
            placeholder="carton, kg, bundle…"
            wrapperClassName="max-w-xs"
          />
          <Button
            variant="ghost"
            icon={<Plus size={15} />}
            onClick={add}
            loading={busy}
            className="h-[42px]"
          >
            Add
          </Button>
        </div>
      ) : null}

      <p className="mt-3 text-xs muted">
        Removing a unit here does not change products already using it.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------- categories */

function CategoriesCard({ canManage }: { canManage: boolean }) {
  const { data, error, reload } = useResource<{ categories: CategoryRow[] }>('/api/categories');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      await apiPost('/api/categories', { name: trimmed });
      setName('');
      toast.success(`Added ${trimmed}.`);
      void reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add the category.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(category: CategoryRow) {
    try {
      await apiDelete(`/api/categories/${category.id}`);
      toast.success(`Removed ${category.name}.`);
      void reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove the category.');
    }
  }

  return (
    <Card>
      <CardHeader
        title="Product categories"
        subtitle="Used to group and filter your catalogue"
        icon={<Tag size={18} strokeWidth={1.7} />}
      />
      {error ? (
        <ErrorState message={error} onRetry={() => void reload()} />
      ) : (
        <>
          <div className="space-y-2">
            {(data?.categories ?? []).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5"
              >
                <span className="min-w-0 truncate text-sm font-medium">{c.name}</span>
                <span className="shrink-0 text-xs muted">
                  {c.productCount} product{c.productCount === 1 ? '' : 's'}
                </span>
                {canManage ? (
                  <button
                    type="button"
                    onClick={() => remove(c)}
                    aria-label={`Remove ${c.name}`}
                    disabled={c.productCount > 0}
                    title={
                      c.productCount > 0
                        ? 'Move its products to another category first'
                        : 'Remove this category'
                    }
                    className="shrink-0 rounded-lg p-1.5 muted transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-35 dark:hover:bg-rose-500/10"
                  >
                    <Trash2 size={15} />
                  </button>
                ) : null}
              </div>
            ))}
            {(data?.categories ?? []).length === 0 ? (
              <p className="py-4 text-center text-sm muted">No categories yet.</p>
            ) : null}
          </div>

          {canManage ? (
            <div className="mt-4 flex items-end gap-2">
              <Input
                label="Add a category"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void add();
                  }
                }}
                placeholder="Glassware"
                wrapperClassName="max-w-xs"
              />
              <Button
                variant="ghost"
                icon={<Plus size={15} />}
                onClick={add}
                loading={busy}
                className="h-[42px]"
              >
                Add
              </Button>
            </div>
          ) : null}
        </>
      )}
    </Card>
  );
}

/* --------------------------------------------------------------- password */

function PasswordCard() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await apiPost('/api/auth/password', { currentPassword, newPassword });
      toast.success('Password changed.');
      setOpen(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not change the password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Your password"
          subtitle="Change the password you sign in with"
          icon={<KeyRound size={18} strokeWidth={1.7} />}
          action={
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              Change password
            </Button>
          }
        />
        <p className="text-sm muted">
          Passwords are stored hashed. Nobody, including the workspace owner, can read yours.
        </p>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Change your password"
        subtitle="You will stay signed in on this device"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={save}
              loading={busy}
              disabled={!currentPassword || newPassword.length < 8}
            >
              Change password
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            hint="At least 8 characters"
            error={
              newPassword.length > 0 && newPassword.length < 8 ? 'Too short.' : undefined
            }
          />
        </div>
      </Modal>
    </>
  );
}

/* ------------------------------------------------------------ permissions */

function PermissionsCard() {
  return (
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
                <p className="font-medium">{ROLE_LABEL[role]}</p>
                {seesCost ? (
                  <Badge tone="brand" icon={<Lock size={11} />}>
                    Sees cost
                  </Badge>
                ) : (
                  <Badge tone="slate">No cost access</Badge>
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed muted">{ROLE_DESCRIPTION[role]}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {caps.slice(0, 8).map((c) => (
                  <span
                    key={c}
                    className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[11px] muted dark:bg-white/5"
                  >
                    {c}
                  </span>
                ))}
                {caps.length > 8 ? (
                  <span className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[11px] muted dark:bg-white/5">
                    +{caps.length - 8} more
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-brand-800 dark:bg-brand-500/10 dark:text-brand-200">
        <ShieldCheck size={14} className="mt-0.5 shrink-0" />
        Purchase cost is removed from every API response before it leaves the server for anyone
        without <code>cost.view</code>. That covers products, stock intake, supplier invoice
        totals and every profit figure derived from them.
      </p>
    </Card>
  );
}
