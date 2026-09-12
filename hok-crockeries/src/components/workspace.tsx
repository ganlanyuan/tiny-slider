'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { money as formatMoney, moneyShort as formatMoneyShort } from '@/lib/utils';
import type { Capability } from '@/lib/permissions';
import type { OrgSummary, Role, SafeUser } from '@/lib/types';

interface WorkspaceValue {
  user: SafeUser;
  org: OrgSummary;
  role: Role;
  capabilities: string[];
  /** True when the signed-in role may see purchase cost and derived figures. */
  showCost: boolean;
  can: (capability: Capability) => boolean;
  /** Formats with the workspace's own currency symbol. */
  money: (value: number | undefined | null) => string;
  moneyShort: (value: number | undefined | null) => string;
  setOrg: (org: OrgSummary) => void;
  setUser: (user: SafeUser) => void;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

/**
 * Holds the signed-in user, their workspace and their capabilities.
 *
 * Seeded from the server on first render so the dashboard never flashes an
 * empty shell, and updatable from the client so a settings change (currency,
 * business name) is reflected everywhere at once without a reload.
 */
export function WorkspaceProvider({
  initialUser,
  initialOrg,
  capabilities,
  children,
}: {
  initialUser: SafeUser;
  initialOrg: OrgSummary;
  capabilities: string[];
  children: React.ReactNode;
}) {
  const [user, setUser] = useState(initialUser);
  const [org, setOrg] = useState(initialOrg);

  const can = useCallback(
    (capability: Capability) => capabilities.includes(capability),
    [capabilities],
  );

  const value = useMemo<WorkspaceValue>(
    () => ({
      user,
      org,
      role: user.role,
      capabilities,
      showCost: capabilities.includes('cost.view'),
      can,
      money: (v) => formatMoney(v, org.currency),
      moneyShort: (v) => formatMoneyShort(v, org.currency),
      setOrg,
      setUser,
    }),
    [user, org, capabilities, can],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used inside the dashboard layout.');
  }
  return ctx;
}
