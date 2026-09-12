/**
 * Seeds a demo workspace with a full trading history, so every dashboard has
 * something real to show on a fresh install.
 *
 *   npm run seed             # refuses if the workspace already exists
 *   npm run seed -- --force  # deletes that workspace and rebuilds it
 *
 * Works against whatever `DATABASE_URL` points at, or the embedded local
 * database when that variable is unset.
 */

import { randomUUID } from 'node:crypto';
import process from 'node:process';

import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

import { createConnection } from '../src/db/connect';
import { ensureSchema } from '../src/db/bootstrap';
import {
  assignmentItems,
  assignments,
  auditLogs,
  categories,
  demandItems,
  demands,
  deposits,
  expenses,
  organizations,
  products,
  saleItems,
  salaryPayments,
  sales,
  stockEntries,
  stockEntryItems,
  users,
} from '../src/db/schema';
import { assignmentValue, purchaseTotal, round2, saleTotal } from '../src/lib/money';
import { slugify } from '../src/lib/utils';

const FORCE = process.argv.includes('--force');
const ORG_NAME = process.env.SEED_ORG_NAME || 'Hok Crockeries';
const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL || 'owner@hokcrockeries.test').toLowerCase();
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'owner12345';
const STAFF_PASSWORD = process.env.SEED_STAFF_PASSWORD || 'staff12345';

const id = () => randomUUID();
const day = (back: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - back);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const between = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const CATEGORY_NAMES = [
  'Dinner Sets',
  'Plates & Bowls',
  'Glassware',
  'Mugs & Cups',
  'Cookware',
  'Storage & Jars',
  'Cutlery',
];

// [name, categoryIndex, unit, cost, srRate, market, brand]
const CATALOGUE: [string, number, string, number, number, number, string][] = [
  ['Dinner Set 32 pcs — Ivory', 0, 'set', 2150, 2650, 3200, 'Shinepukur'],
  ['Dinner Set 22 pcs — Blue Rim', 0, 'set', 1480, 1850, 2250, 'Monno'],
  ['Dinner Set 40 pcs — Gold Line', 0, 'set', 3400, 4150, 4900, 'Shinepukur'],
  ['Dinner Plate 10 inch', 1, 'dozen', 540, 720, 950, 'Monno'],
  ['Dinner Plate 8 inch', 1, 'dozen', 430, 580, 760, 'Monno'],
  ['Soup Bowl Medium', 1, 'dozen', 380, 510, 680, 'Farr'],
  ['Curry Bowl Large', 1, 'dozen', 620, 820, 1080, 'Farr'],
  ['Serving Platter Oval', 1, 'pcs', 210, 285, 380, 'Shinepukur'],
  ['Water Glass 250ml', 2, 'dozen', 290, 390, 520, 'Ocean'],
  ['Juice Glass Set 6 pcs', 2, 'set', 340, 450, 590, 'Ocean'],
  ['Glass Jug 1.5L', 2, 'pcs', 280, 380, 490, 'Ocean'],
  ['Ceramic Mug Printed', 3, 'dozen', 480, 640, 840, 'Monno'],
  ['Tea Cup & Saucer Set', 3, 'set', 620, 810, 1050, 'Shinepukur'],
  ['Coffee Mug Bone China', 3, 'dozen', 760, 990, 1290, 'Shinepukur'],
  ['Non-stick Fry Pan 24cm', 4, 'pcs', 690, 890, 1150, 'Kiam'],
  ['Pressure Cooker 3L', 4, 'pcs', 1850, 2300, 2850, 'Kiam'],
  ['Stainless Karai 26cm', 4, 'pcs', 780, 1020, 1320, 'Kiam'],
  ['Casserole Hot Pot 2.5L', 4, 'pcs', 640, 850, 1100, 'RFL'],
  ['Airtight Jar 1L', 5, 'dozen', 420, 560, 740, 'RFL'],
  ['Spice Rack Set 8 pcs', 5, 'set', 390, 520, 680, 'RFL'],
  ['Lunch Box 3 Layer', 5, 'pcs', 310, 420, 550, 'RFL'],
  ['Cutlery Set 24 pcs', 6, 'set', 720, 950, 1250, 'Vision'],
  ['Serving Spoon Steel', 6, 'dozen', 240, 330, 440, 'Vision'],
  ['Tea Spoon Steel', 6, 'dozen', 150, 210, 285, 'Vision'],
];

const SHOPS: [string, string][] = [
  ['Bismillah Store', 'Sadar Bazar'],
  ['Nur Crockery House', 'Station Road'],
  ['Alif Traders', 'College Road'],
  ['Rahman & Sons', 'Boro Bazar'],
  ['Sonali Ghar Sajao', 'Hospital Road'],
  ['Hasan Enterprise', 'New Market'],
  ['Popular Crockery', 'Sadar Bazar'],
  ['Modern Housewares', 'Gudari Bazar'],
  ['Chowdhury Store', 'Thana Road'],
  ['Barkat Traders', 'Boro Bazar'],
];

const MISC: [('TRANSPORT' | 'RENT' | 'UTILITY' | 'MARKETING' | 'MAINTENANCE' | 'OTHER'), string, number, number][] = [
  ['TRANSPORT', 'Truck fare from the port', 3500, 8000],
  ['TRANSPORT', 'Van rent for rep delivery', 1200, 2800],
  ['RENT', 'Godown rent', 12000, 12000],
  ['UTILITY', 'Electricity bill', 2200, 4800],
  ['UTILITY', 'Internet and mobile bills', 1400, 2200],
  ['MARKETING', 'Shop banners and printing', 1800, 5500],
  ['MAINTENANCE', 'Shelving repair and packing material', 900, 3200],
  ['OTHER', 'Tea and sundry office costs', 600, 1800],
];

async function main() {
  const { db, kind, close } = await createConnection();
  // A managed database is migrated by the build; an embedded one migrates here.
  if (kind === 'pglite') await ensureSchema(db);
  void close;
  const hash = (pw: string) => bcrypt.hashSync(pw, 10);
  const slug = slugify(ORG_NAME);

  const [existing] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1);

  if (existing) {
    if (!FORCE) {
      console.error(
        `\n  A workspace named "${ORG_NAME}" already exists.\n` +
          '  Re-run with --force to delete it and seed fresh demo data.\n',
      );
      process.exit(1);
    }
    // Every table cascades from the organisation, so one delete clears it all.
    await db.delete(organizations).where(eq(organizations.id, existing.id));
    console.log(`  Removed the previous "${ORG_NAME}" workspace.`);
  }

  /* ------------------------------------------------------- organisation */
  const orgId = id();
  await db.insert(organizations).values({
    id: orgId,
    name: ORG_NAME,
    slug,
    tagline: 'Crockery and houseware distribution, run on real numbers.',
    address: 'Sadar Bazar',
    phone: '01700000000',
    email: ADMIN_EMAIL,
    currency: '৳',
    lowStockThreshold: 10,
    units: ['pcs', 'dozen', 'set', 'carton'],
    onboardedAt: new Date(),
  });

  /* --------------------------------------------------------------- team */
  const ownerId = id();
  const managerId = id();
  const srIds = [id(), id(), id()];
  const dealerId = id();

  const srProfiles = [
    { name: 'Jahangir Alam', area: 'Sadar & Station Road', salary: 14000, rate: 2 },
    { name: 'Rakibul Hasan', area: 'Boro Bazar & New Market', salary: 13500, rate: 2.5 },
    { name: 'Mizanur Rahman', area: 'College Road & Thana Road', salary: 13000, rate: 2 },
  ];

  await db.insert(users).values([
    {
      id: ownerId,
      orgId,
      name: 'Abdul Hoque',
      email: ADMIN_EMAIL,
      phone: '01700000000',
      passwordHash: hash(ADMIN_PASSWORD),
      role: 'ADMIN',
      joinedAt: day(900),
    },
    {
      id: managerId,
      orgId,
      name: 'Shahidul Islam',
      email: 'manager@hokcrockeries.test',
      phone: '01711111111',
      passwordHash: hash(STAFF_PASSWORD),
      role: 'MANAGER',
      area: 'Head office',
      monthlySalary: 22000,
      joinedAt: day(620),
    },
    ...srIds.map((srId, i) => ({
      id: srId,
      orgId,
      name: srProfiles[i].name,
      email: `sr${i + 1}@hokcrockeries.test`,
      phone: `017${22222222 + i * 11111111}`.slice(0, 11),
      passwordHash: hash(STAFF_PASSWORD),
      role: 'SR' as const,
      area: srProfiles[i].area,
      monthlySalary: srProfiles[i].salary,
      commissionRate: srProfiles[i].rate,
      joinedAt: day(400 - i * 60),
    })),
    {
      id: dealerId,
      orgId,
      name: 'Kamal Traders',
      email: 'dealer@hokcrockeries.test',
      phone: '01755555555',
      passwordHash: hash(STAFF_PASSWORD),
      role: 'DEALER',
      area: 'Regional dealer',
      joinedAt: day(300),
    },
  ]);

  /* --------------------------------------------------------- catalogue */
  const categoryIds = CATEGORY_NAMES.map(() => id());
  await db.insert(categories).values(
    CATEGORY_NAMES.map((name, i) => ({
      id: categoryIds[i],
      orgId,
      name,
      slug: slugify(name),
    })),
  );

  const productIds = CATALOGUE.map(() => id());
  await db.insert(products).values(
    CATALOGUE.map(([name, catIdx, unit, cost, sr, market, brand], i) => ({
      id: productIds[i],
      orgId,
      sku: `HC-${1001 + i}`,
      name,
      categoryId: categoryIds[catIdx],
      unit,
      costPrice: cost,
      srPrice: sr,
      marketPrice: market,
      lowStockThreshold: unit === 'set' ? 6 : 10,
      brand,
      description: `${name} by ${brand}. Sold by the ${unit}.`,
    })),
  );

  const catalogue = CATALOGUE.map(([name, , unit, cost, sr], i) => ({
    id: productIds[i],
    name,
    unit,
    cost,
    sr,
  }));

  /* ----------------------------------------------------- trading history */
  // Running balances so nothing is ever sold or handed out from thin air.
  const inStore = new Map(productIds.map((p) => [p, 0]));
  const vans = new Map(srIds.map((s) => [s, new Map<string, number>()]));

  let poSeq = 0;
  let chSeq = 0;
  let invSeq = 0;
  const docNo = (prefix: string, date: Date, seq: number) =>
    `${prefix}-${date.toISOString().slice(0, 10).replace(/-/g, '')}-${String(seq).padStart(4, '0')}`;

  const entryRows: (typeof stockEntries.$inferInsert)[] = [];
  const entryItemRows: (typeof stockEntryItems.$inferInsert)[] = [];
  const assignRows: (typeof assignments.$inferInsert)[] = [];
  const assignItemRows: (typeof assignmentItems.$inferInsert)[] = [];
  const saleRows: (typeof sales.$inferInsert)[] = [];
  const saleItemRows: (typeof saleItems.$inferInsert)[] = [];
  const depositRows: (typeof deposits.$inferInsert)[] = [];
  const expenseRows: (typeof expenses.$inferInsert)[] = [];
  const demandRows: (typeof demands.$inferInsert)[] = [];
  const demandItemRows: (typeof demandItems.$inferInsert)[] = [];

  for (let back = 92; back >= 0; back -= 1) {
    const date = day(back);

    // Purchases roughly every eleven days.
    if (back % 11 === 0) {
      const chosen = [...catalogue].sort(() => Math.random() - 0.5).slice(0, between(5, 9));
      const lines = chosen.map((p) => {
        const qty = between(12, 45);
        inStore.set(p.id, (inStore.get(p.id) ?? 0) + qty);
        return { productId: p.id, qty, unitCost: p.cost };
      });
      const extraCost = between(800, 2600);
      const total = purchaseTotal(lines, extraCost);
      poSeq += 1;
      const entryId = id();
      entryRows.push({
        id: entryId,
        orgId,
        invoiceNo: docNo('PO', date, poSeq),
        supplier: pick([
          'Shinepukur Ceramics',
          'Monno Ceramic',
          'RFL Distribution',
          'Kiam Metal',
          'Ocean Glass',
        ]),
        date,
        extraCost,
        total,
        paid: Math.random() > 0.3 ? total : round2(total * 0.6),
        note: 'Regular restock',
        createdBy: managerId,
      });
      entryItemRows.push(...lines.map((l) => ({ entryId, ...l })));
      expenseRows.push({
        orgId,
        date,
        category: 'PRODUCT',
        amount: total,
        title: `Stock purchase — ${entryRows[entryRows.length - 1].supplier}`,
        refType: 'STOCK_ENTRY',
        refId: entryId,
        createdBy: managerId,
      });
    }

    // Challans to reps roughly every six days.
    if (back % 6 === 0) {
      for (const srId of srIds) {
        const available = catalogue.filter((p) => (inStore.get(p.id) ?? 0) >= 6);
        if (available.length === 0) continue;
        const chosen = [...available].sort(() => Math.random() - 0.5).slice(0, between(3, 6));
        const lines: { productId: string; qty: number; srRate: number }[] = [];
        for (const p of chosen) {
          const qty = Math.min(inStore.get(p.id) ?? 0, between(4, 14));
          if (qty <= 0) continue;
          inStore.set(p.id, (inStore.get(p.id) ?? 0) - qty);
          const van = vans.get(srId)!;
          van.set(p.id, (van.get(p.id) ?? 0) + qty);
          lines.push({ productId: p.id, qty, srRate: p.sr });
        }
        if (lines.length === 0) continue;

        chSeq += 1;
        const assignmentId = id();
        assignRows.push({
          id: assignmentId,
          orgId,
          challanNo: docNo('CH', date, chSeq),
          srId,
          date,
          totalValue: assignmentValue(lines),
          note: 'Market load',
          createdBy: managerId,
        });
        assignItemRows.push(...lines.map((l) => ({ assignmentId, ...l })));
      }
    }

    // Sales most days.
    if (back % 2 === 0 || Math.random() > 0.45) {
      for (const srId of srIds) {
        const van = vans.get(srId)!;
        const sellable = [...van.entries()].filter(([, qty]) => qty > 0);
        if (sellable.length === 0) continue;

        for (let n = 0; n < between(1, 3); n += 1) {
          const picks = [...sellable].sort(() => Math.random() - 0.5).slice(0, between(1, 3));
          const lines: { productId: string; qty: number; rate: number }[] = [];
          for (const [productId] of picks) {
            const held = van.get(productId) ?? 0;
            if (held <= 0) continue;
            const product = catalogue.find((p) => p.id === productId)!;
            const qty = Math.min(held, between(1, 6));
            // Reps sometimes shade the rate a little, never below cost.
            const rate =
              Math.random() > 0.75 ? round2(product.sr * (0.97 + Math.random() * 0.06)) : product.sr;
            van.set(productId, held - qty);
            lines.push({ productId, qty, rate });
          }
          if (lines.length === 0) continue;

          const discount = Math.random() > 0.75 ? round2(saleTotal(lines) * 0.02) : 0;
          const total = saleTotal(lines, discount);
          const status =
            back > 3 ? (Math.random() > 0.08 ? 'DELIVERED' : 'CANCELLED') : 'PENDING';
          const paid =
            status === 'CANCELLED'
              ? 0
              : Math.random() > 0.28
                ? total
                : round2(total * (0.35 + Math.random() * 0.4));
          const [shopName, area] = pick(SHOPS);

          invSeq += 1;
          const saleId = id();
          saleRows.push({
            id: saleId,
            orgId,
            invoiceNo: docNo('INV', date, invSeq),
            srId,
            date,
            shopName,
            area,
            discount,
            total,
            paid,
            status,
            deliveredAt: status === 'DELIVERED' ? date : null,
            createdBy: srId,
          });
          saleItemRows.push(...lines.map((l) => ({ saleId, ...l })));

          // A cancelled invoice puts the goods back in the rep's van.
          if (status === 'CANCELLED') {
            for (const l of lines) van.set(l.productId, (van.get(l.productId) ?? 0) + l.qty);
          }
        }
      }
    }

    // Deposits every four days.
    if (back % 4 === 0 && back < 90) {
      for (const srId of srIds) {
        const collected = saleRows
          .filter((s) => s.srId === srId && s.status !== 'CANCELLED')
          .reduce((n, s) => n + (s.paid ?? 0), 0);
        const already = depositRows
          .filter((d) => d.srId === srId)
          .reduce((n, d) => n + (d.amount ?? 0), 0);
        const holding = collected - already;
        if (holding < 3000) continue;
        depositRows.push({
          orgId,
          srId,
          amount: round2(holding * (0.75 + Math.random() * 0.2)),
          date,
          method: pick(['CASH', 'CASH', 'BKASH', 'NAGAD', 'BANK'] as const),
          note: 'Market collection',
          receivedBy: managerId,
        });
      }
    }

    // Running costs every five days.
    if (back % 5 === 0) {
      const [category, title, min, max] = pick(MISC);
      expenseRows.push({
        orgId,
        date,
        category,
        amount: between(min, max),
        title,
        refType: 'MANUAL',
        createdBy: managerId,
      });
    }

    // Demand from the field every seven days.
    if (back % 7 === 0) {
      const srId = pick(srIds);
      const chosen = [...catalogue].sort(() => Math.random() - 0.5).slice(0, between(2, 4));
      const status = back > 14 ? 'FULFILLED' : back > 5 ? 'APPROVED' : 'PENDING';
      const demandId = id();
      demandRows.push({
        id: demandId,
        orgId,
        srId,
        date,
        status,
        priority: pick(['LOW', 'NORMAL', 'NORMAL', 'HIGH'] as const),
        note: pick([
          'Shops ask for this every week.',
          'Festival demand, please send early.',
          'Ran out in the market yesterday.',
          'Two shops booked in advance.',
        ]),
        handledBy: status === 'PENDING' ? null : managerId,
        handledAt: status === 'PENDING' ? null : date,
      });
      demandItemRows.push(
        ...chosen.map((p) => ({ demandId, productId: p.id, qty: between(6, 24) })),
      );
    }
  }

  /* -------------------------------------------------------------- payroll */
  const now = new Date();
  const salaryRows: (typeof salaryPayments.$inferInsert)[] = [];
  for (let back = 2; back >= 1; back -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 28));
    const month = d.toISOString().slice(0, 7);
    const staff = [
      { id: managerId, name: 'Shahidul Islam', base: 22000, rate: 0 },
      ...srIds.map((srId, i) => ({
        id: srId,
        name: srProfiles[i].name,
        base: srProfiles[i].salary,
        rate: srProfiles[i].rate,
      })),
    ];
    for (const person of staff) {
      const sold = saleRows
        .filter(
          (s) =>
            s.srId === person.id &&
            s.status !== 'CANCELLED' &&
            (s.date as Date).toISOString().slice(0, 7) === month,
        )
        .reduce((n, s) => n + (s.total ?? 0), 0);
      const commission = round2((sold * person.rate) / 100);
      const bonus = Math.random() > 0.6 ? between(500, 2000) : 0;
      const total = round2(person.base + commission + bonus);
      if (total <= 0) continue;
      const paymentId = id();
      salaryRows.push({
        id: paymentId,
        orgId,
        userId: person.id,
        month,
        base: person.base,
        commission,
        bonus,
        deduction: 0,
        total,
        paidAt: d,
        method: 'CASH',
        note: `Salary for ${month}`,
        paidBy: ownerId,
      });
      expenseRows.push({
        orgId,
        date: d,
        category: 'SALARY',
        amount: total,
        title: `Salary — ${person.name} (${month})`,
        refType: 'SALARY',
        refId: paymentId,
        createdBy: ownerId,
      });
    }
  }

  /* ---------------------------------------------------------------- write */
  // Chunked because some Postgres drivers cap the number of bind parameters.
  const insertAll = async <T>(table: never, rows: T[], size = 250) => {
    for (let i = 0; i < rows.length; i += size) {
      if (rows.length === 0) break;
      await db.insert(table).values(rows.slice(i, i + size) as never);
    }
  };

  await insertAll(stockEntries as never, entryRows);
  await insertAll(stockEntryItems as never, entryItemRows);
  await insertAll(assignments as never, assignRows);
  await insertAll(assignmentItems as never, assignItemRows);
  await insertAll(sales as never, saleRows);
  await insertAll(saleItems as never, saleItemRows);
  await insertAll(deposits as never, depositRows);
  await insertAll(demands as never, demandRows);
  await insertAll(demandItems as never, demandItemRows);
  await insertAll(salaryPayments as never, salaryRows);
  await insertAll(expenses as never, expenseRows);

  await db.insert(auditLogs).values([
    {
      orgId,
      userId: ownerId,
      userName: 'Abdul Hoque',
      action: 'workspace.create',
      entity: 'organization',
      entityId: orgId,
    },
    {
      orgId,
      userId: ownerId,
      userName: 'Abdul Hoque',
      action: 'product.import',
      entity: 'product',
      meta: { created: CATALOGUE.length },
    },
    {
      orgId,
      userId: managerId,
      userName: 'Shahidul Islam',
      action: 'stock.receive',
      entity: 'stockEntry',
      meta: { entries: entryRows.length },
    },
  ]);

  const revenue = saleRows
    .filter((s) => s.status !== 'CANCELLED')
    .reduce((n, s) => n + (s.total ?? 0), 0);

  console.log(`
  Seeded the "${ORG_NAME}" workspace.

    ${CATALOGUE.length} products in ${CATEGORY_NAMES.length} categories
    ${entryRows.length} purchases, ${assignRows.length} challans
    ${saleRows.length} invoices worth ${Math.round(revenue).toLocaleString()}
    ${depositRows.length} deposits, ${expenseRows.length} expense lines, ${salaryRows.length} salary payments

  Sign in with:

    Owner     ${ADMIN_EMAIL}  /  ${ADMIN_PASSWORD}
    Manager   manager@hokcrockeries.test  /  ${STAFF_PASSWORD}
    Sales rep sr1@hokcrockeries.test  /  ${STAFF_PASSWORD}
    Dealer    dealer@hokcrockeries.test  /  ${STAFF_PASSWORD}

  Change these passwords before putting this in front of real users.
`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
