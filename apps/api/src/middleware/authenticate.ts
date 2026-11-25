import type { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import type { UserRole, ApiResponse } from '@craftsure/shared-types';
import { verifySupabaseToken } from '../lib/supabase';
import { db } from '../db/client';
import { users as usersTable } from '../db/schema';

export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
  readonly displayName?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser | undefined;
    }
  }
}

/**
 * Whitelisted deterministic demo user profiles for tests.
 * Allowed strictly in NODE_ENV === 'test'.
 */
export const DEMO_TOKENS: Record<string, AuthenticatedUser> = {
  'demo-platform-admin': {
    id: 'user-platform-admin-01',
    email: 'admin@craftsure.ai',
    role: 'platform_admin',
    displayName: 'Platform Administrator',
  },
  'demo-platform_admin': {
    id: 'user-platform-admin-01',
    email: 'admin@craftsure.ai',
    role: 'platform_admin',
    displayName: 'Platform Administrator',
  },
  'demo-store-admin': {
    id: 'user-store-admin-01',
    email: 'curator@craftsure.ai',
    role: 'store_admin',
    displayName: 'Regional Store Curator',
  },
  'demo-store_admin': {
    id: 'user-store-admin-01',
    email: 'curator@craftsure.ai',
    role: 'store_admin',
    displayName: 'Regional Store Curator',
  },
  'demo-artisan': {
    id: 'user-artisan-01',
    email: 'ramzan.ali@craftsure.ai',
    role: 'artisan',
    displayName: 'Master Weaver Ramzan Ali',
  },
  'demo-buyer': {
    id: 'user-buyer-01',
    email: 'ananya.sharma@example.in',
    role: 'buyer',
    displayName: 'Ananya Sharma',
  },
};

const VALID_USER_ROLES = new Set<UserRole>([
  'buyer',
  'artisan',
  'store_admin',
  'platform_admin',
]);

function parseUserRole(role: unknown): UserRole | null {
  if (typeof role === 'string' && VALID_USER_ROLES.has(role as UserRole)) {
    return role as UserRole;
  }
  return null;
}

/**
 * Parses and verifies Bearer token, populating req.user.
 *
 * Non-Negotiable Security Rules:
 * 1. Demo tokens are permitted ONLY when NODE_ENV === 'test' using safe own-property check.
 * 2. Client-forged role strings or demo tokens outside test are rejected immediately.
 * 3. Supabase JWTs are cryptographically verified via Supabase Auth.
 * 4. Authorization roles originate exclusively from the trusted database (usersTable).
 * 5. Fail-Closed: If database lookup or user provisioning fails, authentication fails.
 * 6. Validates database roles against permitted UserRole values instead of blindly casting.
 */
export async function authenticateToken(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = undefined;
    next();
    return;
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    req.user = undefined;
    next();
    return;
  }

  // 1. Check whitelisted demo tokens strictly in test environment using safe own-property check
  if (
    process.env['NODE_ENV'] === 'test' &&
    Object.prototype.hasOwnProperty.call(DEMO_TOKENS, token)
  ) {
    const demoUser = DEMO_TOKENS[token];
    if (demoUser) {
      req.user = demoUser;
      next();
      return;
    }
  }

  // 2. Reject client-forged role injection attempts (e.g. 'token?role=admin') or demo tokens outside test
  if (token.includes('role=') || token.startsWith('demo-')) {
    req.user = undefined;
    next();
    return;
  }

  // 3. Verify real Supabase JWT session token
  const { user: authUser, error: authError } = await verifySupabaseToken(token);

  if (authError || !authUser) {
    req.user = undefined;
    next();
    return;
  }

  // 4. Retrieve authorization role from trusted PostgreSQL database (Fail-Closed)
  let dbUser: typeof usersTable.$inferSelect | undefined;
  const defaultDisplayName =
    (authUser.user_metadata?.['full_name'] as string | undefined) ??
    authUser.email?.split('@')[0] ??
    'User';

  try {
    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, authUser.id));

    if (existingUser) {
      dbUser = existingUser;
    } else {
      // Lazy provision registered Supabase user with strictly 'buyer' role
      const [newlyProvisioned] = await db
        .insert(usersTable)
        .values({
          id: authUser.id,
          email: authUser.email ?? `${authUser.id}@craftsure.ai`,
          role: 'buyer',
          displayName: defaultDisplayName,
        })
        .onConflictDoNothing()
        .returning();

      if (newlyProvisioned) {
        dbUser = newlyProvisioned;
      } else {
        // Safe concurrent provisioning resolution: fetch existing row
        const [concurrentUser] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, authUser.id));
        dbUser = concurrentUser;
      }
    }
  } catch {
    // FAIL-CLOSED: Any database error means authentication MUST NOT succeed.
    // Never fall back to a default role after a database failure.
    console.warn('[Auth Database Warning] Database lookup/provisioning failed; rejecting request.');
    req.user = undefined;
    next();
    return;
  }

  // If no user record could be established, fail-closed
  if (!dbUser) {
    req.user = undefined;
    next();
    return;
  }

  // 5. Validate database role against permitted UserRole values (never blindly cast)
  const userRole = parseUserRole(dbUser.role);
  if (!userRole) {
    console.warn('[Auth Database Role Warning] Unrecognized role in database; rejecting request.');
    req.user = undefined;
    next();
    return;
  }

  req.user = {
    id: authUser.id,
    email: authUser.email ?? dbUser.email,
    role: userRole,
    displayName: dbUser.displayName,
  };

  next();
}

/**
 * Middleware that strictly requires an authenticated user.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    const errorBody: ApiResponse<never> = {
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'You must be signed in to access this resource.',
      },
    };
    res.status(401).json(errorBody);
    return;
  }
  next();
}
