import { z } from 'zod';

import {
  DEMAND_STATUSES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  PRIORITIES,
  ROLES,
  SALE_STATUSES,
} from './types';

const money = z.number().finite().min(0, 'Must be zero or more.');
const qty = z.number().int('Must be a whole number.').positive('Must be at least 1.');
const isoDate = z
  .string()
  .min(1, 'Date is required.')
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Not a valid date.');
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use the YYYY-MM format.');
const email = z.string().trim().toLowerCase().email('Enter a valid email address.');
const password = z.string().min(8, 'Password must be at least 8 characters.');

/* ------------------------------------------------------------------ auth */

export const signupSchema = z.object({
  organizationName: z.string().trim().min(2, 'Enter your business name.'),
  name: z.string().trim().min(2, 'Enter your name.'),
  email,
  phone: z.string().trim().optional().default(''),
  password,
  currency: z.string().trim().min(1).max(8).default('৳'),
});

export const loginSchema = z.object({
  email: z.string().trim().min(3, 'Enter your email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export const acceptInviteSchema = z.object({
  token: z.string().trim().min(10, 'This invitation link is not valid.'),
  name: z.string().trim().min(2, 'Enter your name.'),
  phone: z.string().trim().optional().default(''),
  password,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password.'),
  newPassword: password,
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').optional(),
  phone: z.string().trim().optional(),
});

/* ------------------------------------------------------------- team */

export const inviteSchema = z.object({
  email,
  name: z.string().trim().optional().default(''),
  role: z.enum(ROLES),
  area: z.string().trim().optional(),
  monthlySalary: money.default(0),
  commissionRate: z.number().min(0).max(100).default(0),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().trim().optional(),
  role: z.enum(ROLES).optional(),
  area: z.string().trim().optional(),
  monthlySalary: money.optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  note: z.string().trim().optional(),
  active: z.boolean().optional(),
  password: password.optional(),
});

/* ------------------------------------------------------------- catalogue */

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required.'),
  icon: z.string().trim().optional(),
});

export const productSchema = z.object({
  sku: z.string().trim().min(1, 'SKU is required.'),
  name: z.string().trim().min(1, 'Product name is required.'),
  categoryId: z.string().trim().nullable().optional(),
  unit: z.string().trim().min(1).default('pcs'),
  costPrice: money.default(0),
  srPrice: money.default(0),
  marketPrice: money.default(0),
  lowStockThreshold: z.number().int().min(0).default(10),
  imageUrl: z.string().trim().optional(),
  description: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  active: z.boolean().default(true),
});

export const productUpdateSchema = productSchema.partial();

export const productImportRowSchema = z.object({
  sku: z.string().trim().optional(),
  name: z.string().trim().min(1, 'Each row needs a product name.'),
  category: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  unit: z.string().trim().optional(),
  costPrice: z.coerce.number().min(0).optional(),
  srPrice: z.coerce.number().min(0).optional(),
  marketPrice: z.coerce.number().min(0).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  imageUrl: z.string().trim().optional(),
  description: z.string().trim().optional(),
  brand: z.string().trim().optional(),
});

export const productImportSchema = z.object({
  rows: z.array(productImportRowSchema).min(1, 'The file has no rows.').max(5000, 'Import at most 5000 rows at a time.'),
  mode: z.enum(['upsert', 'insert']).default('upsert'),
  dryRun: z.boolean().default(false),
});

/* ------------------------------------------------------------- documents */

export const stockEntrySchema = z.object({
  supplier: z.string().trim().min(1, 'Supplier name is required.'),
  date: isoDate,
  items: z
    .array(z.object({ productId: z.string().min(1), qty, unitCost: money.default(0) }))
    .min(1, 'Add at least one product.'),
  extraCost: money.default(0),
  paid: money.default(0),
  invoiceNo: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

export const assignmentSchema = z.object({
  srId: z.string().min(1, 'Pick a sales rep.'),
  date: isoDate,
  items: z
    .array(z.object({ productId: z.string().min(1), qty, srRate: money.default(0) }))
    .min(1, 'Add at least one product.'),
  note: z.string().trim().optional(),
});

export const returnSchema = z.object({
  srId: z.string().min(1, 'Pick a sales rep.'),
  date: isoDate,
  items: z.array(z.object({ productId: z.string().min(1), qty })).min(1, 'Add at least one product.'),
  reason: z.string().trim().optional(),
});

export const saleSchema = z.object({
  srId: z.string().min(1).optional(),
  date: isoDate,
  shopName: z.string().trim().min(1, 'Shop name is required.'),
  customerName: z.string().trim().optional(),
  customerPhone: z.string().trim().optional(),
  area: z.string().trim().optional(),
  items: z
    .array(z.object({ productId: z.string().min(1), qty, rate: money }))
    .min(1, 'Add at least one product.'),
  discount: money.default(0),
  paid: money.default(0),
  status: z.enum(SALE_STATUSES).default('PENDING'),
  note: z.string().trim().optional(),
});

export const saleUpdateSchema = z.object({
  status: z.enum(SALE_STATUSES).optional(),
  paid: money.optional(),
  discount: money.optional(),
  note: z.string().trim().optional(),
  shopName: z.string().trim().min(1).optional(),
  area: z.string().trim().optional(),
});

export const demandSchema = z.object({
  srId: z.string().min(1).optional(),
  date: isoDate.optional(),
  items: z.array(z.object({ productId: z.string().min(1), qty })).min(1, 'Add at least one product.'),
  priority: z.enum(PRIORITIES).default('NORMAL'),
  note: z.string().trim().optional(),
});

export const demandUpdateSchema = z.object({
  status: z.enum(DEMAND_STATUSES),
  note: z.string().trim().optional(),
});

export const depositSchema = z.object({
  srId: z.string().min(1).optional(),
  amount: money.refine((v) => v > 0, 'Amount must be greater than zero.'),
  date: isoDate,
  method: z.enum(PAYMENT_METHODS).default('CASH'),
  reference: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

export const expenseSchema = z.object({
  date: isoDate,
  category: z.enum(EXPENSE_CATEGORIES),
  amount: money.refine((v) => v > 0, 'Amount must be greater than zero.'),
  title: z.string().trim().min(1, 'Give the expense a title.'),
  note: z.string().trim().optional(),
});

export const salarySchema = z.object({
  userId: z.string().min(1, 'Pick a staff member.'),
  month,
  base: money.default(0),
  commission: money.default(0),
  bonus: money.default(0),
  deduction: money.default(0),
  paidAt: isoDate.optional(),
  method: z.enum(PAYMENT_METHODS).default('CASH'),
  note: z.string().trim().optional(),
});

/* -------------------------------------------------------------- settings */

export const organizationSchema = z.object({
  name: z.string().trim().min(2).optional(),
  tagline: z.string().trim().optional(),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().optional(),
  currency: z.string().trim().min(1).max(8).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  units: z.array(z.string().trim().min(1)).min(1, 'Keep at least one unit.').optional(),
  onboarded: z.boolean().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
