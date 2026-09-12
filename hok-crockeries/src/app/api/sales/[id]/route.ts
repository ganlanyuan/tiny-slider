import { fail, ok, parseJson, route } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { saleTotal } from '@/lib/analytics';
import { can } from '@/lib/permissions';
import { saleUpdateSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_request: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const db = await readDb();
  const sale = db.sales.find((s) => s.id === id);
  if (!sale) return fail('Invoice not found.', 404);
  if (!can(user.role, 'sale.view.all') && sale.srId !== user.id) {
    return fail('That invoice belongs to another SR.', 403);
  }
  const productName = new Map(db.products.map((p) => [p.id, p.name]));
  return ok({
    sale: {
      ...sale,
      items: sale.items.map((i) => ({
        ...i,
        productName: productName.get(i.productId) ?? 'Removed product',
      })),
    },
  });
});

export const PATCH = route(async (request: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const patch = saleUpdateSchema.parse(await parseJson(request));

  const result = await writeDb((db) => {
    const sale = db.sales.find((s) => s.id === id);
    if (!sale) return { ok: false, error: 'Invoice not found.', status: 404 } as const;

    const isOwner = sale.srId === user.id;
    const isManager = can(user.role, 'sale.manage');
    if (!isManager && !isOwner) {
      return { ok: false, error: 'That invoice belongs to another SR.', status: 403 } as const;
    }
    // An SR may record a later payment or mark a delivery, but cannot cancel an
    // invoice or change its price after the fact — that is a manager's call.
    if (!isManager) {
      if (patch.discount !== undefined || patch.shopName || patch.area) {
        return {
          ok: false,
          error: 'Only a manager can edit invoice amounts. Ask the office to adjust it.',
          status: 403,
        } as const;
      }
      if (patch.status === 'CANCELLED') {
        return { ok: false, error: 'Only a manager can cancel an invoice.', status: 403 } as const;
      }
    }

    if (patch.discount !== undefined) {
      sale.discount = patch.discount;
      sale.total = saleTotal(sale);
    }
    if (patch.paid !== undefined) {
      if (patch.paid > sale.total) {
        return {
          ok: false,
          error: 'Cash collected cannot be more than the invoice total.',
          status: 422,
        } as const;
      }
      sale.paid = patch.paid;
    }
    if (patch.status && patch.status !== sale.status) {
      sale.status = patch.status;
      sale.deliveredAt = patch.status === 'DELIVERED' ? new Date().toISOString() : undefined;
    }
    if (patch.shopName) sale.shopName = patch.shopName;
    if (patch.area !== undefined) sale.area = patch.area;
    if (patch.note !== undefined) sale.note = patch.note;
    sale.updatedAt = new Date().toISOString();

    logAction(db, user, 'sale.update', 'sale', sale.id, { fields: Object.keys(patch) });
    return { ok: true, sale } as const;
  });

  if (!result.ok) return fail(result.error, result.status);
  return ok({ sale: result.sale });
});
