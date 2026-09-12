import 'server-only';

import { auditLogs } from '@/db/schema';
import type { Database } from '@/db/client';
import type { SafeUser } from './types';

/**
 * Record who changed what. Audit rows are scoped to the organisation like every
 * other table, so one tenant's history is never visible to another.
 */
export async function logAction(
  db: Database,
  actor: Pick<SafeUser, 'id' | 'name' | 'orgId'>,
  action: string,
  entity: string,
  entityId?: string,
  meta?: Record<string, unknown>,
): Promise<void> {
  await db.insert(auditLogs).values({
    orgId: actor.orgId,
    userId: actor.id,
    userName: actor.name,
    action,
    entity,
    entityId,
    meta,
  });
}
