import { fail, ok, parseJson, route } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { newId, nextDocNumber, readDb, writeDb } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { saleTotal, srStockLedger } from '@/lib/analytics';
import { can } from '@/lib/permissions';
import { saleSchema } from '@/lib/validation';
import type { Sale } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  const user = await requireUser();
  if (!can(user.role, 'sale.view.all') && !can(user.role, 'sale.view.own')) {
    return fail('Your role does not allow this action.', 403);
  }

  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? '';
  const status = url.searchParams.get('status') ?? '';
  const search = (url.searchParams.get('q') ?? '').trim().toLowerCase();
  const requestedSr = url.searchParams.get('sr') ?? '';

  // An SR is pinned to their own invoices no matter what the query string says.
  const srFilter = can(user.role, 'sale.view.all') ? requestedSr : user.id;

  const db = await readDb();
  const srName = new Map(db.users.map((u) => [u.id, u.name]));
  const productName = new Map(db.products.map((p) => [p.id, p.name]));

  const sales = db.sales
    .filter((s) => (!srFilter || s.srId === srFilter) && (!month || s.date.startsWith(month)))
    .filter((s) => !status || s.status === status)
    .filter(
      (s) =>
        !search ||
        [s.invoiceNo, s.shopName, s.customerName, s.area]
          .filter(Boolean)
          .some((f) => String(f).toLowerCase().includes(search)),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .map((s) => ({
      ...s,
      srName: srName.get(s.srId) ?? 'Unknown SR',
      due: Math.round((s.total - s.paid) * 100) / 100,
      units: s.items.reduce((n, i) => n + i.qty, 0),
      items: s.items.map((i) => ({
        ...i,
        productName: productName.get(i.productId) ?? 'Removed product',
      })),
    }));

  const totals = {
    invoices: sales.length,
    value: sales.filter((s) => s.status !== 'CANCELLED').reduce((n, s) => n + s.total, 0),
    collected: sales.filter((s) => s.status !== 'CANCELLED').reduce((n, s) => n + s.paid, 0),
    delivered: sales.filter((s) => s.status === 'DELIVERED').length,
    pending: sales.filter((s) => s.status === 'PENDING').length,
  };

  return ok({ sales, totals, scope: srFilter ? 'own' : 'all' });
});

export const POST = route(async (request: Request) => {
  const user = await requireUser();
  if (!can(user.role, 'sale.create')) return fail('Your role does not allow this action.', 403);
  const input = saleSchema.parse(await parseJson(request));

  // An SR always books against themselves; a manager may book for any SR.
  const srId = user.role === 'SR' ? user.id : (input.srId ?? user.id);

  const result = await writeDb((db) => {
    const sr = db.users.find((u) => u.id === srId);
    if (!sr) return { ok: false, error: 'That SR does not exist.' } as const;

    const total = saleTotal(input);
    if (input.paid > total) {
      return { ok: false, error: 'Cash collected cannot be more than the invoice total.' } as const;
    }

    // The SR can only sell what is actually loaded in their van.
    const held = srStockLedger(db, srId);
    for (const item of input.items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (!product) return { ok: false, error: `Unknown product: ${item.productId}` } as const;
      const available = held.get(item.productId) ?? 0;
      if (item.qty > available) {
        return {
          ok: false,
          error: `You hold ${available} ${product.unit} of "${product.name}" — cannot sell ${item.qty}. Raise a demand to get more stock.`,
        } as const;
      }
    }

    const now = new Date().toISOString();
    const sale: Sale = {
      id: newId('sal'),
      invoiceNo: nextDocNumber('INV', db.sales.map((s) => s.invoiceNo)),
      srId,
      date: input.date,
      shopName: input.shopName,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      area: input.area ?? sr.area,
      items: input.items,
      discount: input.discount,
      total,
      paid: input.paid,
      status: input.status,
      deliveredAt: input.status === 'DELIVERED' ? now : undefined,
      note: input.note,
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    };
    db.sales.push(sale);

    logAction(db, user, 'sale.create', 'sale', sale.id, {
      invoice: sale.invoiceNo,
      sr: sr.name,
      total: sale.total,
    });
    return { ok: true, sale } as const;
  });

  if (!result.ok) return fail(result.error, 422);
  return ok({ sale: result.sale }, { status: 201 });
});
