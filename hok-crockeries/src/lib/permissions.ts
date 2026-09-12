import type { Role } from './types';

/** The shape any product-like payload must have for cost stripping to apply. */
export interface CostBearing {
  costPrice?: number;
  [key: string]: unknown;
}

/**
 * Capability list. Keeping permissions as named capabilities (rather than
 * scattering `role === 'ADMIN'` checks) means the API routes, the navigation
 * and the UI all agree on who may do what.
 */
export const CAPABILITIES = [
  'product.view',
  'product.manage',
  'product.import',
  'cost.view', // <- the owner's purchase price. ADMIN only, by design.
  'inventory.view',
  'inventory.manage',
  'assignment.view',
  'assignment.manage',
  'sale.view.all',
  'sale.view.own',
  'sale.create',
  'sale.manage',
  'demand.view',
  'demand.create',
  'demand.manage',
  'deposit.view.all',
  'deposit.view.own',
  'deposit.create',
  'deposit.receive',
  'expense.view',
  'expense.manage',
  'salary.view',
  'salary.manage',
  'user.view',
  'user.manage',
  'report.view',
  'report.profit', // profit needs cost price, so ADMIN only.
  'settings.manage',
] as const;

export type Capability = (typeof CAPABILITIES)[number];

const MANAGER_CAPS: Capability[] = [
  'product.view',
  'product.manage',
  'product.import',
  'inventory.view',
  'inventory.manage',
  'assignment.view',
  'assignment.manage',
  'sale.view.all',
  'sale.create',
  'sale.manage',
  'demand.view',
  'demand.manage',
  'deposit.view.all',
  'deposit.receive',
  'expense.view',
  'expense.manage',
  'salary.view',
  'user.view',
  'report.view',
];

const SR_CAPS: Capability[] = [
  'product.view',
  'sale.view.own',
  'sale.create',
  'demand.create',
  'deposit.view.own',
  'deposit.create',
];

const DEALER_CAPS: Capability[] = ['product.view'];

export const ROLE_CAPABILITIES: Record<Role, readonly Capability[]> = {
  // The owner holds every capability, including the two cost-bearing ones.
  ADMIN: CAPABILITIES,
  MANAGER: MANAGER_CAPS,
  SR: SR_CAPS,
  DEALER: DEALER_CAPS,
};

export function can(role: Role | undefined, capability: Capability): boolean {
  if (!role) return false;
  return ROLE_CAPABILITIES[role].includes(capability);
}

export function canAny(role: Role | undefined, capabilities: Capability[]): boolean {
  return capabilities.some((c) => can(role, c));
}

/**
 * Strip the owner's purchase price unless the viewer is allowed to see it.
 * Every route that returns a product must pass it through here — an SR or a
 * dealer must never receive `costPrice`, not even as a hidden field set to zero.
 */
export function visibleProduct<T extends CostBearing>(
  product: T,
  role: Role | undefined,
): Omit<T, 'costPrice'> & { costPrice?: number } {
  if (can(role, 'cost.view')) return product;
  const { costPrice: _costPrice, ...rest } = product;
  return rest;
}

export function visibleProducts<T extends CostBearing>(
  products: T[],
  role: Role | undefined,
): (Omit<T, 'costPrice'> & { costPrice?: number })[] {
  return products.map((p) => visibleProduct(p, role));
}

/** Scrub cost-derived numbers from any payload heading to a non-owner. */
export function stripCostFields<T extends Record<string, unknown>>(
  payload: T,
  role: Role | undefined,
): T {
  if (can(role, 'cost.view')) return payload;
  const clone = { ...payload } as Record<string, unknown>;
  for (const key of ['costPrice', 'totalCost', 'grossProfit', 'netProfit', 'margin', 'stockCostValue']) {
    delete clone[key];
  }
  return clone as T;
}
