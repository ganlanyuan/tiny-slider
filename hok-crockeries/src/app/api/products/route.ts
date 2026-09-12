import { ok, parseJson, route, fail } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { newId, writeDb, readDb } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { productStockLedger } from '@/lib/analytics';
import { visibleProducts } from '@/lib/permissions';
import { productSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  const user = await requireCapability('product.view');
  const url = new URL(request.url);
  const search = (url.searchParams.get('q') ?? '').trim().toLowerCase();
  const categoryId = url.searchParams.get('category') ?? '';
  const stockFilter = url.searchParams.get('stock') ?? '';
  const includeInactive = url.searchParams.get('includeInactive') === '1';

  const db = await readDb();
  const ledger = productStockLedger(db);

  let products: Product[] = db.products;
  if (!includeInactive) products = products.filter((p) => p.active);
  if (categoryId) products = products.filter((p) => p.categoryId === categoryId);
  if (search) {
    products = products.filter((p) =>
      [p.name, p.nameBn, p.sku, p.brand, p.description]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(search)),
    );
  }
  if (stockFilter === 'low') {
    products = products.filter((p) => {
      const inStore = ledger.get(p.id)?.inStore ?? 0;
      return inStore > 0 && inStore <= p.lowStockThreshold;
    });
  } else if (stockFilter === 'out') {
    products = products.filter((p) => (ledger.get(p.id)?.inStore ?? 0) <= 0);
  }

  const rows = visibleProducts(products, user.role).map((p) => ({
    ...p,
    // `stock` on the record is a convenience mirror; the ledger is authoritative.
    stock: ledger.get(p.id)?.inStore ?? 0,
    withSrs: ledger.get(p.id)?.withSrs ?? 0,
    sold: ledger.get(p.id)?.sold ?? 0,
  }));

  return ok({ products: rows, categories: db.categories, total: rows.length });
});

export const POST = route(async (request: Request) => {
  const user = await requireCapability('product.manage');
  const input = productSchema.parse(await parseJson(request));

  const created = await writeDb((db) => {
    if (db.products.some((p) => p.sku.toLowerCase() === input.sku.toLowerCase())) {
      return null;
    }
    if (!db.categories.some((c) => c.id === input.categoryId)) {
      // Accept a category name too, creating it on the fly.
      const name = input.categoryId;
      const category = {
        id: newId('cat'),
        name,
        slug: slugify(name),
        createdAt: new Date().toISOString(),
      };
      db.categories.push(category);
      input.categoryId = category.id;
    }
    const now = new Date().toISOString();
    const product: Product = { id: newId('prd'), ...input, createdAt: now, updatedAt: now };
    db.products.push(product);
    logAction(db, user, 'product.create', 'product', product.id, { sku: product.sku });
    return product;
  });

  if (!created) return fail('A product with that SKU already exists.', 409);
  return ok({ product: created }, { status: 201 });
});
