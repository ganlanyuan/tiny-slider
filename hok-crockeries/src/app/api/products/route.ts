import { and, asc, eq, ilike, or, sql } from 'drizzle-orm';

import { ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { categories, products } from '@/db/schema';
import { productStockLedger } from '@/db/queries/stock';
import { logAction } from '@/lib/audit';
import { visibleProduct } from '@/lib/permissions';
import { productSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  const { db, orgId, role, showCost } = await requireCapability('product.view');
  const url = new URL(request.url);
  const search = (url.searchParams.get('q') ?? '').trim();
  const categoryId = url.searchParams.get('category') ?? '';
  const stockFilter = url.searchParams.get('stock') ?? '';
  const includeInactive = url.searchParams.get('includeInactive') === '1';

  const filters = [eq(products.orgId, orgId)];
  if (!includeInactive) filters.push(eq(products.active, true));
  if (categoryId) filters.push(eq(products.categoryId, categoryId));
  if (search) {
    const term = `%${search}%`;
    filters.push(
      or(
        ilike(products.name, term),
        ilike(products.sku, term),
        ilike(products.brand, term),
        ilike(products.description, term),
      )!,
    );
  }

  const [rows, categoryRows, ledger] = await Promise.all([
    db
      .select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        categoryId: products.categoryId,
        unit: products.unit,
        costPrice: products.costPrice,
        srPrice: products.srPrice,
        marketPrice: products.marketPrice,
        lowStockThreshold: products.lowStockThreshold,
        imageUrl: products.imageUrl,
        description: products.description,
        brand: products.brand,
        active: products.active,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .where(and(...filters))
      .orderBy(asc(products.name)),
    db
      .select()
      .from(categories)
      .where(eq(categories.orgId, orgId))
      .orderBy(asc(categories.name)),
    productStockLedger(db, orgId),
  ]);

  let list = rows.map((p) => {
    const stock = ledger.get(p.id);
    return {
      // Cost is removed here, before the row ever reaches a response body.
      ...visibleProduct(p, role),
      inStore: stock?.inStore ?? 0,
      withSrs: stock?.withSrs ?? 0,
      sold: stock?.sold ?? 0,
      updatedAt: p.updatedAt.toISOString(),
    };
  });

  if (stockFilter === 'low') {
    list = list.filter((p) => p.inStore > 0 && p.inStore <= p.lowStockThreshold);
  } else if (stockFilter === 'out') {
    list = list.filter((p) => p.inStore <= 0);
  }

  return ok({
    products: list,
    categories: categoryRows.map((c) => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon })),
    total: list.length,
    showCost,
  });
});

export const POST = route(async (request: Request) => {
  const { db, orgId, user, role } = await requireCapability('product.manage');
  const input = productSchema.parse(await parseJson(request));

  // Only the owner may set a purchase price. Dropping it here means a manager
  // cannot write a cost even by crafting the request by hand.
  const costPrice = role === 'ADMIN' ? input.costPrice : 0;

  const [created] = await db
    .insert(products)
    .values({
      orgId,
      sku: input.sku,
      name: input.name,
      categoryId: input.categoryId || null,
      unit: input.unit,
      costPrice,
      srPrice: input.srPrice,
      marketPrice: input.marketPrice,
      lowStockThreshold: input.lowStockThreshold,
      imageUrl: input.imageUrl,
      description: input.description,
      brand: input.brand,
      active: input.active,
    })
    .returning();

  await logAction(db, user, 'product.create', 'product', created.id, { sku: created.sku });
  return ok({ product: visibleProduct(created, role) }, { status: 201 });
});
