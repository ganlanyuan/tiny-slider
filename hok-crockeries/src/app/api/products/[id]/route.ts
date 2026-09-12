import { and, eq, sql } from 'drizzle-orm';

import { fail, ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { assignmentItems, products, saleItems, stockEntryItems } from '@/db/schema';
import { productStockLedger } from '@/db/queries/stock';
import { logAction } from '@/lib/audit';
import { visibleProduct } from '@/lib/permissions';
import { productUpdateSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_request: Request, ctx: Ctx) => {
  const { db, orgId, role } = await requireCapability('product.view');
  const { id } = await ctx.params;

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.orgId, orgId)))
    .limit(1);
  if (!product) return fail('Product not found.', 404);

  const ledger = await productStockLedger(db, orgId);
  return ok({ product: visibleProduct(product, role), stock: ledger.get(id) ?? null });
});

export const PATCH = route(async (request: Request, ctx: Ctx) => {
  const { db, orgId, user, role } = await requireCapability('product.manage');
  const { id } = await ctx.params;
  const patch = productUpdateSchema.parse(await parseJson(request));

  if (role !== 'ADMIN') delete patch.costPrice;

  const [updated] = await db
    .update(products)
    .set({
      ...patch,
      categoryId: patch.categoryId === undefined ? undefined : patch.categoryId || null,
      updatedAt: new Date(),
    })
    .where(and(eq(products.id, id), eq(products.orgId, orgId)))
    .returning();

  if (!updated) return fail('Product not found.', 404);
  await logAction(db, user, 'product.update', 'product', id, { fields: Object.keys(patch) });
  return ok({ product: visibleProduct(updated, role) });
});

export const DELETE = route(async (_request: Request, ctx: Ctx) => {
  const { db, orgId, user } = await requireCapability('product.manage');
  const { id } = await ctx.params;

  const [product] = await db
    .select({ id: products.id, name: products.name })
    .from(products)
    .where(and(eq(products.id, id), eq(products.orgId, orgId)))
    .limit(1);
  if (!product) return fail('Product not found.', 404);

  // Hard-deleting would orphan historical invoices, so a product that has ever
  // moved is retired instead of removed.
  const [{ used }] = await db
    .select({
      used: sql<number>`
        (SELECT COUNT(*) FROM ${saleItems} WHERE ${saleItems.productId} = ${id})
      + (SELECT COUNT(*) FROM ${stockEntryItems} WHERE ${stockEntryItems.productId} = ${id})
      + (SELECT COUNT(*) FROM ${assignmentItems} WHERE ${assignmentItems.productId} = ${id})
      `.mapWith(Number),
    })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (used > 0) {
    await db
      .update(products)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(products.id, id));
    await logAction(db, user, 'product.archive', 'product', id, { name: product.name });
    return ok({ result: 'archived' });
  }

  await db.delete(products).where(eq(products.id, id));
  await logAction(db, user, 'product.delete', 'product', id, { name: product.name });
  return ok({ result: 'deleted' });
});
