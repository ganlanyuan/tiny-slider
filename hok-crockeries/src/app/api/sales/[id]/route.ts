import { and, eq } from 'drizzle-orm';

import { fail, ok, parseJson, route } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { products, saleItems, sales } from '@/db/schema';
import { logAction } from '@/lib/audit';
import { round2, saleTotal } from '@/lib/money';
import { can } from '@/lib/permissions';
import { saleUpdateSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_request: Request, ctx: Ctx) => {
  const { db, orgId, user, role } = await requireAuth();
  const { id } = await ctx.params;

  const [sale] = await db
    .select()
    .from(sales)
    .where(and(eq(sales.id, id), eq(sales.orgId, orgId)))
    .limit(1);
  if (!sale) return fail('Invoice not found.', 404);
  if (!can(role, 'sale.view.all') && sale.srId !== user.id) {
    return fail('That invoice belongs to another sales rep.', 403);
  }

  const items = await db
    .select({
      productId: saleItems.productId,
      productName: products.name,
      unit: products.unit,
      qty: saleItems.qty,
      rate: saleItems.rate,
    })
    .from(saleItems)
    .innerJoin(products, eq(products.id, saleItems.productId))
    .where(eq(saleItems.saleId, id));

  return ok({
    sale: {
      ...sale,
      date: sale.date.toISOString(),
      deliveredAt: sale.deliveredAt ? sale.deliveredAt.toISOString() : null,
      due: round2(sale.total - sale.paid),
      items,
    },
  });
});

export const PATCH = route(async (request: Request, ctx: Ctx) => {
  const { db, orgId, user, role } = await requireAuth();
  const { id } = await ctx.params;
  const patch = saleUpdateSchema.parse(await parseJson(request));

  const [sale] = await db
    .select()
    .from(sales)
    .where(and(eq(sales.id, id), eq(sales.orgId, orgId)))
    .limit(1);
  if (!sale) return fail('Invoice not found.', 404);

  const isOwnInvoice = sale.srId === user.id;
  const isManager = can(role, 'sale.manage');
  if (!isManager && !isOwnInvoice) {
    return fail('That invoice belongs to another sales rep.', 403);
  }

  // A rep may record a later payment and confirm delivery on their own invoice.
  // Repricing and cancelling stay with the office.
  if (!isManager) {
    if (patch.discount !== undefined || patch.shopName || patch.area !== undefined) {
      return fail('Only a manager can edit invoice amounts. Ask the office to adjust it.', 403);
    }
    if (patch.status === 'CANCELLED') {
      return fail('Only a manager can cancel an invoice.', 403);
    }
  }

  const nextDiscount = patch.discount ?? sale.discount;
  let nextTotal = sale.total;
  if (patch.discount !== undefined) {
    const items = await db
      .select({ qty: saleItems.qty, rate: saleItems.rate })
      .from(saleItems)
      .where(eq(saleItems.saleId, id));
    nextTotal = saleTotal(items, nextDiscount);
  }

  const nextPaid = patch.paid ?? sale.paid;
  if (nextPaid > nextTotal) {
    return fail('Cash collected cannot be more than the invoice total.', 422);
  }

  const statusChanged = patch.status && patch.status !== sale.status;

  const [updated] = await db
    .update(sales)
    .set({
      discount: nextDiscount,
      total: nextTotal,
      paid: nextPaid,
      ...(patch.status ? { status: patch.status } : {}),
      ...(statusChanged
        ? { deliveredAt: patch.status === 'DELIVERED' ? new Date() : null }
        : {}),
      ...(patch.shopName ? { shopName: patch.shopName } : {}),
      ...(patch.area !== undefined ? { area: patch.area } : {}),
      ...(patch.note !== undefined ? { note: patch.note } : {}),
      updatedAt: new Date(),
    })
    .where(eq(sales.id, id))
    .returning();

  await logAction(db, user, 'sale.update', 'sale', id, { fields: Object.keys(patch) });
  return ok({
    sale: {
      ...updated,
      date: updated.date.toISOString(),
      deliveredAt: updated.deliveredAt ? updated.deliveredAt.toISOString() : null,
      due: round2(updated.total - updated.paid),
    },
  });
});
