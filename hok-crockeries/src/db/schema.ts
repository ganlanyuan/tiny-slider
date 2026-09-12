/**
 * Multi-tenant schema for Hok Crockeries.
 *
 * Every business row carries `orgId`. There is no global data: two companies
 * using the same deployment never see each other's products, invoices or staff.
 * The query layer in `src/db/queries` always filters on the caller's org, and
 * the composite unique indexes below are scoped per-org so two organisations
 * can both have a product with SKU "HC-1001".
 *
 * Money is `numeric(14,2)` read back as a JS number. Quantities are integers of
 * the product's own unit (piece / dozen / set / carton).
 */

import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

const money = (name: string) =>
  numeric(name, { precision: 14, scale: 2, mode: 'number' }).notNull().default(0);

const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp('updated_at', { withTimezone: true }).notNull().defaultNow();

/* --------------------------------------------------------- organisations */

export const organizations = pgTable(
  'organizations',
  {
    id: id(),
    name: text('name').notNull(),
    slug: varchar('slug', { length: 64 }).notNull(),
    tagline: text('tagline').notNull().default(''),
    address: text('address').notNull().default(''),
    phone: text('phone').notNull().default(''),
    email: text('email').notNull().default(''),
    /** Symbol shown beside every figure, e.g. ৳ or $. */
    currency: varchar('currency', { length: 8 }).notNull().default('৳'),
    /** Default low-stock alert level applied to new products. */
    lowStockThreshold: integer('low_stock_threshold').notNull().default(10),
    /** Units a product is measured in. Editable per organisation. */
    units: jsonb('units').$type<string[]>().notNull().default(['pcs', 'dozen', 'set', 'carton']),
    /** Cleared once the owner has finished the first-run checklist. */
    onboardedAt: timestamp('onboarded_at', { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('organizations_slug_idx').on(t.slug)],
);

/* ----------------------------------------------------------------- users */

export const ROLE_VALUES = ['ADMIN', 'MANAGER', 'SR', 'DEALER'] as const;

export const users = pgTable(
  'users',
  {
    id: id(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull().default(''),
    passwordHash: text('password_hash').notNull(),
    role: varchar('role', { length: 16 }).$type<(typeof ROLE_VALUES)[number]>().notNull(),
    active: boolean('active').notNull().default(true),
    /** Territory an SR covers. */
    area: text('area'),
    monthlySalary: money('monthly_salary'),
    /** Percent of own sales paid as commission, e.g. 2 = 2%. */
    commissionRate: numeric('commission_rate', { precision: 5, scale: 2, mode: 'number' })
      .notNull()
      .default(0),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    note: text('note'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    // Email is the sign-in handle and must be globally unique, so a single
    // address cannot belong to two organisations and make login ambiguous.
    uniqueIndex('users_email_idx').on(sql`lower(${t.email})`),
    index('users_org_idx').on(t.orgId),
    index('users_org_role_idx').on(t.orgId, t.role),
  ],
);

/* ----------------------------------------------------------- invitations */

export const invitations = pgTable(
  'invitations',
  {
    id: id(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    name: text('name').notNull().default(''),
    role: varchar('role', { length: 16 }).$type<(typeof ROLE_VALUES)[number]>().notNull(),
    area: text('area'),
    monthlySalary: money('monthly_salary'),
    commissionRate: numeric('commission_rate', { precision: 5, scale: 2, mode: 'number' })
      .notNull()
      .default(0),
    /** Random, single-use, carried in the invite link. */
    token: text('token').notNull(),
    invitedBy: text('invited_by').references(() => users.id, { onDelete: 'set null' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('invitations_token_idx').on(t.token),
    index('invitations_org_idx').on(t.orgId),
  ],
);

/* ------------------------------------------------------------ categories */

export const categories = pgTable(
  'categories',
  {
    id: id(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: varchar('slug', { length: 96 }).notNull(),
    icon: text('icon'),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('categories_org_slug_idx').on(t.orgId, t.slug),
    index('categories_org_idx').on(t.orgId),
  ],
);

/* -------------------------------------------------------------- products */

export const products = pgTable(
  'products',
  {
    id: id(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    sku: text('sku').notNull(),
    name: text('name').notNull(),
    categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
    unit: varchar('unit', { length: 32 }).notNull().default('pcs'),
    /** The owner's buying price. Stripped from every response without cost.view. */
    costPrice: money('cost_price'),
    /** The rate a sales rep must charge shops. */
    srPrice: money('sr_price'),
    /** Suggested retail price. */
    marketPrice: money('market_price'),
    lowStockThreshold: integer('low_stock_threshold').notNull().default(10),
    imageUrl: text('image_url'),
    description: text('description'),
    brand: text('brand'),
    active: boolean('active').notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('products_org_sku_idx').on(t.orgId, sql`lower(${t.sku})`),
    index('products_org_idx').on(t.orgId),
    index('products_org_active_idx').on(t.orgId, t.active),
  ],
);

/* ------------------------------------------------- stock entries (intake) */

export const stockEntries = pgTable(
  'stock_entries',
  {
    id: id(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    invoiceNo: text('invoice_no').notNull(),
    supplier: text('supplier').notNull(),
    /** Business date, not the row's insert time. */
    date: timestamp('date', { withTimezone: true }).notNull(),
    /** Freight, labour and handling folded into the purchase. */
    extraCost: money('extra_cost'),
    total: money('total'),
    paid: money('paid'),
    note: text('note'),
    createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('stock_entries_org_no_idx').on(t.orgId, t.invoiceNo),
    index('stock_entries_org_date_idx').on(t.orgId, t.date),
  ],
);

export const stockEntryItems = pgTable(
  'stock_entry_items',
  {
    id: id(),
    entryId: text('entry_id')
      .notNull()
      .references(() => stockEntries.id, { onDelete: 'cascade' }),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    qty: integer('qty').notNull(),
    unitCost: money('unit_cost'),
  },
  (t) => [
    index('stock_entry_items_entry_idx').on(t.entryId),
    index('stock_entry_items_product_idx').on(t.productId),
  ],
);

/* ------------------------------------------------- assignments (challans) */

export const assignments = pgTable(
  'assignments',
  {
    id: id(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    challanNo: text('challan_no').notNull(),
    srId: text('sr_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    date: timestamp('date', { withTimezone: true }).notNull(),
    /** Value of the goods at SR rate — what the rep is accountable for. */
    totalValue: money('total_value'),
    note: text('note'),
    createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('assignments_org_no_idx').on(t.orgId, t.challanNo),
    index('assignments_org_date_idx').on(t.orgId, t.date),
    index('assignments_sr_idx').on(t.srId),
  ],
);

export const assignmentItems = pgTable(
  'assignment_items',
  {
    id: id(),
    assignmentId: text('assignment_id')
      .notNull()
      .references(() => assignments.id, { onDelete: 'cascade' }),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    qty: integer('qty').notNull(),
    srRate: money('sr_rate'),
  },
  (t) => [
    index('assignment_items_assignment_idx').on(t.assignmentId),
    index('assignment_items_product_idx').on(t.productId),
  ],
);

/* ---------------------------------------------------------------- returns */

export const stockReturns = pgTable(
  'stock_returns',
  {
    id: id(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    srId: text('sr_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    date: timestamp('date', { withTimezone: true }).notNull(),
    reason: text('reason'),
    createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
  },
  (t) => [
    index('stock_returns_org_date_idx').on(t.orgId, t.date),
    index('stock_returns_sr_idx').on(t.srId),
  ],
);

export const stockReturnItems = pgTable(
  'stock_return_items',
  {
    id: id(),
    returnId: text('return_id')
      .notNull()
      .references(() => stockReturns.id, { onDelete: 'cascade' }),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    qty: integer('qty').notNull(),
  },
  (t) => [
    index('stock_return_items_return_idx').on(t.returnId),
    index('stock_return_items_product_idx').on(t.productId),
  ],
);

/* ------------------------------------------------------------------ sales */

export const SALE_STATUS_VALUES = ['PENDING', 'DELIVERED', 'CANCELLED'] as const;

export const sales = pgTable(
  'sales',
  {
    id: id(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    invoiceNo: text('invoice_no').notNull(),
    srId: text('sr_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    date: timestamp('date', { withTimezone: true }).notNull(),
    shopName: text('shop_name').notNull(),
    customerName: text('customer_name'),
    customerPhone: text('customer_phone'),
    area: text('area'),
    discount: money('discount'),
    total: money('total'),
    /** Cash the rep collected at the point of sale. */
    paid: money('paid'),
    status: varchar('status', { length: 16 })
      .$type<(typeof SALE_STATUS_VALUES)[number]>()
      .notNull()
      .default('PENDING'),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    note: text('note'),
    createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('sales_org_no_idx').on(t.orgId, t.invoiceNo),
    index('sales_org_date_idx').on(t.orgId, t.date),
    index('sales_sr_idx').on(t.srId),
    index('sales_org_status_idx').on(t.orgId, t.status),
  ],
);

export const saleItems = pgTable(
  'sale_items',
  {
    id: id(),
    saleId: text('sale_id')
      .notNull()
      .references(() => sales.id, { onDelete: 'cascade' }),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    qty: integer('qty').notNull(),
    rate: money('rate'),
  },
  (t) => [index('sale_items_sale_idx').on(t.saleId), index('sale_items_product_idx').on(t.productId)],
);

/* ---------------------------------------------------------------- demands */

export const DEMAND_STATUS_VALUES = ['PENDING', 'APPROVED', 'FULFILLED', 'REJECTED'] as const;
export const PRIORITY_VALUES = ['LOW', 'NORMAL', 'HIGH'] as const;

export const demands = pgTable(
  'demands',
  {
    id: id(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    srId: text('sr_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    date: timestamp('date', { withTimezone: true }).notNull(),
    status: varchar('status', { length: 16 })
      .$type<(typeof DEMAND_STATUS_VALUES)[number]>()
      .notNull()
      .default('PENDING'),
    priority: varchar('priority', { length: 8 })
      .$type<(typeof PRIORITY_VALUES)[number]>()
      .notNull()
      .default('NORMAL'),
    note: text('note'),
    handledBy: text('handled_by').references(() => users.id, { onDelete: 'set null' }),
    handledAt: timestamp('handled_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index('demands_org_status_idx').on(t.orgId, t.status),
    index('demands_sr_idx').on(t.srId),
  ],
);

export const demandItems = pgTable(
  'demand_items',
  {
    id: id(),
    demandId: text('demand_id')
      .notNull()
      .references(() => demands.id, { onDelete: 'cascade' }),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    qty: integer('qty').notNull(),
  },
  (t) => [
    index('demand_items_demand_idx').on(t.demandId),
    index('demand_items_product_idx').on(t.productId),
  ],
);

/* --------------------------------------------------------------- deposits */

export const PAYMENT_METHOD_VALUES = ['CASH', 'BKASH', 'NAGAD', 'ROCKET', 'BANK', 'CARD'] as const;

export const deposits = pgTable(
  'deposits',
  {
    id: id(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    srId: text('sr_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    amount: money('amount'),
    date: timestamp('date', { withTimezone: true }).notNull(),
    method: varchar('method', { length: 16 })
      .$type<(typeof PAYMENT_METHOD_VALUES)[number]>()
      .notNull()
      .default('CASH'),
    reference: text('reference'),
    note: text('note'),
    receivedBy: text('received_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
  },
  (t) => [
    index('deposits_org_date_idx').on(t.orgId, t.date),
    index('deposits_sr_idx').on(t.srId),
  ],
);

/* --------------------------------------------------------------- expenses */

export const EXPENSE_CATEGORY_VALUES = [
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

export const expenses = pgTable(
  'expenses',
  {
    id: id(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    date: timestamp('date', { withTimezone: true }).notNull(),
    category: varchar('category', { length: 16 })
      .$type<(typeof EXPENSE_CATEGORY_VALUES)[number]>()
      .notNull(),
    amount: money('amount'),
    title: text('title').notNull(),
    note: text('note'),
    /** Set when the line was generated by a purchase or a salary payment. */
    refType: varchar('ref_type', { length: 16 }).$type<'STOCK_ENTRY' | 'SALARY' | 'MANUAL'>(),
    refId: text('ref_id'),
    createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
  },
  (t) => [
    index('expenses_org_date_idx').on(t.orgId, t.date),
    index('expenses_org_category_idx').on(t.orgId, t.category),
    index('expenses_ref_idx').on(t.refType, t.refId),
  ],
);

/* --------------------------------------------------------------- payroll */

export const salaryPayments = pgTable(
  'salary_payments',
  {
    id: id(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    /** The month being paid for, as YYYY-MM. */
    month: varchar('month', { length: 7 }).notNull(),
    base: money('base'),
    commission: money('commission'),
    bonus: money('bonus'),
    deduction: money('deduction'),
    total: money('total'),
    paidAt: timestamp('paid_at', { withTimezone: true }).notNull(),
    method: varchar('method', { length: 16 })
      .$type<(typeof PAYMENT_METHOD_VALUES)[number]>()
      .notNull()
      .default('CASH'),
    note: text('note'),
    paidBy: text('paid_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
  },
  (t) => [
    // One payment per person per month — the database refuses a double-pay.
    uniqueIndex('salary_user_month_idx').on(t.userId, t.month),
    index('salary_org_month_idx').on(t.orgId, t.month),
  ],
);

/* ------------------------------------------------------------ audit trail */

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: id(),
    orgId: text('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    userName: text('user_name').notNull(),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: text('entity_id'),
    meta: jsonb('meta').$type<Record<string, unknown>>(),
    createdAt: createdAt(),
  },
  (t) => [index('audit_logs_org_created_idx').on(t.orgId, t.createdAt)],
);

/* -------------------------------------------------------------- relations */

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  products: many(products),
  categories: many(categories),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
  sales: many(sales),
  deposits: many(deposits),
}));

export const productsRelations = relations(products, ({ one }) => ({
  organization: one(organizations, {
    fields: [products.orgId],
    references: [organizations.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const stockEntriesRelations = relations(stockEntries, ({ many }) => ({
  items: many(stockEntryItems),
}));

export const stockEntryItemsRelations = relations(stockEntryItems, ({ one }) => ({
  entry: one(stockEntries, {
    fields: [stockEntryItems.entryId],
    references: [stockEntries.id],
  }),
  product: one(products, {
    fields: [stockEntryItems.productId],
    references: [products.id],
  }),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  items: many(assignmentItems),
  sr: one(users, { fields: [assignments.srId], references: [users.id] }),
}));

export const assignmentItemsRelations = relations(assignmentItems, ({ one }) => ({
  assignment: one(assignments, {
    fields: [assignmentItems.assignmentId],
    references: [assignments.id],
  }),
  product: one(products, {
    fields: [assignmentItems.productId],
    references: [products.id],
  }),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  items: many(saleItems),
  sr: one(users, { fields: [sales.srId], references: [users.id] }),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, { fields: [saleItems.saleId], references: [sales.id] }),
  product: one(products, { fields: [saleItems.productId], references: [products.id] }),
}));

export const demandsRelations = relations(demands, ({ one, many }) => ({
  items: many(demandItems),
  sr: one(users, { fields: [demands.srId], references: [users.id] }),
}));

export const demandItemsRelations = relations(demandItems, ({ one }) => ({
  demand: one(demands, { fields: [demandItems.demandId], references: [demands.id] }),
  product: one(products, { fields: [demandItems.productId], references: [products.id] }),
}));

export const stockReturnsRelations = relations(stockReturns, ({ one, many }) => ({
  items: many(stockReturnItems),
  sr: one(users, { fields: [stockReturns.srId], references: [users.id] }),
}));

export const stockReturnItemsRelations = relations(stockReturnItems, ({ one }) => ({
  stockReturn: one(stockReturns, {
    fields: [stockReturnItems.returnId],
    references: [stockReturns.id],
  }),
  product: one(products, {
    fields: [stockReturnItems.productId],
    references: [products.id],
  }),
}));

export const schema = {
  organizations,
  users,
  invitations,
  categories,
  products,
  stockEntries,
  stockEntryItems,
  assignments,
  assignmentItems,
  stockReturns,
  stockReturnItems,
  sales,
  saleItems,
  demands,
  demandItems,
  deposits,
  expenses,
  salaryPayments,
  auditLogs,
  organizationsRelations,
  usersRelations,
  productsRelations,
  stockEntriesRelations,
  stockEntryItemsRelations,
  assignmentsRelations,
  assignmentItemsRelations,
  salesRelations,
  saleItemsRelations,
  demandsRelations,
  demandItemsRelations,
  stockReturnsRelations,
  stockReturnItemsRelations,
};

export type Organization = typeof organizations.$inferSelect;
export type UserRow = typeof users.$inferSelect;
export type ProductRow = typeof products.$inferSelect;
export type SaleRow = typeof sales.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type InvitationRow = typeof invitations.$inferSelect;
