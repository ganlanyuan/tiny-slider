/** Response shapes returned by `/api/overview`, one per role family. */

import type { SetupState } from '@/components/dashboard/setup-checklist';
import type { TrendPoint } from '@/db/queries/finance';
import type { ExpenseCategory, SaleStatus } from '@/lib/types';

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
  invoices: number;
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
  srId: string;
  name: string;
  area: string | null;
  active: boolean;
  invoices: number;
  soldValue: number;
  collected: number;
  deposited: number;
  cashInHand: number;
  marketDue: number;
  unitsInHand: number;
  stockValueInHand: number;
  lastSaleAt: string | null;
  lastDepositAt: string | null;
}

export interface AuditEntry {
  id: string;
  userName: string;
  action: string;
  entity: string;
  createdAt: string;
}

export interface RecentSale {
  id: string;
  invoiceNo: string;
  date: string;
  shopName: string;
  total: number;
  paid: number;
  due: number;
  status: SaleStatus;
}

export interface OfficeOverview {
  role: 'ADMIN' | 'MANAGER';
  month: string;
  showCost: boolean;
  currency: string;
  setup: SetupState;
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
  topProducts: { id: string; name: string; qty: number; value: number }[];
  lowStockItems: { id: string; name: string; unit: string; inStore: number; threshold: number }[];
  activity: AuditEntry[];
}

export interface SrOverview {
  role: 'SR';
  month: string;
  showCost: false;
  currency: string;
  account: SrBoardRow | undefined;
  lifetime: SrBoardRow | undefined;
  demands: { pending: number; approved: number };
  sales: { invoices: number; delivered: number; pending: number };
  topProducts: { id: string; name: string; qty: number; value: number }[];
  recentSales: RecentSale[];
}

export interface DealerOverview {
  role: 'DEALER';
  month: string;
  showCost: false;
  currency: string;
  stock: Pick<StockBlock, 'skus' | 'unitsInStore' | 'lowStock' | 'outOfStock'>;
  categories: number;
  topProducts: { id: string; name: string; qty: number; marketPrice: number }[];
}

export type Overview = OfficeOverview | SrOverview | DealerOverview;
