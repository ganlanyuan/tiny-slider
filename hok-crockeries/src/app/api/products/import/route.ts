import { eq, sql } from 'drizzle-orm';

import { ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { categories, products } from '@/db/schema';
import type { Database } from '@/db/client';
import { withTransaction, type Tx } from '@/db/tx';
import { logAction } from '@/lib/audit';
import { productImportSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface RowOutcome {
  row: number;
  name: string;
  sku: string;
  action: 'create' | 'update' | 'skip';
  reason?: string;
}

/**
 * Bulk-load a price list.
 *
 * The whole batch runs inside one transaction, so an import either lands
 * completely or not at all. `dryRun` does the same work and then rolls back,
 * which is what lets the preview show real outcomes — matched SKUs, categories
 * that would be created — instead of a guess.
 */
export const POST = route(async (request: Request) => {
  const { db, orgId, user, role } = await requireCapability('product.import');
  const { rows, mode, dryRun } = productImportSchema.parse(await parseJson(request));

  class Rollback extends Error {
    constructor(readonly payload: unknown) {
      super('dry run');
    }
  }

  const run = async (tx: Tx) => {
    const results: RowOutcome[] = [];
    const existing = await (tx as Database)
      .select({ id: products.id, sku: products.sku, name: products.name })
      .from(products)
      .where(eq(products.orgId, orgId));

    const bySku = new Map(existing.map((p) => [p.sku.toLowerCase(), p]));
    const byName = new Map(existing.map((p) => [p.name.toLowerCase(), p]));

    const categoryRows = await (tx as Database)
      .select({ id: categories.id, slug: categories.slug })
      .from(categories)
      .where(eq(categories.orgId, orgId));
    const categoryBySlug = new Map(categoryRows.map((c) => [c.slug, c.id]));
    let categoriesCreated = 0;

    const resolveCategory = async (label?: string): Promise<string | null> => {
      if (!label) return null;
      const slug = slugify(label);
      const found = categoryBySlug.get(slug);
      if (found) return found;
      const [created] = await (tx as Database)
        .insert(categories)
        .values({ orgId, name: label.trim(), slug })
        .returning({ id: categories.id });
      categoryBySlug.set(slug, created.id);
      categoriesCreated += 1;
      return created.id;
    };

    const takenSkus = new Set(existing.map((p) => p.sku.toLowerCase()));
    const skuFor = (row: (typeof rows)[number], index: number): string => {
      if (row.sku) return row.sku;
      // Derive a stable code from the name when the file has no SKU column.
      const base = slugify(row.name).toUpperCase().replace(/-/g, '').slice(0, 14) || `ITEM${index + 1}`;
      let candidate = base;
      let n = 1;
      while (takenSkus.has(candidate.toLowerCase())) {
        candidate = `${base}-${n}`;
        n += 1;
      }
      return candidate;
    };

    for (const [index, row] of rows.entries()) {
      const sku = skuFor(row, index);
      const match = bySku.get(sku.toLowerCase()) ?? byName.get(row.name.toLowerCase());

      if (match && mode === 'insert') {
        results.push({
          row: index + 1,
          name: row.name,
          sku: match.sku,
          action: 'skip',
          reason: 'Already exists and the import is set to insert-only.',
        });
        continue;
      }

      const categoryId =
        row.categoryId ?? (row.category ? await resolveCategory(row.category) : null);

      if (match) {
        // Only overwrite what the file actually supplied; blank cells keep the
        // value the product already has.
        const patch: Record<string, unknown> = { updatedAt: new Date(), active: true };
        if (row.unit !== undefined) patch.unit = row.unit;
        if (row.srPrice !== undefined) patch.srPrice = row.srPrice;
        if (row.marketPrice !== undefined) patch.marketPrice = row.marketPrice;
        if (row.lowStockThreshold !== undefined) patch.lowStockThreshold = row.lowStockThreshold;
        if (row.imageUrl !== undefined) patch.imageUrl = row.imageUrl;
        if (row.description !== undefined) patch.description = row.description;
        if (row.brand !== undefined) patch.brand = row.brand;
        if (categoryId) patch.categoryId = categoryId;
        // A cost column in an uploaded file is only honoured for the owner.
        if (row.costPrice !== undefined && role === 'ADMIN') patch.costPrice = row.costPrice;

        await (tx as Database).update(products).set(patch).where(eq(products.id, match.id));
        results.push({ row: index + 1, name: row.name, sku: match.sku, action: 'update' });
        continue;
      }

      takenSkus.add(sku.toLowerCase());
      const [created] = await (tx as Database)
        .insert(products)
        .values({
          orgId,
          sku,
          name: row.name,
          categoryId,
          unit: row.unit ?? 'pcs',
          costPrice: role === 'ADMIN' ? (row.costPrice ?? 0) : 0,
          srPrice: row.srPrice ?? 0,
          marketPrice: row.marketPrice ?? row.srPrice ?? 0,
          lowStockThreshold: row.lowStockThreshold ?? 10,
          imageUrl: row.imageUrl,
          description: row.description,
          brand: row.brand,
        })
        .returning({ id: products.id, sku: products.sku, name: products.name });

      bySku.set(created.sku.toLowerCase(), created);
      byName.set(created.name.toLowerCase(), created);
      results.push({ row: index + 1, name: row.name, sku: created.sku, action: 'create' });
    }

    const summary = {
      created: results.filter((r) => r.action === 'create').length,
      updated: results.filter((r) => r.action === 'update').length,
      skipped: results.filter((r) => r.action === 'skip').length,
      newCategories: categoriesCreated,
    };

    const payload = { results, summary, dryRun };

    if (dryRun) {
      // Undo everything: the preview must leave the catalogue untouched.
      throw new Rollback(payload);
    }
    return payload;
  };

  try {
    const payload = await withTransaction(db, run);
    await logAction(db, user, 'product.import', 'product', undefined, {
      ...payload.summary,
      mode,
    });
    return ok(payload);
  } catch (err) {
    if (err instanceof Rollback) return ok(err.payload);
    throw err;
  }
});
