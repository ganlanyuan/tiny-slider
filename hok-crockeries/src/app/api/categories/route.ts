import { and, asc, eq, sql } from 'drizzle-orm';

import { ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { categories, products } from '@/db/schema';
import { logAction } from '@/lib/audit';
import { categorySchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const { db, orgId } = await requireCapability('product.view');

  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      icon: categories.icon,
      productCount: sql<number>`
        (SELECT COUNT(*) FROM ${products}
          WHERE ${products.categoryId} = ${categories.id} AND ${products.active} = true)
      `.mapWith(Number),
    })
    .from(categories)
    .where(eq(categories.orgId, orgId))
    .orderBy(asc(categories.name));

  return ok({ categories: rows });
});

export const POST = route(async (request: Request) => {
  const { db, orgId, user } = await requireCapability('product.manage');
  const input = categorySchema.parse(await parseJson(request));

  const [created] = await db
    .insert(categories)
    .values({ orgId, name: input.name, slug: slugify(input.name), icon: input.icon })
    .returning();

  await logAction(db, user, 'category.create', 'category', created.id, { name: created.name });
  return ok({ category: created }, { status: 201 });
});
