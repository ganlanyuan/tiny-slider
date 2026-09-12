'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Check,
  Copy,
  Eye,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Trash2,
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
  CardHeader,
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
import { useWorkspace } from '@/components/workspace';
import { useResource } from '@/hooks/useResource';
import { apiDelete, apiPatch, apiPost } from '@/lib/client';
import { ROLE_DESCRIPTION, ROLE_LABEL, ROLES, type Role, type SafeUser } from '@/lib/types';
import { avatarTone, cn, formatDate, initials, percent } from '@/lib/utils';

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
  counts: { total: number; active: number; sr: number; manager: number; dealer: number };
}

interface Invitation {
  id: string;
  email: string;
  name: string;
  role: Role;
  token: string;
  expiresAt: string;
  expired: boolean;
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

function inviteUrl(token: string): string {
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  return `${origin}/invite/${token}`;
}

export default function TeamPage() {
  const { money, can } = useWorkspace();
  const [roleFilter, setRoleFilter] = useState('');
  const [inviting, setInviting] = useState(false);
  const [editing, setEditing] = useState<TeamUser | null>(null);

  const canManage = can('user.manage');
  const { data, error, initial, reload } = useResource<UsersResponse>(
    `/api/users${roleFilter ? `?role=${roleFilter}` : ''}`,
  );
  const invites = useResource<{ invitations: Invitation[] }>(
    canManage ? '/api/invitations' : null,
  );

  const users = data?.users ?? [];

  return (
    <PageTransition>
      <SectionTitle
        title="Team"
        subtitle="Owners, managers, sales reps and dealers in this workspace."
        action={
          canManage ? (
            <Button size="sm" icon={<Send size={15} />} onClick={() => setInviting(true)}>
              Invite someone
            </Button>
          ) : null
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Accounts" value={data?.counts.total ?? 0} icon={<Users size={15} />} />
        <Tile label="Active" value={data?.counts.active ?? 0} icon={<UserCheck size={15} />} />
        <Tile label="Sales reps" value={data?.counts.sr ?? 0} icon={<Users size={15} />} />
        <Tile label="Dealers" value={data?.counts.dealer ?? 0} icon={<Eye size={15} />} />
      </div>

      {/* pending invitations */}
      {canManage && (invites.data?.invitations.length ?? 0) > 0 ? (
        <Card className="mb-5">
          <CardHeader
            title="Pending invitations"
            subtitle="Share the link — it works once, then expires"
            icon={<Mail size={18} strokeWidth={1.7} />}
          />
          <div className="space-y-2">
            {invites.data!.invitations.map((invite) => (
              <InviteRow
                key={invite.id}
                invite={invite}
                onRevoked={() => void invites.reload()}
              />
            ))}
          </div>
        </Card>
      ) : null}

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
              {ROLE_LABEL[r]}
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
          <TableSkeleton rows={4} cols={4} />
        </Card>
      ) : users.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={<UserPlus size={22} strokeWidth={1.5} />}
            title="Nobody here yet"
            description="Invite a sales rep and issue them a challan to get started."
            action={
              canManage ? (
                <Button icon={<Send size={15} />} onClick={() => setInviting(true)}>
                  Invite someone
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
                      className="block truncate font-medium hover:text-brand-600"
                    >
                      {user.name}
                    </Link>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs muted">
                      <Mail size={11} /> {user.email}
                    </p>
                  </div>
                  <Badge tone={ROLE_TONE[user.role]} icon={<Icon size={12} strokeWidth={1.8} />}>
                    {ROLE_LABEL[user.role]}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm muted">
                  {user.phone ? (
                    <span className="flex items-center gap-1.5">
                      <Phone size={12} /> {user.phone}
                    </span>
                  ) : null}
                  {user.area ? (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={12} /> {user.area}
                    </span>
                  ) : null}
                </div>

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
        <>
          <InviteModal
            open={inviting}
            onClose={() => setInviting(false)}
            onSent={() => {
              setInviting(false);
              void invites.reload();
            }}
          />
          <EditMemberModal
            user={editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              void reload();
            }}
          />
        </>
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
      <dd className={`tabular truncate font-medium ${warn ? 'text-rose-600 dark:text-rose-400' : ''}`}>
        {value}
      </dd>
    </div>
  );
}

/* ------------------------------------------------------------- invitations */

function CopyLinkButton({ token, label = 'Copy link' }: { token: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = inviteUrl(token);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Invitation link copied.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be blocked; showing the URL still lets them copy.
      toast.message('Copy this link', { description: url });
    }
  }

  return (
    <Button
      size="sm"
      variant={copied ? 'subtle' : 'ghost'}
      icon={copied ? <Check size={14} /> : <Copy size={14} />}
      onClick={copy}
    >
      {copied ? 'Copied' : label}
    </Button>
  );
}

function InviteRow({ invite, onRevoked }: { invite: Invitation; onRevoked: () => void }) {
  const [busy, setBusy] = useState(false);

  async function revoke() {
    setBusy(true);
    try {
      await apiDelete(`/api/invitations/${invite.id}`);
      toast.success('Invitation revoked.');
      onRevoked();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not revoke the invitation.');
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{invite.email}</p>
        <p className="text-xs muted">
          {ROLE_LABEL[invite.role]} ·{' '}
          {invite.expired ? 'expired' : `expires ${formatDate(invite.expiresAt)}`}
        </p>
      </div>
      {invite.expired ? <Badge tone="rose">Expired</Badge> : <Badge tone="amber">Pending</Badge>}
      {!invite.expired ? <CopyLinkButton token={invite.token} /> : null}
      <button
        type="button"
        onClick={revoke}
        disabled={busy}
        aria-label={`Revoke invitation for ${invite.email}`}
        className="rounded-lg p-1.5 muted transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-500/10"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function InviteModal({
  open,
  onClose,
  onSent,
}: {
  open: boolean;
  onClose: () => void;
  onSent: () => void;
}) {
  const blank = {
    email: '',
    name: '',
    role: 'SR' as Role,
    area: '',
    monthlySalary: 0,
    commissionRate: 0,
  };
  const [form, setForm] = useState({ ...blank });
  const [busy, setBusy] = useState(false);
  const [sentToken, setSentToken] = useState<string | null>(null);

  const set = (patch: Partial<typeof blank>) => setForm((f) => ({ ...f, ...patch }));

  async function send() {
    setBusy(true);
    try {
      const { token } = await apiPost<{ token: string }>('/api/users', form);
      setSentToken(token);
      toast.success('Invitation created.');
      onSent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create the invitation.');
    } finally {
      setBusy(false);
    }
  }

  function close() {
    setForm({ ...blank });
    setSentToken(null);
    onClose();
  }

  const paid = form.role === 'SR' || form.role === 'MANAGER';

  return (
    <Modal
      open={open}
      onClose={close}
      wide
      title={sentToken ? 'Invitation ready' : 'Invite someone'}
      subtitle={
        sentToken
          ? 'Send them this link — it works once and expires in 14 days.'
          : 'They choose their own password when they accept.'
      }
      footer={
        sentToken ? (
          <Button onClick={close}>Done</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button onClick={send} loading={busy} disabled={!form.email.includes('@')}>
              Create invitation
            </Button>
          </>
        )
      }
    >
      {sentToken ? (
        <div className="space-y-4">
          <div className="rounded-xl border bg-ink-50 px-4 py-3 dark:bg-white/5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide muted">
              Invitation link
            </p>
            <p className="break-all font-mono text-xs">{inviteUrl(sentToken)}</p>
          </div>
          <CopyLinkButton token={sentToken} label="Copy invitation link" />
          <p className="text-xs leading-relaxed muted">
            This app does not send email itself — pass the link on however you normally reach your
            team. You can copy it again later from the pending invitations list, or revoke it.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => set({ email: e.target.value })}
              placeholder="rep@company.com"
              required
            />
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="Optional — they can set it themselves"
            />
            <Select
              label="Role"
              value={form.role}
              onChange={(e) => set({ role: e.target.value as Role })}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </Select>
            <Input
              label="Area / territory"
              value={form.area}
              onChange={(e) => set({ area: e.target.value })}
              placeholder="Sadar Bazar & Station Road"
            />
          </div>

          <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-brand-800 dark:bg-brand-500/10 dark:text-brand-200">
            {ROLE_DESCRIPTION[form.role]}
          </p>

          {paid ? (
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
                {form.role === 'SR' ? (
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
        </>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------ edit member */

function EditMemberModal({
  user,
  onClose,
  onSaved,
}: {
  user: TeamUser | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const blank = {
    name: '',
    phone: '',
    role: 'SR' as Role,
    area: '',
    monthlySalary: 0,
    commissionRate: 0,
    note: '',
    active: true,
    password: '',
  };
  const [form, setForm] = useState({ ...blank });
  const [busy, setBusy] = useState(false);
  const [seeded, setSeeded] = useState<string | null>(null);

  if (user && seeded !== user.id) {
    setSeeded(user.id);
    setForm({
      name: user.name,
      phone: user.phone,
      role: user.role,
      area: user.area ?? '',
      monthlySalary: user.monthlySalary,
      commissionRate: user.commissionRate,
      note: user.note ?? '',
      active: user.active,
      password: '',
    });
  }
  if (!user && seeded !== null) setSeeded(null);

  const set = (patch: Partial<typeof blank>) => setForm((f) => ({ ...f, ...patch }));

  async function save() {
    if (!user) return;
    setBusy(true);
    try {
      await apiPatch(`/api/users/${user.id}`, {
        name: form.name,
        phone: form.phone,
        role: form.role,
        area: form.area || undefined,
        monthlySalary: form.monthlySalary,
        commissionRate: form.commissionRate,
        note: form.note || undefined,
        active: form.active,
        ...(form.password ? { password: form.password } : {}),
      });
      toast.success(`${form.name} updated.`);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the changes.');
    } finally {
      setBusy(false);
    }
  }

  async function deactivate() {
    if (!user) return;
    setBusy(true);
    try {
      await apiDelete(`/api/users/${user.id}`);
      toast.success(`${user.name} can no longer sign in.`);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not deactivate the account.');
    } finally {
      setBusy(false);
    }
  }

  const paid = form.role === 'SR' || form.role === 'MANAGER';

  return (
    <Modal
      open={Boolean(user)}
      onClose={onClose}
      wide
      title={user ? `Edit ${user.name}` : 'Edit team member'}
      subtitle={user ? user.email : undefined}
      footer={
        <>
          {user?.active ? (
            <Button variant="danger" onClick={deactivate} disabled={busy} className="mr-auto">
              Deactivate
            </Button>
          ) : null}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={busy} disabled={!form.name}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" value={form.name} onChange={(e) => set({ name: e.target.value })} />
        <Input label="Phone" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
        <Select
          label="Role"
          value={form.role}
          onChange={(e) => set({ role: e.target.value as Role })}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </Select>
        <Input label="Area" value={form.area} onChange={(e) => set({ area: e.target.value })} />
      </div>

      {paid ? (
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
            {form.role === 'SR' ? (
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

      <div className="mt-4">
        <Input
          label="Reset password"
          type="password"
          value={form.password}
          onChange={(e) => set({ password: e.target.value })}
          placeholder="Leave blank to keep their current password"
          hint="Use this only when someone is locked out."
        />
      </div>

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
    </Modal>
  );
}
