import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  PackagePlus,
  Receipt,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  Banknote,
} from 'lucide-react';

import type { Capability } from './permissions';
import { canAny } from './permissions';
import type { Role } from './types';

export interface NavItem {
  href: string;
  label: string;
  /** One-line hint shown in the mobile drawer and tooltips. */
  hint: string;
  icon: LucideIcon;
  /** Shown when the viewer holds at least one of these capabilities. */
  requires: Capability[];
  section: 'Overview' | 'Operations' | 'Money' | 'Workspace';
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Overview',
    hint: 'Everything that moved this month',
    icon: LayoutDashboard,
    requires: ['product.view'],
    section: 'Overview',
  },
  {
    href: '/dashboard/products',
    label: 'Products',
    hint: 'Catalogue, prices and live stock',
    icon: Boxes,
    requires: ['product.view'],
    section: 'Operations',
  },
  {
    href: '/dashboard/inventory',
    label: 'Store intake',
    hint: 'Goods received from suppliers',
    icon: PackagePlus,
    requires: ['inventory.view'],
    section: 'Operations',
  },
  {
    href: '/dashboard/assignments',
    label: 'Challans',
    hint: 'Stock handed to sales reps',
    icon: Truck,
    requires: ['assignment.view'],
    section: 'Operations',
  },
  {
    href: '/dashboard/sales',
    label: 'Sales',
    hint: 'Invoices, payment and delivery',
    icon: ShoppingCart,
    requires: ['sale.view.all', 'sale.view.own'],
    section: 'Operations',
  },
  {
    href: '/dashboard/demands',
    label: 'Demand',
    hint: 'What the field is asking for',
    icon: ClipboardList,
    requires: ['demand.view', 'demand.create'],
    section: 'Operations',
  },
  {
    href: '/dashboard/deposits',
    label: 'Deposits',
    hint: 'Cash coming back from the field',
    icon: Wallet,
    requires: ['deposit.view.all', 'deposit.view.own'],
    section: 'Money',
  },
  {
    href: '/dashboard/expenses',
    label: 'Expenses',
    hint: 'Transport, rent, utilities',
    icon: Receipt,
    requires: ['expense.view'],
    section: 'Money',
  },
  {
    href: '/dashboard/salary',
    label: 'Payroll',
    hint: 'Salary and commission',
    icon: Banknote,
    requires: ['salary.view'],
    section: 'Money',
  },
  {
    href: '/dashboard/reports',
    label: 'Reports',
    hint: 'Per-product and per-rep performance',
    icon: BarChart3,
    requires: ['report.view'],
    section: 'Money',
  },
  {
    href: '/dashboard/team',
    label: 'Team',
    hint: 'Invite reps, managers and dealers',
    icon: Users,
    requires: ['user.view'],
    section: 'Workspace',
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    hint: 'Business details and preferences',
    icon: Settings,
    requires: ['settings.manage'],
    section: 'Workspace',
  },
];

export function navForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => canAny(role, item.requires));
}

export const SECTION_ORDER = ['Overview', 'Operations', 'Money', 'Workspace'] as const;
