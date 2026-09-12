/**
 * Domain model for হক ক্রোকারিজ (Hok Crockeries).
 *
 * Money is stored as a plain number in BDT (৳). Quantities are integers of the
 * product's `unit` (piece / dozen / set / carton ...).
 */

export const ROLES = ['ADMIN', 'MANAGER', 'SR', 'DEALER'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, { en: string; bn: string }> = {
  ADMIN: { en: 'Owner / Admin', bn: 'মালিক / এডমিন' },
  MANAGER: { en: 'Manager', bn: 'ম্যানেজার' },
  SR: { en: 'Sales Rep', bn: 'সেলস রিপ্রেজেন্টেটিভ' },
  DEALER: { en: 'Dealer', bn: 'ডিলার' },
};

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: Role;
  active: boolean;
  /** Territory / bazar the SR covers. */
  area?: string;
  /** Monthly base salary for SR & manager payroll. */
  monthlySalary: number;
  /** Percentage of own sales value paid as commission, e.g. 2 = 2%. */
  commissionRate: number;
  joinedAt: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

/** A user object safe to send to the browser. */
export type SafeUser = Omit<User, 'passwordHash'>;

export interface Category {
  id: string;
  name: string;
  nameBn?: string;
  slug: string;
  icon?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  nameBn?: string;
  categoryId: string;
  unit: string;
  /** Owner's purchase price. ADMIN-only — stripped for every other role. */
  costPrice: number;
  /** Rate the SR must sell at (wholesale / dealer rate). */
  srPrice: number;
  /** Suggested retail / market price. */
  marketPrice: number;
  /** Units currently sitting in the central store (not with any SR). */
  stock: number;
  lowStockThreshold: number;
  imageUrl?: string;
  description?: string;
  brand?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Product shape sent to non-admin roles — `costPrice` is removed entirely. */
export type PublicProduct = Omit<Product, 'costPrice'> & { costPrice?: number };

export interface StockEntryItem {
  productId: string;
  qty: number;
  unitCost: number;
}

/** Goods received into the central store (a purchase from a supplier). */
export interface StockEntry {
  id: string;
  invoiceNo: string;
  supplier: string;
  date: string;
  items: StockEntryItem[];
  /** Freight, labour, etc. rolled into the purchase. */
  extraCost: number;
  total: number;
  paid: number;
  note?: string;
  createdBy: string;
  createdAt: string;
}

export interface AssignmentItem {
  productId: string;
  qty: number;
  /** Rate the SR is expected to sell this line at. */
  srRate: number;
}

/** Stock handed from the central store to an SR to sell in the market. */
export interface Assignment {
  id: string;
  challanNo: string;
  srId: string;
  date: string;
  items: AssignmentItem[];
  /** Total value at SR rate — this is what the SR owes once sold. */
  totalValue: number;
  note?: string;
  createdBy: string;
  createdAt: string;
}

/** Goods an SR hands back to the store (damaged / unsold). */
export interface StockReturn {
  id: string;
  srId: string;
  date: string;
  items: { productId: string; qty: number }[];
  reason?: string;
  createdBy: string;
  createdAt: string;
}

export const SALE_STATUSES = ['PENDING', 'DELIVERED', 'CANCELLED'] as const;
export type SaleStatus = (typeof SALE_STATUSES)[number];

export interface SaleItem {
  productId: string;
  qty: number;
  /** Actual rate charged to the shop. */
  rate: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  srId: string;
  date: string;
  shopName: string;
  customerName?: string;
  customerPhone?: string;
  area?: string;
  items: SaleItem[];
  discount: number;
  total: number;
  /** Cash the SR collected at the point of sale. */
  paid: number;
  status: SaleStatus;
  deliveredAt?: string;
  note?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const DEMAND_STATUSES = ['PENDING', 'APPROVED', 'FULFILLED', 'REJECTED'] as const;
export type DemandStatus = (typeof DEMAND_STATUSES)[number];

/** An SR's request for stock they expect to sell ("ডিমান্ড"). */
export interface Demand {
  id: string;
  srId: string;
  date: string;
  items: { productId: string; qty: number }[];
  status: DemandStatus;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  note?: string;
  handledBy?: string;
  handledAt?: string;
  createdAt: string;
}

export const PAYMENT_METHODS = ['CASH', 'BKASH', 'NAGAD', 'ROCKET', 'BANK'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Money an SR deposits back to the company. */
export interface Deposit {
  id: string;
  srId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  reference?: string;
  note?: string;
  receivedBy: string;
  createdAt: string;
}

export const EXPENSE_CATEGORIES = [
  'PRODUCT',
  'SALARY',
  'COMMISSION',
  'TRANSPORT',
  'RENT',
  'UTILITY',
  'MARKETING',
  'MAINTENANCE',
  'OTHER',
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_LABEL: Record<ExpenseCategory, { en: string; bn: string }> = {
  PRODUCT: { en: 'Product purchase', bn: 'পণ্য ক্রয়' },
  SALARY: { en: 'Salary', bn: 'বেতন' },
  COMMISSION: { en: 'Commission', bn: 'কমিশন' },
  TRANSPORT: { en: 'Transport', bn: 'পরিবহন' },
  RENT: { en: 'Rent', bn: 'ভাড়া' },
  UTILITY: { en: 'Utility', bn: 'ইউটিলিটি' },
  MARKETING: { en: 'Marketing', bn: 'মার্কেটিং' },
  MAINTENANCE: { en: 'Maintenance', bn: 'রক্ষণাবেক্ষণ' },
  OTHER: { en: 'Other', bn: 'অন্যান্য' },
};

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  title: string;
  note?: string;
  /** Set when the expense was generated from a purchase or a salary payment. */
  refType?: 'STOCK_ENTRY' | 'SALARY' | 'MANUAL';
  refId?: string;
  createdBy: string;
  createdAt: string;
}

export interface SalaryPayment {
  id: string;
  userId: string;
  /** YYYY-MM the salary is for. */
  month: string;
  base: number;
  commission: number;
  bonus: number;
  deduction: number;
  total: number;
  paidAt: string;
  method: PaymentMethod;
  note?: string;
  paidBy: string;
  createdAt: string;
}

export interface Settings {
  companyName: string;
  companyNameBn: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  lowStockThreshold: number;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface Database {
  users: User[];
  categories: Category[];
  products: Product[];
  stockEntries: StockEntry[];
  assignments: Assignment[];
  returns: StockReturn[];
  sales: Sale[];
  demands: Demand[];
  deposits: Deposit[];
  expenses: Expense[];
  salaries: SalaryPayment[];
  auditLogs: AuditLog[];
  settings: Settings;
}
