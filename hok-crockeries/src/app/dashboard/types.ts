/** Response shapes returned by `/api/overview`, one per role family. */

import type { AuditLog, ExpenseCategory, Sale } from '@/lib/types';
import type { TrendPoint } from '@/components/dashboard/charts';

export interface FinanceBlock {
  month?: string;
  revenue: number;
  collected: number;
  marketDue: number;
  deposited: number;
  cashWithSrs: number;
  totalExpense: number;
  productExpense: number;
  salaryExpense: number;
  otherExpense: number;
  expenseByCategory: { category: ExpenseCategory; amount: number }[];
  costOfGoodsSold?: number;
  grossProfit?: number;
  netProfit?: number;
  margin?: number;
  stockCostValue?: number;
}

export interface StockBlock {
  skus: number;
  unitsInStore: number;
  unitsWithSrs: number;
  unitsReceived: number;
  unitsSold: number;
  lowStock: number;
  outOfStock: number;
  valueAtSrRate: number;
}

export interface SrBoardRow {
  id: string;
  name: string;
  area?: string;
  invoices: number;
  soldValue: number;
  collected: number;
  deposited: number;
  cashInHand: number;
  marketDue: number;
  unitsInHand: number;
  stockValueInHand: number;
  lastSaleAt?: string;
}

export interface OfficeOverview {
  role: 'ADMIN' | 'MANAGER';
  month: string;
  showCost: boolean;
  finance: FinanceBlock;
  allTime: {
    revenue: number;
    totalExpense: number;
    cashWithSrs: number;
    marketDue: number;
    netProfit?: number;
    stockCostValue?: number;
  };
  stock: StockBlock;
  trend: TrendPoint[];
  srBoard: SrBoardRow[];
  staff: {
    sr: number;
    manager: number;
    dealer: number;
    salaryBudget: number;
    paidThisMonth: number;
  };
  demands: { pending: number; unfillable: number };
  deliveries: { delivered: number; pending: number; cancelled: number };
  topProducts: { id: string; name: string; qty: number; value: number; costPrice?: number }[];
  lowStockItems: { id: string; name: string; unit: string; inStore: number; threshold: number }[];
  activity: AuditLog[];
}

export interface SrOverview {
  role: 'SR';
  month: string;
  showCost: false;
  account: {
    soldValue: number;
    collected: number;
    marketDue: number;
    deposited: number;
    cashInHand: number;
    invoices: number;
    unitsInHand: number;
    stockValueInHand: number;
    assignedValue: number;
  };
  lifetime: {
    soldValue: number;
    cashInHand: number;
    marketDue: number;
    unitsInHand: number;
    stockValueInHand: number;
  };
  demands: { pending: number; approved: number };
  sales: { invoices: number; delivered: number; pending: number };
  topProducts: { id: string; name: string; qty: number; value: number }[];
  recentSales: Sale[];
}

export interface DealerOverview {
  role: 'DEALER';
  month: string;
  showCost: false;
  stock: Pick<StockBlock, 'skus' | 'unitsInStore' | 'lowStock' | 'outOfStock'>;
  topProducts: { id: string; name: string; qty: number; marketPrice: number }[];
  categories: number;
}

export type Overview = OfficeOverview | SrOverview | DealerOverview;
