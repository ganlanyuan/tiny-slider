import { ok, parseJson, route, fail } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { newId, readDb, writeDb } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { categorySchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import type { Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  await requireCapability('product.view');
  const db = await readDb();
  const counts = new Map<string, number>();
  for (const p of db.products) {
    if (p.active) counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1);
  }
  return ok({
    categories: db.categories.map((c) => ({ ...c, productCount: counts.get(c.id) ?? 0 })),
  });
});

export const POST = route(async (request: Request) => {
  const user = await requireCapability('product.manage');
  const input = categorySchema.parse(await parseJson(request));

  const created = await writeDb((db) => {
    const slug = slugify(input.name);
    if (db.categories.some((c) => c.slug === slug)) return null;
    const category: Category = {
      id: newId('cat'),
      name: input.name,
      nameBn: input.nameBn,
      icon: input.icon,
      slug,
      createdAt: new Date().toISOString(),
    };
    db.categories.push(category);
    logAction(db, user, 'category.create', 'category', category.id, { name: category.name });
    return category;
  });

  if (!created) return fail('That category already exists.', 409);
  return ok({ category: created }, { status: 201 });
});
