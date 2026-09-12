import { and, desc, eq, inArray, or, ilike, sql } from 'drizzle-orm';

import { fail, nextDocNumber, ok, parseJson, route } from '@/lib/api';
import { requireAnyCapability } from '@/lib/auth';
import type { Database } from '@/db/client';
import { products, saleItems, sales, users } from '@/db/schema';
import { srAvailableQty } from '@/db/queries/stock';
import { withTransaction } from '@/db/tx';
import { logAction } from '@/lib/audit';
import { round2, saleTotal, toBusinessDate } from '@/lib/money';
import { can } from '@/lib/permissions';
import { saleSchema } from '@/lib/validation';
import type { SaleStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  const { db, orgId, user, role } = await requireAnyCapability(['sale.view.all', 'sale.view.own']);
  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? '';
  const status = url.searchParams.get('status') ?? '';
  const search = (url.searchParams.get('q') ?? '').trim();

  // A rep is pinned to their own invoices no matter what the query string says.
  const srFilter = can(role, 'sale.view.all') ? (url.searchParams.get('sr') ?? '') : user.id;

  const filters = [eq(sales.orgId, orgId)];
  if (srFilter) filters.push(eq(sales.srId, srFilter));
  if (status) filters.push(eq(sales.status, status as SaleStatus));
  if (search) {
    const term = `%${search}%`;
    filters.push(
      or(
        ilike(sales.invoiceNo, term),
        ilike(sales.shopName, term),
        ilike(sales.customerName, term),
        ilike(sales.area, term),
      )!,
    );
  }
  const monthFilter = month
    ? sql`AND to_char(${sales.date} AT TIME ZONE 'UTC', 'YYYY-MM') = ${month}`
    : sql``;

  const rows = await db
    .select({
      id: sales.id,
      invoiceNo: sales.invoiceNo,
      srId: sales.srId,
      srName: users.name,
      date: sales.date,
      shopName: sales.shopName,
      customerName: sales.customerName,
      customerPhone: sales.customerPhone,
      area: sales.area,
      discount: sales.discount,
      total: sales.total,
      paid: sales.paid,
      status: sales.status,
      note: sales.note,
      deliveredAt: sales.deliveredAt,
    })
    .from(sales)
    .innerJoin(users, eq(users.id, sales.srId))
    .where(sql`${and(...filters)} ${monthFilter}`)
    .orderBy(desc(sales.date), desc(sales.createdAt))
    .limit(500);

  const ids = rows.map((r) => r.id);
  const items = ids.length
    ? await db
        .select({
          saleId: saleItems.saleId,
          productId: saleItems.productId,
          productName: products.name,
          unit: products.unit,
          qty: saleItems.qty,
          rate: saleItems.rate,
        })
        .from(saleItems)
        .innerJoin(products, eq(products.id, saleItems.productId))
        .where(inArray(saleItems.saleId, ids))
    : [];

  const bySale = new Map<string, typeof items>();
  for (const item of items) {
    const list = bySale.get(item.saleId) ?? [];
    list.push(item);
    bySale.set(item.saleId, list);
  }

  const list = rows.map((r) => {
    const lines = bySale.get(r.id) ?? [];
    return {
      ...r,
      date: r.date.toISOString(),
      deliveredAt: r.deliveredAt ? r.deliveredAt.toISOString() : null,
      due: round2(r.total - r.paid),
      units: lines.reduce((n, i) => n + i.qty, 0),
      items: lines,
    };
  });

  const live = list.filter((s) => s.status !== 'CANCELLED');
  return ok({
    sales: list,
    scope: srFilter ? 'own' : 'all',
    totals: {
      invoices: list.length,
      value: round2(live.reduce((n, s) => n + s.total, 0)),
      collected: round2(live.reduce((n, s) => n + s.paid, 0)),
      delivered: list.filter((s) => s.status === 'DELIVERED').length,
      pending: list.filter((s) => s.status === 'PENDING').length,
    },
  });
});

/**
 * Record a sale.
 *
 * A rep always books against themselves; the office may book on a rep's behalf.
 * The van-stock check and the insert share a transaction, so a rep cannot sell
 * the same carton twice by submitting two invoices at once.
 */
export const POST = route(async (request: Request) => {
  const { db, orgId, user, role } = await requireAnyCapability(['sale.create']);
  const input = saleSchema.parse(await parseJson(request));
  const srId = role === 'SR' ? user.id : (input.srId ?? user.id);

  const [rep] = await db
    .select({ id: users.id, name: users.name, area: users.area })
    .from(users)
    .where(and(eq(users.id, srId), eq(users.orgId, orgId)))
    .limit(1);
  if (!rep) return fail('That sales rep does not exist.', 422);

  const total = saleTotal(input.items, input.discount);
  if (input.paid > total) {
    return fail('Cash collected cannot be more than the invoice total.', 422);
  }

  const productIds = input.items.map((i) => i.productId);
  const catalogue = await db
    .select({ id: products.id, name: products.name, unit: products.unit })
    .from(products)
    .where(and(eq(products.orgId, orgId), inArray(products.id, productIds)));
  const info = new Map(catalogue.map((p) => [p.id, p]));
  if (catalogue.length !== new Set(productIds).size) {
    return fail('One or more products on this invoice do not exist.', 422);
  }

  const date = toBusinessDate(input.date);

  const result = await withTransaction(db, async (tx) => {
    const database = tx as Database;

    const held = await srAvailableQty(database, orgId, srId, productIds);
    for (const item of input.items) {
      const have = held.get(item.productId) ?? 0;
      if (item.qty > have) {
        const p = info.get(item.productId);
        return {
          ok: false as const,
          error: `You hold ${have} ${p?.unit ?? 'units'} of "${p?.name ?? 'that product'}" — cannot sell ${item.qty}. Raise a demand to get more stock.`,
        };
      }
    }

    const existingNos = await database
      .select({ invoiceNo: sales.invoiceNo })
      .from(sales)
      .where(eq(sales.orgId, orgId));

    const [created] = await database
      .insert(sales)
      .values({
        orgId,
        invoiceNo: nextDocNumber('INV', existingNos.map((s) => s.invoiceNo)),
        srId,
        date,
        shopName: input.shopName,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        area: input.area ?? rep.area,
        discount: input.discount,
        total,
        paid: input.paid,
        status: input.status,
        deliveredAt: input.status === 'DELIVERED' ? new Date() : null,
        note: input.note,
        createdBy: user.id,
      })
      .returning();

    await database.insert(saleItems).values(
      input.items.map((i) => ({
        saleId: created.id,
        productId: i.productId,
        qty: i.qty,
        rate: i.rate,
      })),
    );

    return { ok: true as const, sale: created };
  });

  if (!result.ok) return fail(result.error, 422);

  await logAction(db, user, 'sale.create', 'sale', result.sale.id, {
    invoice: result.sale.invoiceNo,
    sr: rep.name,
    total,
  });

  return ok(
    { sale: { ...result.sale, date: result.sale.date.toISOString() } },
    { status: 201 },
  );
});
