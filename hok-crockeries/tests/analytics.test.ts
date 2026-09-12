import assert from 'node:assert/strict';
import test from 'node:test';

import {
  financeSummary,
  monthlyTrend,
  productStockLedger,
  saleTotal,
  srAccount,
  srStockLedger,
  stockEntryTotal,
  topProducts,
} from '../src/lib/analytics';
import type { Database } from '../src/lib/types';
import { emptyDatabase } from './helpers';

/**
 * One small, hand-checkable world used by most tests:
 *   - 100 plates bought at ৳10
 *   - 40 handed to SR-1, 5 handed back
 *   - 20 sold at ৳25, ৳300 of the ৳500 collected
 */
function world(): Database {
  const db = emptyDatabase();
  db.users.push(
    {
      id: 'sr1', name: 'Rep One', phone: '01700000001', passwordHash: 'x', role: 'SR',
      active: true, monthlySalary: 10000, commissionRate: 2, joinedAt: '2026-01-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'sr2', name: 'Rep Two', phone: '01700000002', passwordHash: 'x', role: 'SR',
      active: true, monthlySalary: 9000, commissionRate: 1, joinedAt: '2026-01-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    },
  );
  db.products.push({
    id: 'p1', sku: 'P1', name: 'Plate', categoryId: 'c1', unit: 'pcs',
    costPrice: 10, srPrice: 25, marketPrice: 32, stock: 0, lowStockThreshold: 5,
    active: true, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  });
  db.stockEntries.push({
    id: 'po1', invoiceNo: 'PO-1', supplier: 'Kiln', date: '2026-03-01',
    items: [{ productId: 'p1', qty: 100, unitCost: 10 }],
    extraCost: 50, total: 1050, paid: 1050, createdBy: 'mgr', createdAt: '2026-03-01T00:00:00.000Z',
  });
  db.assignments.push({
    id: 'a1', challanNo: 'CH-1', srId: 'sr1', date: '2026-03-02',
    items: [{ productId: 'p1', qty: 40, srRate: 25 }],
    totalValue: 1000, createdBy: 'mgr', createdAt: '2026-03-02T00:00:00.000Z',
  });
  db.returns.push({
    id: 'r1', srId: 'sr1', date: '2026-03-03',
    items: [{ productId: 'p1', qty: 5 }], createdBy: 'mgr', createdAt: '2026-03-03T00:00:00.000Z',
  });
  db.sales.push({
    id: 's1', invoiceNo: 'INV-1', srId: 'sr1', date: '2026-03-04', shopName: 'Shop',
    items: [{ productId: 'p1', qty: 20, rate: 25 }],
    discount: 0, total: 500, paid: 300, status: 'DELIVERED',
    createdBy: 'sr1', createdAt: '2026-03-04T00:00:00.000Z', updatedAt: '2026-03-04T00:00:00.000Z',
  });
  db.expenses.push(
    {
      id: 'e1', date: '2026-03-01', category: 'PRODUCT', amount: 1050,
      title: 'Stock purchase', refType: 'STOCK_ENTRY', refId: 'po1',
      createdBy: 'mgr', createdAt: '2026-03-01T00:00:00.000Z',
    },
    {
      id: 'e2', date: '2026-03-05', category: 'TRANSPORT', amount: 120,
      title: 'Van fare', refType: 'MANUAL', createdBy: 'mgr', createdAt: '2026-03-05T00:00:00.000Z',
    },
  );
  return db;
}

test('stock ledger splits store, SR vans and sold units', () => {
  const row = productStockLedger(world()).get('p1')!;
  assert.equal(row.received, 100);
  assert.equal(row.assigned, 40);
  assert.equal(row.returned, 5);
  assert.equal(row.sold, 20);
  assert.equal(row.inStore, 65, '100 received − 40 out + 5 back');
  assert.equal(row.withSrs, 15, '40 out − 5 back − 20 sold');
  assert.equal(row.onHand, 80, 'store + vans = everything still owned');
});

test('a cancelled invoice consumes no stock and earns no revenue', () => {
  const db = world();
  db.sales[0].status = 'CANCELLED';
  const row = productStockLedger(db).get('p1')!;
  assert.equal(row.sold, 0);
  assert.equal(row.withSrs, 35, 'the goods are back in the van');
  assert.equal(financeSummary(db, { includeCost: true }).revenue, 0);
});

test('SR account tracks collected, deposited and cash still in hand', () => {
  const db = world();
  db.deposits.push({
    id: 'd1', srId: 'sr1', amount: 200, date: '2026-03-06', method: 'CASH',
    receivedBy: 'mgr', createdAt: '2026-03-06T00:00:00.000Z',
  });
  const account = srAccount(db, 'sr1');
  assert.equal(account.soldValue, 500);
  assert.equal(account.collected, 300);
  assert.equal(account.marketDue, 200, 'the shop still owes this');
  assert.equal(account.deposited, 200);
  assert.equal(account.cashInHand, 100, 'collected 300 − deposited 200');
  assert.equal(account.unitsInHand, 15);
  assert.equal(account.stockValueInHand, 375, '15 units at the ৳25 SR rate');
});

test('stock in hand ignores the month filter, because a van does not empty itself', () => {
  const db = world();
  const april = srAccount(db, 'sr1', '2026-04');
  assert.equal(april.soldValue, 0, 'no April sales');
  assert.equal(april.unitsInHand, 15, 'but the van still holds March stock');
});

test('one SR never sees another SR in their own account', () => {
  const db = world();
  db.sales.push({
    id: 's2', invoiceNo: 'INV-2', srId: 'sr2', date: '2026-03-04', shopName: 'Other',
    items: [{ productId: 'p1', qty: 1, rate: 25 }],
    discount: 0, total: 25, paid: 25, status: 'DELIVERED',
    createdBy: 'sr2', createdAt: '2026-03-04T00:00:00.000Z', updatedAt: '2026-03-04T00:00:00.000Z',
  });
  assert.equal(srAccount(db, 'sr1').soldValue, 500);
  assert.equal(srAccount(db, 'sr2').soldValue, 25);
});

test('SR stock ledger goes negative-free across assign, return and sell', () => {
  const held = srStockLedger(world(), 'sr1');
  assert.equal(held.get('p1'), 15);
  assert.equal(srStockLedger(world(), 'sr2').get('p1'), undefined);
});

test('finance summary hides every cost-derived figure without cost access', () => {
  const db = world();
  const owner = financeSummary(db, { month: '2026-03', includeCost: true });
  const manager = financeSummary(db, { month: '2026-03', includeCost: false });

  assert.equal(owner.costOfGoodsSold, 200, '20 sold at ৳10 cost');
  assert.equal(owner.grossProfit, 300, '৳500 revenue − ৳200 cost');
  assert.equal(owner.netProfit, 180, 'gross ৳300 − ৳120 running costs');
  assert.equal(owner.productExpense, 1050);
  assert.equal(owner.totalExpense, 1170);

  assert.equal(manager.costOfGoodsSold, undefined);
  assert.equal(manager.grossProfit, undefined);
  assert.equal(manager.netProfit, undefined);
  assert.equal(manager.margin, undefined);
  assert.equal(manager.stockCostValue, undefined);
  assert.equal(manager.productExpense, 0, 'purchase lines are dropped entirely');
  assert.equal(manager.totalExpense, 120, 'running costs only');
  assert.equal(manager.revenue, 500, 'revenue itself is not secret');
});

test('net profit does not double-count purchases against cost of goods sold', () => {
  const owner = financeSummary(world(), { month: '2026-03', includeCost: true });
  // Revenue 500 − COGS 200 − operating 120. The ৳1050 purchase is capitalised
  // into stock, so subtracting it again would understate profit.
  assert.equal(owner.netProfit, 180);
  assert.notEqual(owner.netProfit, 500 - 200 - 1170);
});

test('stock valuation at cost counts store and van stock', () => {
  const owner = financeSummary(world(), { includeCost: true });
  assert.equal(owner.stockCostValue, 800, '80 units on hand at ৳10');
});

test('cash with SRs is an all-time float, not a monthly figure', () => {
  const db = world();
  const april = financeSummary(db, { month: '2026-04', includeCost: true });
  assert.equal(april.revenue, 0);
  assert.equal(april.cashWithSrs, 300, 'March cash is still in the rep’s pocket');
});

test('document totals round to two decimals', () => {
  assert.equal(saleTotal({ items: [{ productId: 'p', qty: 3, rate: 10.333 }], discount: 0 }), 31);
  assert.equal(saleTotal({ items: [{ productId: 'p', qty: 2, rate: 99.99 }], discount: 9.99 }), 189.99);
  assert.equal(
    stockEntryTotal({ items: [{ productId: 'p', qty: 7, unitCost: 12.345 }], extraCost: 1.005 }),
    87.42,
  );
});

test('monthly trend returns the requested window ending this month', () => {
  const trend = monthlyTrend(world(), 6, true);
  assert.equal(trend.length, 6);
  assert.equal(trend[5].month, new Date().toISOString().slice(0, 7));
  assert.ok(trend.every((t) => typeof t.profit === 'number'));
  assert.ok(monthlyTrend(world(), 3, false).every((t) => t.profit === undefined));
});

test('top products can be scoped to one rep', () => {
  const db = world();
  db.sales.push({
    id: 's2', invoiceNo: 'INV-2', srId: 'sr2', date: '2026-03-04', shopName: 'Other',
    items: [{ productId: 'p1', qty: 50, rate: 25 }],
    discount: 0, total: 1250, paid: 0, status: 'DELIVERED',
    createdBy: 'sr2', createdAt: '2026-03-04T00:00:00.000Z', updatedAt: '2026-03-04T00:00:00.000Z',
  });
  assert.equal(topProducts(db, { month: '2026-03' })[0].qty, 70, 'everyone');
  assert.equal(topProducts(db, { month: '2026-03', srId: 'sr1' })[0].qty, 20, 'just this rep');
});
