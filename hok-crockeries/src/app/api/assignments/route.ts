import { and, desc, eq, inArray, sql } from 'drizzle-orm';

import { fail, nextDocNumber, ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import type { Database } from '@/db/client';
import { assignmentItems, assignments, products, users } from '@/db/schema';
import { storeAvailableQty } from '@/db/queries/stock';
import { withTransaction } from '@/db/tx';
import { logAction } from '@/lib/audit';
import { assignmentValue, toBusinessDate } from '@/lib/money';
import { assignmentSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  const { db, orgId } = await requireCapability('assignment.view');
  const url = new URL(request.url);
  const srId = url.searchParams.get('sr') ?? '';
  const month = url.searchParams.get('month') ?? '';

  const filters = [eq(assignments.orgId, orgId)];
  if (srId) filters.push(eq(assignments.srId, srId));
  const monthFilter = month
    ? sql`AND to_char(${assignments.date} AT TIME ZONE 'UTC', 'YYYY-MM') = ${month}`
    : sql``;

  const rows = await db
    .select({
      id: assignments.id,
      challanNo: assignments.challanNo,
      srId: assignments.srId,
      srName: users.name,
      date: assignments.date,
      totalValue: assignments.totalValue,
      note: assignments.note,
    })
    .from(assignments)
    .innerJoin(users, eq(users.id, assignments.srId))
    .where(sql`${and(...filters)} ${monthFilter}`)
    .orderBy(desc(assignments.date), desc(assignments.createdAt));

  const ids = rows.map((r) => r.id);
  const items = ids.length
    ? await db
        .select({
          assignmentId: assignmentItems.assignmentId,
          productId: assignmentItems.productId,
          productName: products.name,
          unit: products.unit,
          qty: assignmentItems.qty,
          srRate: assignmentItems.srRate,
        })
        .from(assignmentItems)
        .innerJoin(products, eq(products.id, assignmentItems.productId))
        .where(inArray(assignmentItems.assignmentId, ids))
    : [];

  const byAssignment = new Map<string, typeof items>();
  for (const item of items) {
    const list = byAssignment.get(item.assignmentId) ?? [];
    list.push(item);
    byAssignment.set(item.assignmentId, list);
  }

  return ok({
    assignments: rows.map((r) => {
      const lines = byAssignment.get(r.id) ?? [];
      return {
        ...r,
        date: r.date.toISOString(),
        units: lines.reduce((n, i) => n + i.qty, 0),
        items: lines,
      };
    }),
  });
});

/**
 * Hand stock from the store to a sales rep.
 *
 * The availability check and the insert run in one transaction, so two people
 * issuing challans at the same moment cannot both hand out the last carton.
 */
export const POST = route(async (request: Request) => {
  const { db, orgId, user } = await requireCapability('assignment.manage');
  const input = assignmentSchema.parse(await parseJson(request));

  const [rep] = await db
    .select({ id: users.id, name: users.name, active: users.active, role: users.role })
    .from(users)
    .where(and(eq(users.id, input.srId), eq(users.orgId, orgId)))
    .limit(1);

  if (!rep || rep.role !== 'SR') return fail('That sales rep does not exist.', 422);
  if (!rep.active) return fail('That sales rep account is deactivated.', 422);

  const productIds = input.items.map((i) => i.productId);
  const catalogue = await db
    .select({ id: products.id, name: products.name, unit: products.unit })
    .from(products)
    .where(and(eq(products.orgId, orgId), inArray(products.id, productIds)));
  const nameOf = new Map(catalogue.map((p) => [p.id, p]));
  if (catalogue.length !== new Set(productIds).size) {
    return fail('One or more products in this challan do not exist.', 422);
  }

  const date = toBusinessDate(input.date);
  const totalValue = assignmentValue(input.items);

  const result = await withTransaction(db, async (tx) => {
    const database = tx as Database;

    // Never hand out stock the store does not physically hold.
    const available = await storeAvailableQty(database, orgId, productIds);
    for (const item of input.items) {
      const have = available.get(item.productId) ?? 0;
      if (item.qty > have) {
        const p = nameOf.get(item.productId);
        return {
          ok: false as const,
          error: `Only ${have} ${p?.unit ?? 'units'} of "${p?.name ?? 'that product'}" are in the store — cannot hand out ${item.qty}.`,
        };
      }
    }

    const existingNos = await database
      .select({ challanNo: assignments.challanNo })
      .from(assignments)
      .where(eq(assignments.orgId, orgId));

    const [created] = await database
      .insert(assignments)
      .values({
        orgId,
        challanNo: nextDocNumber('CH', existingNos.map((a) => a.challanNo)),
        srId: input.srId,
        date,
        totalValue,
        note: input.note,
        createdBy: user.id,
      })
      .returning();

    await database.insert(assignmentItems).values(
      input.items.map((i) => ({
        assignmentId: created.id,
        productId: i.productId,
        qty: i.qty,
        srRate: i.srRate,
      })),
    );

    return { ok: true as const, assignment: created };
  });

  if (!result.ok) return fail(result.error, 422);

  await logAction(db, user, 'assignment.create', 'assignment', result.assignment.id, {
    sr: rep.name,
    units: input.items.reduce((n, i) => n + i.qty, 0),
    value: totalValue,
  });

  return ok(
    { assignment: { ...result.assignment, date: result.assignment.date.toISOString() } },
    { status: 201 },
  );
});
