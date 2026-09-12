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
  labelBn: string;
  icon: LucideIcon;
  /** Shown when the viewer holds at least one of these capabilities. */
  requires: Capability[];
  section: 'Overview' | 'Operations' | 'Money' | 'Admin';
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Overview',
    labelBn: 'ওভারভিউ',
    icon: LayoutDashboard,
    requires: ['product.view'],
    section: 'Overview',
  },
  {
    href: '/dashboard/products',
    label: 'Products',
    labelBn: 'পণ্য',
    icon: Boxes,
    requires: ['product.view'],
    section: 'Operations',
  },
  {
    href: '/dashboard/inventory',
    label: 'Store intake',
    labelBn: 'স্টোরে মাল',
    icon: PackagePlus,
    requires: ['inventory.view'],
    section: 'Operations',
  },
  {
    href: '/dashboard/assignments',
    label: 'SR challan',
    labelBn: 'এসআর চালান',
    icon: Truck,
    requires: ['assignment.view'],
    section: 'Operations',
  },
  {
    href: '/dashboard/sales',
    label: 'Sales',
    labelBn: 'বিক্রয়',
    icon: ShoppingCart,
    requires: ['sale.view.all', 'sale.view.own'],
    section: 'Operations',
  },
  {
    href: '/dashboard/demands',
    label: 'Demand',
    labelBn: 'ডিমান্ড',
    icon: ClipboardList,
    requires: ['demand.view', 'demand.create'],
    section: 'Operations',
  },
  {
    href: '/dashboard/deposits',
    label: 'Deposits',
    labelBn: 'জমা',
    icon: Wallet,
    requires: ['deposit.view.all', 'deposit.view.own'],
    section: 'Money',
  },
  {
    href: '/dashboard/expenses',
    label: 'Expenses',
    labelBn: 'খরচ',
    icon: Receipt,
    requires: ['expense.view'],
    section: 'Money',
  },
  {
    href: '/dashboard/salary',
    label: 'Payroll',
    labelBn: 'বেতন',
    icon: Banknote,
    requires: ['salary.view'],
    section: 'Money',
  },
  {
    href: '/dashboard/reports',
    label: 'Reports',
    labelBn: 'রিপোর্ট',
    icon: BarChart3,
    requires: ['report.view'],
    section: 'Money',
  },
  {
    href: '/dashboard/team',
    label: 'Team',
    labelBn: 'টিম',
    icon: Users,
    requires: ['user.view'],
    section: 'Admin',
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    labelBn: 'সেটিংস',
    icon: Settings,
    requires: ['settings.manage'],
    section: 'Admin',
  },
];

export function navForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => canAny(role, item.requires));
}

export const SECTION_ORDER = ['Overview', 'Operations', 'Money', 'Admin'] as const;
