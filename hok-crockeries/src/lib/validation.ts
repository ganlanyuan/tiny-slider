import { z } from 'zod';

import {
  DEMAND_STATUSES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  ROLES,
  SALE_STATUSES,
} from './types';

const money = z.number().finite().min(0, 'Must be zero or more.');
const qty = z.number().int('Must be a whole number.').positive('Must be at least 1.');
const isoDate = z
  .string()
  .min(1, 'Date is required.')
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Not a valid date.');
const monthStr = z.string().regex(/^\d{4}-\d{2}$/, 'Use the YYYY-MM format.');

export const loginSchema = z.object({
  phone: z.string().trim().min(3, 'Enter your phone number or email.'),
  password: z.string().min(4, 'Password must be at least 4 characters.'),
});

export const userCreateSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.'),
  phone: z.string().trim().min(6, 'A valid phone number is required.'),
  email: z.string().trim().email('Not a valid email.').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  role: z.enum(ROLES),
  area: z.string().trim().optional(),
  monthlySalary: money.default(0),
  commissionRate: z.number().min(0).max(100).default(0),
  joinedAt: isoDate.optional(),
  note: z.string().trim().optional(),
});

export const userUpdateSchema = userCreateSchema
  .partial()
  .omit({ password: true })
  .extend({
    password: z.string().min(6, 'Password must be at least 6 characters.').optional(),
    active: z.boolean().optional(),
  });

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required.'),
  nameBn: z.string().trim().optional(),
  icon: z.string().trim().optional(),
});

export const productSchema = z.object({
  sku: z.string().trim().min(1, 'SKU is required.'),
  name: z.string().trim().min(1, 'Product name is required.'),
  nameBn: z.string().trim().optional(),
  categoryId: z.string().trim().min(1, 'Pick a category.'),
  unit: z.string().trim().default('pcs'),
  costPrice: money.default(0),
  srPrice: money.default(0),
  marketPrice: money.default(0),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(10),
  imageUrl: z.string().trim().optional(),
  description: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  active: z.boolean().default(true),
});

export const productUpdateSchema = productSchema.partial();

/**
 * Import payload. Shaped loosely on purpose: the importer accepts the columns a
 * real price list tends to carry and maps aliases before validating.
 */
export const productImportRowSchema = z.object({
  sku: z.string().trim().optional(),
  name: z.string().trim().min(1, 'Each row needs a product name.'),
  nameBn: z.string().trim().optional(),
  category: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  unit: z.string().trim().optional(),
  costPrice: z.coerce.number().min(0).optional(),
  srPrice: z.coerce.number().min(0).optional(),
  marketPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  imageUrl: z.string().trim().optional(),
  description: z.string().trim().optional(),
  brand: z.string().trim().optional(),
});

export const productImportSchema = z.object({
  rows: z.array(productImportRowSchema).min(1, 'The file has no rows.'),
  /** Update an existing product when the SKU or name already exists. */
  mode: z.enum(['upsert', 'insert']).default('upsert'),
  dryRun: z.boolean().default(false),
});

export const stockEntrySchema = z.object({
  supplier: z.string().trim().min(1, 'Supplier name is required.'),
  date: isoDate,
  items: z
    .array(z.object({ productId: z.string().min(1), qty, unitCost: money }))
    .min(1, 'Add at least one product.'),
  extraCost: money.default(0),
  paid: money.default(0),
  invoiceNo: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

export const assignmentSchema = z.object({
  srId: z.string().min(1, 'Pick an SR.'),
  date: isoDate,
  items: z
    .array(z.object({ productId: z.string().min(1), qty, srRate: money }))
    .min(1, 'Add at least one product.'),
  note: z.string().trim().optional(),
});

export const returnSchema = z.object({
  srId: z.string().min(1, 'Pick an SR.'),
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
  priority: z.enum(['LOW', 'NORMAL', 'HIGH']).default('NORMAL'),
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
  month: monthStr,
  base: money.default(0),
  commission: money.default(0),
  bonus: money.default(0),
  deduction: money.default(0),
  paidAt: isoDate.optional(),
  method: z.enum(PAYMENT_METHODS).default('CASH'),
  note: z.string().trim().optional(),
});

export const settingsSchema = z.object({
  companyName: z.string().trim().min(1),
  companyNameBn: z.string().trim().min(1),
  tagline: z.string().trim().optional(),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().optional(),
  currency: z.string().trim().min(1).default('৳'),
  lowStockThreshold: z.number().int().min(0).default(10),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductImportRow = z.infer<typeof productImportRowSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
export type StockEntryInput = z.infer<typeof stockEntrySchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type DepositInput = z.infer<typeof depositSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type SalaryInput = z.infer<typeof salarySchema>;
