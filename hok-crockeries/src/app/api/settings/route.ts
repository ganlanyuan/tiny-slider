import { ok, parseJson, route } from '@/lib/api';
import { requireCapability, requireUser } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { settingsSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  await requireUser();
  const db = await readDb();
  return ok({ settings: db.settings });
});

export const PATCH = route(async (request: Request) => {
  const user = await requireCapability('settings.manage');
  const input = settingsSchema.partial().parse(await parseJson(request));

  const settings = await writeDb((db) => {
    Object.assign(db.settings, input, { updatedAt: new Date().toISOString() });
    logAction(db, user, 'settings.update', 'settings', undefined, {
      fields: Object.keys(input),
    });
    return db.settings;
  });

  return ok({ settings });
});
