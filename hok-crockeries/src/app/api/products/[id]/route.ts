import { fail, ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { productStockLedger } from '@/lib/analytics';
import { visibleProduct } from '@/lib/permissions';
import { productUpdateSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_request: Request, ctx: Ctx) => {
  const user = await requireCapability('product.view');
  const { id } = await ctx.params;
  const db = await readDb();
  const product = db.products.find((p) => p.id === id);
  if (!product) return fail('Product not found.', 404);
  const row = productStockLedger(db).get(id);
  return ok({ product: visibleProduct(product, user.role), stock: row });
});

export const PATCH = route(async (request: Request, ctx: Ctx) => {
  const user = await requireCapability('product.manage');
  const { id } = await ctx.params;
  const patch = productUpdateSchema.parse(await parseJson(request));

  // Only the owner may set a purchase price; silently dropping it for a manager
  // keeps the field from being written by anyone else.
  if (user.role !== 'ADMIN') delete patch.costPrice;

  const updated = await writeDb((db) => {
    const product = db.products.find((p) => p.id === id);
    if (!product) return null;
    Object.assign(product, patch, { updatedAt: new Date().toISOString() });
    logAction(db, user, 'product.update', 'product', id, { fields: Object.keys(patch) });
    return product;
  });

  if (!updated) return fail('Product not found.', 404);
  return ok({ product: visibleProduct(updated, user.role) });
});

export const DELETE = route(async (_request: Request, ctx: Ctx) => {
  const user = await requireCapability('product.manage');
  const { id } = await ctx.params;

  const result = await writeDb((db) => {
    const product = db.products.find((p) => p.id === id);
    if (!product) return 'missing' as const;
    const used =
      db.sales.some((s) => s.items.some((i) => i.productId === id)) ||
      db.stockEntries.some((e) => e.items.some((i) => i.productId === id)) ||
      db.assignments.some((a) => a.items.some((i) => i.productId === id));
    if (used) {
      // Hard-deleting would orphan historical invoices, so retire it instead.
      product.active = false;
      product.updatedAt = new Date().toISOString();
      logAction(db, user, 'product.archive', 'product', id);
      return 'archived' as const;
    }
    db.products = db.products.filter((p) => p.id !== id);
    logAction(db, user, 'product.delete', 'product', id);
    return 'deleted' as const;
  });

  if (result === 'missing') return fail('Product not found.', 404);
  return ok({ result });
});
