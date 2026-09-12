/**
 * Seeds the JSON database with an owner account, a manager, three SRs, a
 * dealer, a realistic crockery catalogue and roughly three months of trading
 * history, so every dashboard has something meaningful to show.
 *
 *   npm run seed            # refuses if data already exists
 *   npm run seed -- --force # wipes and reseeds
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';

const ROOT = process.cwd();
const DATA_DIR = path.resolve(ROOT, process.env.DATA_DIR || '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const FORCE = process.argv.includes('--force');

const ADMIN_PHONE = process.env.SEED_ADMIN_PHONE || '01700000000';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin1234';

const id = (prefix) => `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
const iso = (d) => d.toISOString();
const day = (offsetDays) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  d.setUTCHours(9, 0, 0, 0);
  return d;
};
const dateOnly = (d) => d.toISOString().slice(0, 10);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const between = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const CATEGORIES = [
  { name: 'Dinner Sets', nameBn: 'ডিনার সেট', icon: 'utensils' },
  { name: 'Plates & Bowls', nameBn: 'প্লেট ও বাটি', icon: 'circle' },
  { name: 'Glassware', nameBn: 'কাচের সামগ্রী', icon: 'wine' },
  { name: 'Mugs & Cups', nameBn: 'মগ ও কাপ', icon: 'coffee' },
  { name: 'Cookware', nameBn: 'রান্নার সামগ্রী', icon: 'cooking-pot' },
  { name: 'Storage & Jars', nameBn: 'সংরক্ষণ পাত্র', icon: 'container' },
  { name: 'Cutlery', nameBn: 'চামচ ও ছুরি', icon: 'utensils-crossed' },
];

// [name, nameBn, categoryIndex, unit, cost, srRate, market, brand]
const PRODUCTS = [
  ['Dinner Set 32 pcs — Ivory', 'ডিনার সেট ৩২ পিস', 0, 'set', 2150, 2650, 3200, 'Shinepukur'],
  ['Dinner Set 22 pcs — Blue Rim', 'ডিনার সেট ২২ পিস', 0, 'set', 1480, 1850, 2250, 'Monno'],
  ['Dinner Set 40 pcs — Gold Line', 'ডিনার সেট ৪০ পিস', 0, 'set', 3400, 4150, 4900, 'Shinepukur'],
  ['Dinner Plate 10"', 'ডিনার প্লেট ১০ ইঞ্চি', 1, 'dozen', 540, 720, 950, 'Monno'],
  ['Dinner Plate 8"', 'ডিনার প্লেট ৮ ইঞ্চি', 1, 'dozen', 430, 580, 760, 'Monno'],
  ['Soup Bowl Medium', 'স্যুপ বাটি মাঝারি', 1, 'dozen', 380, 510, 680, 'Farr'],
  ['Curry Bowl Large', 'তরকারির বাটি বড়', 1, 'dozen', 620, 820, 1080, 'Farr'],
  ['Serving Platter Oval', 'পরিবেশন প্লেট ওভাল', 1, 'pcs', 210, 285, 380, 'Shinepukur'],
  ['Water Glass 250ml', 'পানির গ্লাস ২৫০ মিলি', 2, 'dozen', 290, 390, 520, 'Ocean'],
  ['Juice Glass Set 6 pcs', 'জুস গ্লাস সেট', 2, 'set', 340, 450, 590, 'Ocean'],
  ['Glass Jug 1.5L', 'কাচের জগ ১.৫ লিটার', 2, 'pcs', 280, 380, 490, 'Ocean'],
  ['Ceramic Mug Printed', 'সিরামিক মগ প্রিন্টেড', 3, 'dozen', 480, 640, 840, 'Monno'],
  ['Tea Cup & Saucer Set', 'চা কাপ ও পিরিচ সেট', 3, 'set', 620, 810, 1050, 'Shinepukur'],
  ['Coffee Mug Bone China', 'কফি মগ বোন চায়না', 3, 'dozen', 760, 990, 1290, 'Shinepukur'],
  ['Non-stick Fry Pan 24cm', 'নন-স্টিক ফ্রাই প্যান', 4, 'pcs', 690, 890, 1150, 'Kiam'],
  ['Pressure Cooker 3L', 'প্রেসার কুকার ৩ লিটার', 4, 'pcs', 1850, 2300, 2850, 'Kiam'],
  ['Stainless Karai 26cm', 'স্টিল কড়াই ২৬ সেমি', 4, 'pcs', 780, 1020, 1320, 'Kiam'],
  ['Casserole Hot Pot 2.5L', 'হট পট ক্যাসারোল', 4, 'pcs', 640, 850, 1100, 'RFL'],
  ['Airtight Jar 1L', 'এয়ারটাইট জার ১ লিটার', 5, 'dozen', 420, 560, 740, 'RFL'],
  ['Spice Rack Set 8 pcs', 'মসলার বয়াম সেট', 5, 'set', 390, 520, 680, 'RFL'],
  ['Lunch Box 3 Layer', 'লাঞ্চ বক্স ৩ স্তর', 5, 'pcs', 310, 420, 550, 'RFL'],
  ['Cutlery Set 24 pcs', 'চামচ-ছুরি সেট ২৪ পিস', 6, 'set', 720, 950, 1250, 'Vision'],
  ['Serving Spoon Steel', 'পরিবেশন চামচ স্টিল', 6, 'dozen', 240, 330, 440, 'Vision'],
  ['Tea Spoon Steel', 'চা চামচ স্টিল', 6, 'dozen', 150, 210, 285, 'Vision'],
];

const SHOPS = [
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

const MISC_EXPENSES = [
  ['TRANSPORT', 'Truck fare — Dhaka to godown', 3500, 8000],
  ['TRANSPORT', 'Van rent for SR delivery', 1200, 2800],
  ['RENT', 'Godown rent', 12000, 12000],
  ['UTILITY', 'Electricity bill', 2200, 4800],
  ['UTILITY', 'Internet & mobile bills', 1400, 2200],
  ['MARKETING', 'Shop banner & printing', 1800, 5500],
  ['MAINTENANCE', 'Shelf repair & packing material', 900, 3200],
  ['OTHER', 'Tea, misc office cost', 600, 1800],
];

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  if (!FORCE) {
    try {
      const existing = JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
      if (existing?.users?.length) {
        console.error(
          `\n  ${DB_FILE} already has ${existing.users.length} account(s).\n` +
            '  Re-run with --force to wipe it and seed fresh data.\n',
        );
        process.exit(1);
      }
    } catch {
      // No file yet — that is exactly what we want.
    }
  }

  const now = new Date();
  const hash = (pw) => bcrypt.hashSync(pw, 10);

  /* ------------------------------------------------------------- users */
  const admin = {
    id: id('usr'),
    name: 'Abdul Hoque',
    phone: ADMIN_PHONE,
    email: 'owner@hokcrockeries.com',
    passwordHash: hash(ADMIN_PASSWORD),
    role: 'ADMIN',
    active: true,
    monthlySalary: 0,
    commissionRate: 0,
    joinedAt: iso(day(900)),
    note: 'Proprietor',
    createdAt: iso(day(900)),
    updatedAt: iso(now),
  };

  const manager = {
    id: id('usr'),
    name: 'Shahidul Islam',
    phone: '01711111111',
    email: 'manager@hokcrockeries.com',
    passwordHash: hash('manager1234'),
    role: 'MANAGER',
    active: true,
    area: 'Head office',
    monthlySalary: 22000,
    commissionRate: 0,
    joinedAt: iso(day(620)),
    createdAt: iso(day(620)),
    updatedAt: iso(now),
  };

  const srs = [
    { name: 'Jahangir Alam', phone: '01722222222', area: 'Sadar & Station Road', salary: 14000, rate: 2 },
    { name: 'Rakibul Hasan', phone: '01733333333', area: 'Boro Bazar & New Market', salary: 13500, rate: 2.5 },
    { name: 'Mizanur Rahman', phone: '01744444444', area: 'College Road & Thana Road', salary: 13000, rate: 2 },
  ].map((s, i) => ({
    id: id('usr'),
    name: s.name,
    phone: s.phone,
    email: `sr${i + 1}@hokcrockeries.com`,
    passwordHash: hash('sr1234'),
    role: 'SR',
    active: true,
    area: s.area,
    monthlySalary: s.salary,
    commissionRate: s.rate,
    joinedAt: iso(day(400 - i * 60)),
    createdAt: iso(day(400 - i * 60)),
    updatedAt: iso(now),
  }));

  const dealer = {
    id: id('usr'),
    name: 'Kamal Traders (Dealer)',
    phone: '01755555555',
    email: 'dealer@hokcrockeries.com',
    passwordHash: hash('dealer1234'),
    role: 'DEALER',
    active: true,
    area: 'Regional dealer',
    monthlySalary: 0,
    commissionRate: 0,
    joinedAt: iso(day(300)),
    createdAt: iso(day(300)),
    updatedAt: iso(now),
  };

  const users = [admin, manager, ...srs, dealer];

  /* -------------------------------------------------------- categories */
  const categories = CATEGORIES.map((c) => ({
    id: id('cat'),
    name: c.name,
    nameBn: c.nameBn,
    slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    icon: c.icon,
    createdAt: iso(day(500)),
  }));

  /* ---------------------------------------------------------- products */
  const products = PRODUCTS.map(([name, nameBn, catIdx, unit, cost, sr, market, brand], i) => ({
    id: id('prd'),
    sku: `HC-${String(1001 + i)}`,
    name,
    nameBn,
    categoryId: categories[catIdx].id,
    unit,
    costPrice: cost,
    srPrice: sr,
    marketPrice: market,
    stock: 0,
    lowStockThreshold: unit === 'set' ? 6 : 10,
    brand,
    description: `${name} — ${brand}. Sold by the ${unit}.`,
    active: true,
    createdAt: iso(day(500 - i)),
    updatedAt: iso(now),
  }));

  /* ------------------------------------------------------ trading data */
  const stockEntries = [];
  const assignments = [];
  const sales = [];
  const deposits = [];
  const demands = [];
  const expenses = [];
  const salaries = [];
  const auditLogs = [];
  const returns = [];

  // Running availability so nothing is ever handed out or sold from thin air.
  const inStore = new Map(products.map((p) => [p.id, 0]));
  const withSr = new Map(srs.map((s) => [s.id, new Map()]));

  let invoiceSeq = 0;
  let poSeq = 0;
  let challanSeq = 0;
  const docNo = (prefix, date, seq) =>
    `${prefix}-${dateOnly(date).replace(/-/g, '')}-${String(seq).padStart(4, '0')}`;

  // Three months of activity, oldest first.
  for (let dayOffset = 92; dayOffset >= 0; dayOffset -= 1) {
    const date = day(dayOffset);
    const dateStr = dateOnly(date);

    // ---- purchases roughly every 11 days
    if (dayOffset % 11 === 0) {
      const lines = [];
      const chosen = [...products].sort(() => Math.random() - 0.5).slice(0, between(5, 9));
      for (const product of chosen) {
        const qty = between(12, 45);
        lines.push({ productId: product.id, qty, unitCost: product.costPrice });
        inStore.set(product.id, inStore.get(product.id) + qty);
      }
      const extraCost = between(800, 2600);
      const total = round2(
        lines.reduce((n, l) => n + l.qty * l.unitCost, 0) + extraCost,
      );
      poSeq += 1;
      const entry = {
        id: id('stk'),
        invoiceNo: docNo('PO', date, poSeq),
        supplier: pick(['Shinepukur Ceramics', 'Monno Ceramic', 'RFL Distribution', 'Kiam Metal', 'Ocean Glass BD']),
        date: dateStr,
        items: lines,
        extraCost,
        total,
        paid: Math.random() > 0.3 ? total : round2(total * 0.6),
        note: 'Regular restock',
        createdBy: manager.id,
        createdAt: iso(date),
      };
      stockEntries.push(entry);
      expenses.push({
        id: id('exp'),
        date: dateStr,
        category: 'PRODUCT',
        amount: total,
        title: `Stock purchase — ${entry.supplier}`,
        note: entry.invoiceNo,
        refType: 'STOCK_ENTRY',
        refId: entry.id,
        createdBy: manager.id,
        createdAt: iso(date),
      });
    }

    // ---- challans to SRs roughly every 6 days
    if (dayOffset % 6 === 0) {
      for (const sr of srs) {
        const available = products.filter((p) => inStore.get(p.id) >= 6);
        if (available.length === 0) continue;
        const chosen = available.sort(() => Math.random() - 0.5).slice(0, between(3, 6));
        const lines = [];
        for (const product of chosen) {
          const qty = Math.min(inStore.get(product.id), between(4, 14));
          if (qty <= 0) continue;
          lines.push({ productId: product.id, qty, srRate: product.srPrice });
          inStore.set(product.id, inStore.get(product.id) - qty);
          const held = withSr.get(sr.id);
          held.set(product.id, (held.get(product.id) ?? 0) + qty);
        }
        if (lines.length === 0) continue;
        challanSeq += 1;
        assignments.push({
          id: id('asg'),
          challanNo: docNo('CH', date, challanSeq),
          srId: sr.id,
          date: dateStr,
          items: lines,
          totalValue: round2(lines.reduce((n, l) => n + l.qty * l.srRate, 0)),
          note: 'Market load',
          createdBy: manager.id,
          createdAt: iso(date),
        });
      }
    }

    // ---- sales, most days
    if (dayOffset % 2 === 0 || Math.random() > 0.45) {
      for (const sr of srs) {
        const held = withSr.get(sr.id);
        const sellable = [...held.entries()].filter(([, qty]) => qty > 0);
        if (sellable.length === 0) continue;

        for (let invoice = 0; invoice < between(1, 3); invoice += 1) {
          const lines = [];
          const picks = [...sellable].sort(() => Math.random() - 0.5).slice(0, between(1, 3));
          for (const [productId, available] of picks) {
            const current = held.get(productId) ?? 0;
            if (current <= 0) continue;
            const qty = Math.min(current, between(1, Math.max(1, Math.min(6, available))));
            const product = products.find((p) => p.id === productId);
            // Reps occasionally shade the rate a little; never below cost.
            const rate = Math.random() > 0.75
              ? round2(product.srPrice * (0.97 + Math.random() * 0.06))
              : product.srPrice;
            lines.push({ productId, qty, rate });
            held.set(productId, current - qty);
          }
          if (lines.length === 0) continue;

          const subtotal = round2(lines.reduce((n, l) => n + l.qty * l.rate, 0));
          const discount = Math.random() > 0.75 ? round2(subtotal * 0.02) : 0;
          const total = round2(subtotal - discount);
          // Most shops pay in full; some run a tab.
          const paid =
            Math.random() > 0.28 ? total : round2(total * (0.35 + Math.random() * 0.4));
          const [shopName, area] = pick(SHOPS);
          const status =
            dayOffset > 3 ? (Math.random() > 0.08 ? 'DELIVERED' : 'CANCELLED') : 'PENDING';

          invoiceSeq += 1;
          sales.push({
            id: id('sal'),
            invoiceNo: docNo('INV', date, invoiceSeq),
            srId: sr.id,
            date: dateStr,
            shopName,
            customerName: undefined,
            customerPhone: undefined,
            area,
            items: lines,
            discount,
            total,
            paid: status === 'CANCELLED' ? 0 : paid,
            status,
            deliveredAt: status === 'DELIVERED' ? iso(date) : undefined,
            createdBy: sr.id,
            createdAt: iso(date),
            updatedAt: iso(date),
          });

          // A cancelled invoice puts the goods back in the rep's van.
          if (status === 'CANCELLED') {
            for (const line of lines) {
              held.set(line.productId, (held.get(line.productId) ?? 0) + line.qty);
            }
            sales[sales.length - 1].items = lines;
          }
        }
      }
    }

    // ---- deposits every 4 days
    if (dayOffset % 4 === 0 && dayOffset < 90) {
      for (const sr of srs) {
        const collected = sales
          .filter((s) => s.srId === sr.id && s.status !== 'CANCELLED' && s.date <= dateStr)
          .reduce((n, s) => n + s.paid, 0);
        const alreadyDeposited = deposits
          .filter((d) => d.srId === sr.id)
          .reduce((n, d) => n + d.amount, 0);
        const holding = collected - alreadyDeposited;
        if (holding < 3000) continue;
        // Reps hand over most of what they hold, keeping a small float.
        const amount = round2(holding * (0.75 + Math.random() * 0.2));
        deposits.push({
          id: id('dep'),
          srId: sr.id,
          amount,
          date: dateStr,
          method: pick(['CASH', 'CASH', 'BKASH', 'NAGAD', 'BANK']),
          reference: undefined,
          note: 'Market collection',
          receivedBy: manager.id,
          createdAt: iso(date),
        });
      }
    }

    // ---- misc expenses every 5 days
    if (dayOffset % 5 === 0) {
      const [category, title, min, max] = pick(MISC_EXPENSES);
      expenses.push({
        id: id('exp'),
        date: dateStr,
        category,
        amount: between(min, max),
        title,
        refType: 'MANUAL',
        createdBy: manager.id,
        createdAt: iso(date),
      });
    }

    // ---- demand from the field every 7 days
    if (dayOffset % 7 === 0) {
      const sr = pick(srs);
      const chosen = [...products].sort(() => Math.random() - 0.5).slice(0, between(2, 4));
      const status = dayOffset > 14 ? 'FULFILLED' : dayOffset > 5 ? 'APPROVED' : 'PENDING';
      demands.push({
        id: id('dmd'),
        srId: sr.id,
        date: dateStr,
        items: chosen.map((p) => ({ productId: p.id, qty: between(6, 24) })),
        status,
        priority: pick(['LOW', 'NORMAL', 'NORMAL', 'HIGH']),
        note: pick([
          'Shops are asking for this every week.',
          'Festival demand, please send early.',
          'Ran out in the market yesterday.',
          'Two shops booked in advance.',
        ]),
        handledBy: status === 'PENDING' ? undefined : manager.id,
        handledAt: status === 'PENDING' ? undefined : iso(date),
        createdAt: iso(date),
      });
    }
  }

  // Mirror the final store position onto each product record.
  for (const product of products) product.stock = inStore.get(product.id) ?? 0;

  /* ------------------------------------------------------------ payroll */
  // Pay the two full months before the current one.
  for (let back = 2; back >= 1; back -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 28, 10));
    const month = d.toISOString().slice(0, 7);
    for (const staff of [manager, ...srs]) {
      const soldValue = sales
        .filter((s) => s.srId === staff.id && s.status !== 'CANCELLED' && s.date.startsWith(month))
        .reduce((n, s) => n + s.total, 0);
      const commission = round2((soldValue * staff.commissionRate) / 100);
      const bonus = Math.random() > 0.6 ? between(500, 2000) : 0;
      const total = round2(staff.monthlySalary + commission + bonus);
      if (total <= 0) continue;
      const payment = {
        id: id('sal'),
        userId: staff.id,
        month,
        base: staff.monthlySalary,
        commission,
        bonus,
        deduction: 0,
        total,
        paidAt: iso(d),
        method: 'CASH',
        note: `Salary for ${month}`,
        paidBy: admin.id,
        createdAt: iso(d),
      };
      salaries.push(payment);
      expenses.push({
        id: id('exp'),
        date: dateOnly(d),
        category: 'SALARY',
        amount: total,
        title: `Salary — ${staff.name} (${month})`,
        refType: 'SALARY',
        refId: payment.id,
        createdBy: admin.id,
        createdAt: iso(d),
      });
    }
  }

  /* -------------------------------------------------------- audit trail */
  auditLogs.push(
    ...[
      { action: 'user.create', entity: 'user', by: admin, meta: { role: 'MANAGER' } },
      { action: 'product.import', entity: 'product', by: admin, meta: { created: products.length } },
      { action: 'stock.receive', entity: 'stockEntry', by: manager, meta: { entries: stockEntries.length } },
      { action: 'assignment.create', entity: 'assignment', by: manager, meta: { challans: assignments.length } },
      { action: 'deposit.record', entity: 'deposit', by: manager, meta: { count: deposits.length } },
      { action: 'salary.pay', entity: 'salary', by: admin, meta: { payments: salaries.length } },
    ].map((a, i) => ({
      id: id('log'),
      userId: a.by.id,
      userName: a.by.name,
      action: a.action,
      entity: a.entity,
      meta: a.meta,
      createdAt: iso(day(i)),
    })),
  );

  const database = {
    users,
    categories,
    products,
    stockEntries,
    assignments,
    returns,
    sales,
    demands,
    deposits,
    expenses,
    salaries,
    auditLogs,
    settings: {
      companyName: 'Hok Crockeries',
      companyNameBn: 'হক ক্রোকারিজ',
      tagline: 'Crockery & houseware distribution, run on real numbers.',
      address: 'Sadar Bazar, Bangladesh',
      phone: ADMIN_PHONE,
      email: 'info@hokcrockeries.com',
      currency: '৳',
      lowStockThreshold: 10,
      updatedAt: iso(now),
    },
  };

  await fs.writeFile(DB_FILE, JSON.stringify(database, null, 2), 'utf8');

  const revenue = sales
    .filter((s) => s.status !== 'CANCELLED')
    .reduce((n, s) => n + s.total, 0);

  console.log(`
  Seeded ${DB_FILE}

    ${products.length} products across ${categories.length} categories
    ${stockEntries.length} purchases, ${assignments.length} challans
    ${sales.length} invoices worth ${Math.round(revenue).toLocaleString()} BDT
    ${deposits.length} deposits, ${expenses.length} expense lines, ${salaries.length} salary payments

  Sign in with:

    Owner    ${ADMIN_PHONE}   /  ${ADMIN_PASSWORD}
    Manager  ${manager.phone}   /  manager1234
    SR       ${srs[0].phone}   /  sr1234
    Dealer   ${dealer.phone}   /  dealer1234

  Change these passwords before going live.
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
