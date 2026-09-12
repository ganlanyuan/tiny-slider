import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';

import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

import { ensureSchema } from '../src/db/bootstrap';
import { createConnection, type Connection, type Database } from '../src/db/connect';
import { srAccount, srAccounts } from '../src/db/queries/accounts';
import { financeSummary, monthlyTrend, productPerformance } from '../src/db/queries/finance';
import { productStockLedger, srAvailableQty, srHoldings } from '../src/db/queries/stock';
import {
  assignmentItems,
  assignments,
  categories,
  deposits,
  expenses,
  organizations,
  products,
  saleItems,
  sales,
  stockEntries,
  stockEntryItems,
  stockReturnItems,
  stockReturns,
  users,
} from '../src/db/schema';
import { withTransaction } from '../src/db/tx';

/**
 * These run against a real Postgres (an embedded one), so the SQL in
 * `src/db/queries` is exercised exactly as it runs in production — the same
 * dialect, the same joins, the same numeric handling.
 */

process.env.PGLITE_DIR = 'memory://';

let connection: Connection;
let db: Database;

/** Two tenants, so every assertion also proves they stay separate. */
const ACME = { orgId: '', srId: '', sr2Id: '', ownerId: '', plateId: '', mugId: '' };
const RIVAL = { orgId: '', srId: '', plateId: '' };

const at = (day: number) => new Date(Date.UTC(2026, 2, day));
const THIS_MONTH = '2026-03';

before(async () => {
  connection = await createConnection();
  db = connection.db;
  await ensureSchema(db);

  const hash = bcrypt.hashSync('password123', 4);

  /* ------------------------------------------------------------ tenant A */
  const [acme] = await db
    .insert(organizations)
    .values({ name: 'Acme Crockery', slug: 'acme-crockery' })
    .returning();
  ACME.orgId = acme.id;

  const acmeUsers = await db
    .insert(users)
    .values([
      { orgId: acme.id, name: 'Owner', email: 'owner@acme.test', passwordHash: hash, role: 'ADMIN' },
      {
        orgId: acme.id, name: 'Rep One', email: 'rep1@acme.test', passwordHash: hash,
        role: 'SR', monthlySalary: 10000, commissionRate: 2,
      },
      {
        orgId: acme.id, name: 'Rep Two', email: 'rep2@acme.test', passwordHash: hash,
        role: 'SR', monthlySalary: 9000, commissionRate: 1,
      },
    ])
    .returning();
  ACME.ownerId = acmeUsers[0].id;
  ACME.srId = acmeUsers[1].id;
  ACME.sr2Id = acmeUsers[2].id;

  const [cat] = await db
    .insert(categories)
    .values({ orgId: acme.id, name: 'Plates', slug: 'plates' })
    .returning();

  const acmeProducts = await db
    .insert(products)
    .values([
      {
        orgId: acme.id, sku: 'P-1', name: 'Plate', categoryId: cat.id, unit: 'pcs',
        costPrice: 10, srPrice: 25, marketPrice: 32, lowStockThreshold: 5,
      },
      {
        orgId: acme.id, sku: 'M-1', name: 'Mug', categoryId: cat.id, unit: 'pcs',
        costPrice: 4, srPrice: 9, marketPrice: 12, lowStockThreshold: 5,
      },
    ])
    .returning();
  ACME.plateId = acmeProducts[0].id;
  ACME.mugId = acmeProducts[1].id;

  // 100 plates in at cost 10, plus 50 mugs.
  const [entry] = await db
    .insert(stockEntries)
    .values({
      orgId: acme.id, invoiceNo: 'PO-1', supplier: 'Kiln', date: at(1),
      extraCost: 50, total: 1250, paid: 1250, createdBy: ACME.ownerId,
    })
    .returning();
  await db.insert(stockEntryItems).values([
    { entryId: entry.id, productId: ACME.plateId, qty: 100, unitCost: 10 },
    { entryId: entry.id, productId: ACME.mugId, qty: 50, unitCost: 4 },
  ]);
  await db.insert(expenses).values({
    orgId: acme.id, date: at(1), category: 'PRODUCT', amount: 1250,
    title: 'Stock purchase', refType: 'STOCK_ENTRY', refId: entry.id,
  });

  // 40 plates out to rep one, 5 back.
  const [challan] = await db
    .insert(assignments)
    .values({
      orgId: acme.id, challanNo: 'CH-1', srId: ACME.srId, date: at(2),
      totalValue: 1000, createdBy: ACME.ownerId,
    })
    .returning();
  await db
    .insert(assignmentItems)
    .values({ assignmentId: challan.id, productId: ACME.plateId, qty: 40, srRate: 25 });

  const [ret] = await db
    .insert(stockReturns)
    .values({ orgId: acme.id, srId: ACME.srId, date: at(3), reason: 'Damaged' })
    .returning();
  await db
    .insert(stockReturnItems)
    .values({ returnId: ret.id, productId: ACME.plateId, qty: 5 });

  // 20 plates sold at 25, 300 of the 500 collected.
  const [sale] = await db
    .insert(sales)
    .values({
      orgId: acme.id, invoiceNo: 'INV-1', srId: ACME.srId, date: at(4),
      shopName: 'Corner Shop', discount: 0, total: 500, paid: 300, status: 'DELIVERED',
    })
    .returning();
  await db
    .insert(saleItems)
    .values({ saleId: sale.id, productId: ACME.plateId, qty: 20, rate: 25 });

  // A cancelled invoice must count for nothing at all.
  const [cancelled] = await db
    .insert(sales)
    .values({
      orgId: acme.id, invoiceNo: 'INV-2', srId: ACME.srId, date: at(5),
      shopName: 'Ghost Shop', discount: 0, total: 250, paid: 0, status: 'CANCELLED',
    })
    .returning();
  await db
    .insert(saleItems)
    .values({ saleId: cancelled.id, productId: ACME.plateId, qty: 10, rate: 25 });

  await db.insert(deposits).values({
    orgId: acme.id, srId: ACME.srId, amount: 200, date: at(6), method: 'CASH',
  });
  await db.insert(expenses).values({
    orgId: acme.id, date: at(7), category: 'TRANSPORT', amount: 120,
    title: 'Van fare', refType: 'MANUAL',
  });

  /* ------------------------------------------------------------ tenant B */
  const [rival] = await db
    .insert(organizations)
    .values({ name: 'Rival Traders', slug: 'rival-traders' })
    .returning();
  RIVAL.orgId = rival.id;

  const [rivalSr] = await db
    .insert(users)
    .values({
      orgId: rival.id, name: 'Rival Rep', email: 'rep@rival.test', passwordHash: hash, role: 'SR',
    })
    .returning();
  RIVAL.srId = rivalSr.id;

  // Deliberately the same SKU, to prove uniqueness is scoped per organisation.
  const [rivalProduct] = await db
    .insert(products)
    .values({
      orgId: rival.id, sku: 'P-1', name: 'Rival Plate', unit: 'pcs',
      costPrice: 99, srPrice: 199, marketPrice: 250,
    })
    .returning();
  RIVAL.plateId = rivalProduct.id;

  const [rivalEntry] = await db
    .insert(stockEntries)
    .values({
      orgId: rival.id, invoiceNo: 'PO-1', supplier: 'Other', date: at(1),
      extraCost: 0, total: 9900, paid: 9900,
    })
    .returning();
  await db
    .insert(stockEntryItems)
    .values({ entryId: rivalEntry.id, productId: RIVAL.plateId, qty: 100, unitCost: 99 });

  const [rivalSale] = await db
    .insert(sales)
    .values({
      orgId: rival.id, invoiceNo: 'INV-1', srId: RIVAL.srId, date: at(4),
      shopName: 'Rival Shop', discount: 0, total: 19900, paid: 19900, status: 'DELIVERED',
    })
    .returning();
  await db
    .insert(saleItems)
    .values({ saleId: rivalSale.id, productId: RIVAL.plateId, qty: 100, rate: 199 });
});

after(async () => {
  await connection.close?.();
});

/* ------------------------------------------------------------------ stock */

test('stock ledger derives store, van and sold quantities from documents', async () => {
  const ledger = await productStockLedger(db, ACME.orgId);
  const plate = ledger.get(ACME.plateId)!;

  assert.equal(plate.received, 100);
  assert.equal(plate.assigned, 40);
  assert.equal(plate.returned, 5);
  assert.equal(plate.sold, 20, 'the cancelled invoice is excluded');
  assert.equal(plate.inStore, 65, '100 in − 40 out + 5 back');
  assert.equal(plate.withSrs, 15, '40 out − 5 back − 20 sold');
  assert.equal(plate.onHand, 80);

  const mug = ledger.get(ACME.mugId)!;
  assert.equal(mug.received, 50);
  assert.equal(mug.inStore, 50, 'never handed out');
  assert.equal(mug.withSrs, 0);
});

test('the ledger never reports another tenant’s stock', async () => {
  const acme = await productStockLedger(db, ACME.orgId);
  const rival = await productStockLedger(db, RIVAL.orgId);

  assert.equal(acme.size, 2);
  assert.equal(rival.size, 1);
  assert.equal(acme.has(RIVAL.plateId), false);
  assert.equal(rival.has(ACME.plateId), false);
  assert.equal(rival.get(RIVAL.plateId)!.sold, 100);
});

test('two tenants can hold the same SKU', async () => {
  const rows = await db.select({ sku: products.sku }).from(products).where(eq(products.sku, 'P-1'));
  assert.equal(rows.length, 2, 'uniqueness is scoped per organisation, not globally');
});

test('van holdings and the sale guard agree', async () => {
  const holdings = await srHoldings(db, ACME.orgId, ACME.srId);
  assert.equal(holdings.length, 1);
  assert.equal(holdings[0].qty, 15);
  assert.equal(holdings[0].value, 375, '15 units at the 25 rate');

  const available = await srAvailableQty(db, ACME.orgId, ACME.srId, [ACME.plateId, ACME.mugId]);
  assert.equal(available.get(ACME.plateId), 15);
  assert.equal(available.get(ACME.mugId), 0, 'never given any');

  const other = await srHoldings(db, ACME.orgId, ACME.sr2Id);
  assert.equal(other.length, 0, 'one rep never sees another rep’s van');
});

/* --------------------------------------------------------------- accounts */

test('a rep’s account separates monthly activity from standing position', async () => {
  const account = (await srAccount(db, ACME.orgId, ACME.srId, THIS_MONTH))!;

  assert.equal(account.invoices, 1, 'the cancelled invoice is not counted');
  assert.equal(account.soldValue, 500);
  assert.equal(account.collected, 300);
  assert.equal(account.deposited, 200);
  assert.equal(account.marketDue, 200, 'the shop still owes this');
  assert.equal(account.cashInHand, 100, 'collected 300 − deposited 200');
  assert.equal(account.unitsInHand, 15);
  assert.equal(account.stockValueInHand, 375);
});

test('cash in hand ignores the month filter', async () => {
  const april = (await srAccount(db, ACME.orgId, ACME.srId, '2026-04'))!;
  assert.equal(april.soldValue, 0, 'no April activity');
  assert.equal(april.cashInHand, 100, 'but the cash is still in the rep’s pocket');
  assert.equal(april.unitsInHand, 15, 'and the van is still loaded');
});

test('every rep in the workspace is listed, and nobody outside it', async () => {
  const accounts = await srAccounts(db, ACME.orgId, { month: THIS_MONTH });
  assert.deepEqual(
    accounts.map((a) => a.name).sort(),
    ['Rep One', 'Rep Two'],
  );
  const rivalAccounts = await srAccounts(db, RIVAL.orgId, { month: THIS_MONTH });
  assert.deepEqual(rivalAccounts.map((a) => a.name), ['Rival Rep']);
  assert.equal(rivalAccounts[0].soldValue, 19900);
});

/* ---------------------------------------------------------------- finance */

test('the owner sees cost, profit and stock valuation', async () => {
  const s = await financeSummary(db, ACME.orgId, { month: THIS_MONTH, includeCost: true });

  assert.equal(s.revenue, 500);
  assert.equal(s.collected, 300);
  assert.equal(s.invoices, 1);
  assert.equal(s.costOfGoodsSold, 200, '20 plates at cost 10');
  assert.equal(s.grossProfit, 300);
  assert.equal(s.netProfit, 180, 'gross 300 − 120 running costs');
  assert.equal(s.margin, 60);
  assert.equal(s.productExpense, 1250);
  assert.equal(s.totalExpense, 1370);
  assert.equal(s.stockCostValue, 1000, '80 plates at 10 + 50 mugs at 4');
});

test('purchases are not double-counted against cost of goods sold', async () => {
  const s = await financeSummary(db, ACME.orgId, { month: THIS_MONTH, includeCost: true });
  // Stock purchases are capitalised into inventory. Subtracting the 1250
  // purchase as well as the 200 COGS would report a loss that does not exist.
  assert.equal(s.netProfit, 180);
  assert.notEqual(s.netProfit, s.revenue - s.costOfGoodsSold! - s.totalExpense);
});

test('a non-owner gets no cost figure and no product-purchase line', async () => {
  const s = await financeSummary(db, ACME.orgId, { month: THIS_MONTH, includeCost: false });

  assert.equal(s.costOfGoodsSold, undefined);
  assert.equal(s.grossProfit, undefined);
  assert.equal(s.netProfit, undefined);
  assert.equal(s.margin, undefined);
  assert.equal(s.stockCostValue, undefined);
  assert.equal(s.productExpense, 0, 'the supplier invoice total is withheld');
  assert.equal(s.totalExpense, 120, 'running costs only');
  assert.equal(
    s.expenseByCategory.some((e) => e.category === 'PRODUCT'),
    false,
  );
  assert.equal(s.revenue, 500, 'revenue itself is not secret');
});

test('finance figures never mix tenants', async () => {
  const acme = await financeSummary(db, ACME.orgId, { month: THIS_MONTH, includeCost: true });
  const rival = await financeSummary(db, RIVAL.orgId, { month: THIS_MONTH, includeCost: true });

  assert.equal(acme.revenue, 500);
  assert.equal(rival.revenue, 19900);
  assert.equal(rival.costOfGoodsSold, 9900);
  assert.equal(acme.cashWithSrs, 100);
  assert.equal(rival.cashWithSrs, 19900, 'the rival rep has deposited nothing');
});

test('the monthly trend covers the requested window and hides profit without cost', async () => {
  const withCost = await monthlyTrend(db, ACME.orgId, 6, true);
  assert.equal(withCost.length, 6);
  assert.ok(withCost.every((t) => typeof t.profit === 'number'));

  const withoutCost = await monthlyTrend(db, ACME.orgId, 6, false);
  assert.ok(withoutCost.every((t) => t.profit === undefined));
});

test('product performance can be scoped to one rep and hides cost', async () => {
  const all = await productPerformance(db, ACME.orgId, { month: THIS_MONTH, includeCost: true });
  assert.equal(all.length, 1);
  assert.equal(all[0].qty, 20);
  assert.equal(all[0].revenue, 500);
  assert.equal(all[0].cost, 200);
  assert.equal(all[0].profit, 300);
  assert.equal(all[0].inStore, 65);
  assert.equal(all[0].withSrs, 15);

  const hidden = await productPerformance(db, ACME.orgId, { month: THIS_MONTH, includeCost: false });
  assert.equal(hidden[0].cost, undefined);
  assert.equal(hidden[0].profit, undefined);

  const otherRep = await productPerformance(db, ACME.orgId, {
    month: THIS_MONTH,
    includeCost: false,
    srId: ACME.sr2Id,
  });
  assert.equal(otherRep.length, 0, 'rep two has sold nothing');
});

/* ----------------------------------------------------------- transactions */

test('a failed transaction leaves no partial document behind', async () => {
  const before = await db.select().from(sales).where(eq(sales.orgId, ACME.orgId));

  await assert.rejects(
    withTransaction(db, async (tx) => {
      const database = tx as Database;
      const [created] = await database
        .insert(sales)
        .values({
          orgId: ACME.orgId, invoiceNo: 'INV-ROLLBACK', srId: ACME.srId, date: at(8),
          shopName: 'Doomed', discount: 0, total: 100, paid: 0, status: 'PENDING',
        })
        .returning();
      // A line item pointing at nothing violates the foreign key.
      await database
        .insert(saleItems)
        .values({ saleId: created.id, productId: 'does-not-exist', qty: 1, rate: 100 });
    }),
  );

  const after = await db.select().from(sales).where(eq(sales.orgId, ACME.orgId));
  assert.equal(after.length, before.length, 'the invoice was rolled back with its items');
  assert.equal(
    after.some((s) => s.invoiceNo === 'INV-ROLLBACK'),
    false,
  );
});

test('deleting a workspace removes everything it owns and nothing else', async () => {
  const [doomed] = await db
    .insert(organizations)
    .values({ name: 'Temp Co', slug: 'temp-co' })
    .returning();
  const [tempUser] = await db
    .insert(users)
    .values({
      orgId: doomed.id, name: 'Temp', email: 'temp@temp.test',
      passwordHash: 'x', role: 'ADMIN',
    })
    .returning();

  await db.delete(organizations).where(eq(organizations.id, doomed.id));

  const gone = await db.select().from(users).where(eq(users.id, tempUser.id));
  assert.equal(gone.length, 0, 'cascaded away');

  const acmeStillThere = await db.select().from(users).where(eq(users.orgId, ACME.orgId));
  assert.equal(acmeStillThere.length, 3, 'the other tenant is untouched');
});

test('money survives the round trip as a number, not a string', async () => {
  const [row] = await db
    .select({ price: products.srPrice })
    .from(products)
    .where(eq(products.id, ACME.plateId));
  assert.equal(typeof row.price, 'number');
  assert.equal(row.price, 25);
});
