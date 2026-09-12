import { and, eq, sql } from 'drizzle-orm';

import { fail, ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { categories, products } from '@/db/schema';
import { logAction } from '@/lib/audit';
import { categorySchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route(async (request: Request, ctx: Ctx) => {
  const { db, orgId, user } = await requireCapability('product.manage');
  const { id } = await ctx.params;
  const input = categorySchema.partial().parse(await parseJson(request));

  const [updated] = await db
    .update(categories)
    .set({
      ...(input.name ? { name: input.name, slug: slugify(input.name) } : {}),
      ...(input.icon !== undefined ? { icon: input.icon } : {}),
    })
    .where(and(eq(categories.id, id), eq(categories.orgId, orgId)))
    .returning();

  if (!updated) return fail('Category not found.', 404);
  await logAction(db, user, 'category.update', 'category', id, { name: updated.name });
  return ok({ category: updated });
});

export const DELETE = route(async (_request: Request, ctx: Ctx) => {
  const { db, orgId, user } = await requireCapability('product.manage');
  const { id } = await ctx.params;

  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
    .from(products)
    .where(and(eq(products.categoryId, id), eq(products.orgId, orgId)));

  if (count > 0) {
    return fail(
      `${count} product${count === 1 ? '' : 's'} still use this category. Move them first.`,
      409,
    );
  }

  const [deleted] = await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.orgId, orgId)))
    .returning({ id: categories.id, name: categories.name });

  if (!deleted) return fail('Category not found.', 404);
  await logAction(db, user, 'category.delete', 'category', id, { name: deleted.name });
  return ok({ deleted: true });
});
