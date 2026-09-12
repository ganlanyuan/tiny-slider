import { fail, ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { newId, readDb, writeDb } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { srStockLedger } from '@/lib/analytics';
import { returnSchema } from '@/lib/validation';
import type { StockReturn } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  await requireCapability('assignment.view');
  const db = await readDb();
  const productName = new Map(db.products.map((p) => [p.id, p.name]));
  const srName = new Map(db.users.map((u) => [u.id, u.name]));
  const returns = [...db.returns]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((r) => ({
      ...r,
      srName: srName.get(r.srId) ?? 'Unknown SR',
      units: r.items.reduce((n, i) => n + i.qty, 0),
      items: r.items.map((i) => ({
        ...i,
        productName: productName.get(i.productId) ?? 'Removed product',
      })),
    }));
  return ok({ returns });
});

export const POST = route(async (request: Request) => {
  const user = await requireCapability('assignment.manage');
  const input = returnSchema.parse(await parseJson(request));

  const result = await writeDb((db) => {
    const held = srStockLedger(db, input.srId);
    for (const item of input.items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (!product) return { ok: false, error: `Unknown product: ${item.productId}` } as const;
      const available = held.get(item.productId) ?? 0;
      if (item.qty > available) {
        return {
          error: `The SR only holds ${available} ${product.unit} of "${product.name}".`,
        } as const;
      }
    }

    const now = new Date().toISOString();
    const entry: StockReturn = {
      id: newId('ret'),
      srId: input.srId,
      date: input.date,
      items: input.items,
      reason: input.reason,
      createdBy: user.id,
      createdAt: now,
    };
    db.returns.push(entry);

    for (const item of entry.items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (product) {
        product.stock += item.qty;
        product.updatedAt = now;
      }
    }

    logAction(db, user, 'stock.return', 'return', entry.id, {
      units: entry.items.reduce((n, i) => n + i.qty, 0),
    });
    return { ok: true, entry } as const;
  });

  if (!result.ok) return fail(result.error, 422);
  return ok({ return: result.entry }, { status: 201 });
});
