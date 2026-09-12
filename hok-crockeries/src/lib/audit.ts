import 'server-only';

import { newId } from './db';
import type { AuditLog, Database, SafeUser } from './types';

const MAX_LOGS = 2000;

/**
 * Append an audit entry. Call inside a `writeDb` mutator so the log lands in
 * the same atomic write as the change it describes.
 */
export function logAction(
  db: Database,
  actor: SafeUser,
  action: string,
  entity: string,
  entityId?: string,
  meta?: Record<string, unknown>,
): AuditLog {
  const entry: AuditLog = {
    id: newId('log'),
    userId: actor.id,
    userName: actor.name,
    action,
    entity,
    entityId,
    meta,
    createdAt: new Date().toISOString(),
  };
  db.auditLogs.unshift(entry);
  if (db.auditLogs.length > MAX_LOGS) db.auditLogs.length = MAX_LOGS;
  return entry;
}
