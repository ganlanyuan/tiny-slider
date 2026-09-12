'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Eye,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  SectionTitle,
  Select,
  TableSkeleton,
  Textarea,
} from '@/components/ui';
import { PageTransition } from '@/components/motion/reveal';
import { useResource } from '@/hooks/useResource';
import { apiPatch, apiPost } from '@/lib/client';
import { ROLE_LABEL, ROLES, type Role, type SafeUser } from '@/lib/types';
import { avatarTone, cn, formatDate, initials, money, percent } from '@/lib/utils';

interface TeamUser extends SafeUser {
  account: {
    soldValue: number;
    collected: number;
    deposited: number;
    cashInHand: number;
    marketDue: number;
    unitsInHand: number;
    stockValueInHand: number;
    invoices: number;
  } | null;
}

interface UsersResponse {
  users: TeamUser[];
  canManage: boolean;
  counts: { total: number; active: number; sr: number; dealer: number };
}

const ROLE_TONE: Record<Role, 'brand' | 'violet' | 'green' | 'amber'> = {
  ADMIN: 'brand',
  MANAGER: 'violet',
  SR: 'green',
  DEALER: 'amber',
};

const ROLE_ICON: Record<Role, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  ADMIN: ShieldCheck,
  MANAGER: UserCheck,
  SR: Users,
  DEALER: Eye,
};

export default function TeamPage() {
  const [roleFilter, setRoleFilter] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TeamUser | null>(null);

  const { data, error, initial, reload } = useResource<UsersResponse>(
    `/api/users${roleFilter ? `?role=${roleFilter}` : ''}`,
  );

  const users = data?.users ?? [];
  const canManage = data?.canManage ?? false;

  return (
    <PageTransition>
      <SectionTitle
        title="টিম"
        subtitle="Owner, manager, sales reps and dealers."
        action={
          canManage ? (
            <Button size="sm" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
              Add member
            </Button>
          ) : null
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Total accounts" value={data?.counts.total ?? 0} icon={<Users size={15} />} />
        <Tile label="Active" value={data?.counts.active ?? 0} icon={<UserCheck size={15} />} />
        <Tile label="Sales reps" value={data?.counts.sr ?? 0} icon={<Users size={15} />} />
        <Tile label="Dealers" value={data?.counts.dealer ?? 0} icon={<Eye size={15} />} />
      </div>

      <Card className="mb-5 p-4">
        <Select
          label="Filter by role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          wrapperClassName="w-full sm:w-64"
        >
          <option value="">Everyone</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r].en} — {ROLE_LABEL[r].bn}
            </option>
          ))}
        </Select>
      </Card>

      {error ? (
        <Card className="p-0">
          <ErrorState message={error} onRetry={() => void reload()} />
        </Card>
      ) : initial ? (
        <Card className="p-0">
          <TableSkeleton rows={5} cols={4} />
        </Card>
      ) : users.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={<UserPlus size={22} strokeWidth={1.5} />}
            title="Nobody here yet"
            description="Add a sales rep and issue them a challan to get started."
            action={
              canManage ? (
                <Button icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                  Add member
                </Button>
              ) : null
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {users.map((user, i) => {
            const Icon = ROLE_ICON[user.role];
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className={`card p-5 transition hover:shadow-lift ${user.active ? '' : 'opacity-60'}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-semibold',
                      avatarTone(user.id),
                    )}
                  >
                    {initials(user.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/team/${user.id}`}
                      className="truncate font-medium hover:text-brand-600"
                    >
                      {user.name}
                    </Link>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs muted">
                      <Phone size={11} /> {user.phone}
                    </p>
                  </div>
                  <Badge tone={ROLE_TONE[user.role]} icon={<Icon size={12} strokeWidth={1.8} />}>
                    {ROLE_LABEL[user.role].en}
                  </Badge>
                </div>

                {user.area ? (
                  <p className="mt-3 flex items-center gap-1.5 text-sm muted">
                    <MapPin size={13} /> {user.area}
                  </p>
                ) : null}

                {user.account ? (
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-4 text-sm">
                    <Stat label="Sold" value={money(user.account.soldValue)} />
                    <Stat label="Invoices" value={String(user.account.invoices)} />
                    <Stat
                      label="Cash in hand"
                      value={money(user.account.cashInHand)}
                      warn={user.account.cashInHand > 0}
                    />
                    <Stat label="Stock held" value={money(user.account.stockValueInHand)} />
                  </dl>
                ) : (
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-4 text-sm">
                    <Stat label="Salary" value={money(user.monthlySalary)} />
                    <Stat label="Joined" value={formatDate(user.joinedAt)} />
                  </dl>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={`/dashboard/team/${user.id}`}
                    className="btn-ghost flex-1 justify-center py-2 text-xs"
                  >
                    View details
                  </Link>
                  {canManage ? (
                    <Button size="sm" variant="subtle" onClick={() => setEditing(user)}>
                      Edit
                    </Button>
                  ) : null}
                </div>

                {!user.active ? (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                    <UserX size={13} /> Deactivated — cannot sign in
                  </p>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      )}

      {canManage ? (
        <MemberModal
          open={creating || Boolean(editing)}
          user={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            void reload();
          }}
        />
      ) : null}
    </PageTransition>
  );
}

function Tile({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="card flex items-center gap-3 p-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs muted">{label}</p>
        <p className="tabular truncate font-display font-semibold">{value}</p>
      </div>
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <dt className="text-xs muted">{label}</dt>
      <dd
        className={`tabular truncate font-medium ${
          warn ? 'text-rose-600 dark:text-rose-400' : ''
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function MemberModal({
  open,
  user,
  onClose,
  onSaved,
}: {
  open: boolean;
  user: TeamUser | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const blank = {
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'SR' as Role,
    area: '',
    monthlySalary: 0,
    commissionRate: 0,
    note: '',
    active: true,
  };
  const [form, setForm] = useState({ ...blank });
  const [busy, setBusy] = useState(false);
  const [seeded, setSeeded] = useState<string | null>(null);

  const targetId = user?.id ?? 'new';
  if (open && seeded !== targetId) {
    setSeeded(targetId);
    setForm(
      user
        ? {
            name: user.name,
            phone: user.phone,
            email: user.email ?? '',
            password: '',
            role: user.role,
            area: user.area ?? '',
            monthlySalary: user.monthlySalary,
            commissionRate: user.commissionRate,
            note: user.note ?? '',
            active: user.active,
          }
        : { ...blank },
    );
  }
  if (!open && seeded !== null) setSeeded(null);

  const set = (patch: Partial<typeof blank>) => setForm((f) => ({ ...f, ...patch }));

  async function save() {
    setBusy(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        role: form.role,
        area: form.area || undefined,
        monthlySalary: form.monthlySalary,
        commissionRate: form.commissionRate,
        note: form.note || undefined,
      };
      if (user) {
        await apiPatch(`/api/users/${user.id}`, {
          ...payload,
          active: form.active,
          ...(form.password ? { password: form.password } : {}),
        });
        toast.success(`${form.name} updated.`);
      } else {
        await apiPost('/api/users', { ...payload, password: form.password });
        toast.success(`${form.name} can now sign in.`);
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the member.');
    } finally {
      setBusy(false);
    }
  }

  const isSr = form.role === 'SR';

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={user ? `Edit ${user.name}` : 'Add a team member'}
      subtitle={user ? ROLE_LABEL[user.role].bn : 'নতুন সদস্য যোগ করুন'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={save}
            loading={busy}
            disabled={!form.name || !form.phone || (!user && form.password.length < 6)}
          >
            {user ? 'Save changes' : 'Create account'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Full name"
          value={form.name}
          onChange={(e) => set({ name: e.target.value })}
          required
        />
        <Select
          label="Role"
          value={form.role}
          onChange={(e) => set({ role: e.target.value as Role })}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r].en} — {ROLE_LABEL[r].bn}
            </option>
          ))}
        </Select>
        <Input
          label="Phone (used to sign in)"
          value={form.phone}
          onChange={(e) => set({ phone: e.target.value })}
          placeholder="01700000000"
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => set({ email: e.target.value })}
          placeholder="optional"
        />
        <Input
          label={user ? 'New password' : 'Password'}
          type="password"
          value={form.password}
          onChange={(e) => set({ password: e.target.value })}
          hint={user ? 'Leave blank to keep the current password' : 'At least 6 characters'}
        />
        <Input
          label="Area / territory"
          value={form.area}
          onChange={(e) => set({ area: e.target.value })}
          placeholder="Sadar Bazar & Station Road"
        />
      </div>

      {form.role === 'SR' || form.role === 'MANAGER' ? (
        <div className="mt-5 rounded-2xl border p-4">
          <p className="mb-3 text-sm font-medium">Pay</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Monthly salary"
              type="number"
              min={0}
              step="0.01"
              value={form.monthlySalary}
              onChange={(e) => set({ monthlySalary: Number(e.target.value) || 0 })}
            />
            {isSr ? (
              <Input
                label="Commission on sales"
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={form.commissionRate}
                onChange={(e) => set({ commissionRate: Number(e.target.value) || 0 })}
                hint={`${percent(form.commissionRate, 1)} of what they sell`}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <Textarea label="Note" value={form.note} onChange={(e) => set({ note: e.target.value })} />
      </div>

      {user ? (
        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set({ active: e.target.checked })}
            className="h-4 w-4 accent-brand-600"
          />
          <span className="text-sm">
            <span className="font-medium">Account is active</span>
            <span className="block text-xs muted">
              Turning this off blocks sign-in immediately, but keeps every invoice and deposit.
            </span>
          </span>
        </label>
      ) : null}

      {form.role === 'DEALER' ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          A dealer only ever sees the catalogue with market prices and availability. No costs, no
          sales figures, no editing.
        </p>
      ) : null}
      {form.role === 'SR' ? (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-xs leading-relaxed text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200">
          A sales rep sees only their own stock, invoices and cash. The purchase price is never sent
          to them.
        </p>
      ) : null}
    </Modal>
  );
}
