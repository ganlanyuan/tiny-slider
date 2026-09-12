import { ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { newId, writeDb } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { productImportSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import type { Category, Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface RowOutcome {
  row: number;
  name: string;
  sku: string;
  action: 'create' | 'update' | 'skip';
  reason?: string;
}

/**
 * Bulk-load a price list. Runs the whole batch inside one `writeDb` call so an
 * import either lands completely or not at all, and supports `dryRun` so the UI
 * can show a preview before anything is committed.
 */
export const POST = route(async (request: Request) => {
  const user = await requireCapability('product.import');
  const { rows, mode, dryRun } = productImportSchema.parse(await parseJson(request));

  const outcome = await writeDb((db) => {
    const results: RowOutcome[] = [];
    // Snapshot so a dry run never leaves anything behind.
    const products: Product[] = dryRun ? db.products.map((p) => ({ ...p })) : db.products;
    const categories: Category[] = dryRun ? db.categories.map((c) => ({ ...c })) : db.categories;
    const now = new Date().toISOString();
    const categoryCountBefore = categories.length;

    const findCategory = (label: string | undefined): string => {
      const name = (label ?? 'Uncategorised').trim() || 'Uncategorised';
      const slug = slugify(name);
      const existing = categories.find((c) => c.slug === slug || c.id === label);
      if (existing) return existing.id;
      const category: Category = { id: newId('cat'), name, slug, createdAt: now };
      categories.push(category);
      return category.id;
    };

    const skuFor = (row: (typeof rows)[number], index: number): string => {
      if (row.sku) return row.sku;
      const base = slugify(row.name).toUpperCase().slice(0, 14).replace(/-/g, '');
      let candidate = base || `ITEM${index + 1}`;
      let n = 1;
      while (products.some((p) => p.sku.toLowerCase() === candidate.toLowerCase())) {
        candidate = `${base}-${n}`;
        n += 1;
      }
      return candidate;
    };

    rows.forEach((row, index) => {
      const sku = skuFor(row, index);
      const existing = products.find(
        (p) =>
          p.sku.toLowerCase() === sku.toLowerCase() ||
          p.name.toLowerCase() === row.name.toLowerCase(),
      );

      if (existing && mode === 'insert') {
        results.push({
          row: index + 1,
          name: row.name,
          sku,
          action: 'skip',
          reason: 'Already exists and the import is set to insert-only.',
        });
        return;
      }

      const categoryId = row.categoryId ?? findCategory(row.category);

      if (existing) {
        // Only overwrite what the file actually supplied; blanks keep the old value.
        if (row.nameBn !== undefined) existing.nameBn = row.nameBn;
        if (row.unit !== undefined) existing.unit = row.unit;
        if (row.costPrice !== undefined) existing.costPrice = row.costPrice;
        if (row.srPrice !== undefined) existing.srPrice = row.srPrice;
        if (row.marketPrice !== undefined) existing.marketPrice = row.marketPrice;
        if (row.lowStockThreshold !== undefined) existing.lowStockThreshold = row.lowStockThreshold;
        if (row.imageUrl !== undefined) existing.imageUrl = row.imageUrl;
        if (row.description !== undefined) existing.description = row.description;
        if (row.brand !== undefined) existing.brand = row.brand;
        if (row.category || row.categoryId) existing.categoryId = categoryId;
        existing.active = true;
        existing.updatedAt = now;
        results.push({ row: index + 1, name: row.name, sku: existing.sku, action: 'update' });
        return;
      }

      products.push({
        id: newId('prd'),
        sku,
        name: row.name,
        nameBn: row.nameBn,
        categoryId,
        unit: row.unit ?? 'pcs',
        costPrice: row.costPrice ?? 0,
        srPrice: row.srPrice ?? 0,
        marketPrice: row.marketPrice ?? row.srPrice ?? 0,
        // Opening stock from a price list is informational; real stock arrives
        // through a purchase entry, which is what the ledger counts.
        stock: row.stock ?? 0,
        lowStockThreshold: row.lowStockThreshold ?? db.settings.lowStockThreshold,
        imageUrl: row.imageUrl,
        description: row.description,
        brand: row.brand,
        active: true,
        createdAt: now,
        updatedAt: now,
      });
      results.push({ row: index + 1, name: row.name, sku, action: 'create' });
    });

    const summary = {
      created: results.filter((r) => r.action === 'create').length,
      updated: results.filter((r) => r.action === 'update').length,
      skipped: results.filter((r) => r.action === 'skip').length,
      newCategories: categories.length - categoryCountBefore,
    };

    if (!dryRun) {
      logAction(db, user, 'product.import', 'product', undefined, { ...summary, mode });
    }

    return { results, summary, dryRun };
  });

  return ok(outcome);
});
