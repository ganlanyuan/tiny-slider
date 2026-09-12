import 'server-only';

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

import { readDb } from './db';
import { SESSION_COOKIE, verifySession, type SessionPayload } from './session';
import { can, type Capability } from './permissions';
import type { SafeUser, User } from './types';

export function toSafeUser(user: User): SafeUser {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/**
 * Resolve the signed-in user from the database rather than trusting the JWT
 * body, so a deactivated or role-changed account loses access immediately.
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = await getSession();
  if (!session) return null;
  const db = await readDb();
  const user = db.users.find((u) => u.id === session.sub);
  if (!user || !user.active) return null;
  return toSafeUser(user);
}

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError('You must be signed in.', 401);
  return user;
}

export async function requireCapability(capability: Capability): Promise<SafeUser> {
  const user = await requireUser();
  if (!can(user.role, capability)) {
    throw new AuthError('Your role does not allow this action.', 403);
  }
  return user;
}
