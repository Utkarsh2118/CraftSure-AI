import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@craftsure/shared-types';
import type { ApiResponse } from '@craftsure/shared-types';

/**
 * Middleware that enforces a minimum required role.
 * Must be used after the auth middleware that attaches req.user.
 *
 * Role hierarchy: buyer < artisan < store_admin < platform_admin
 */

const ROLE_RANK: Record<UserRole, number> = {
  buyer: 0,
  artisan: 1,
  store_admin: 2,
  platform_admin: 3,
};

export function requireRole(minimumRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as Request & { user?: { role: UserRole } }).user;

    if (!user) {
      const body: ApiResponse<never> = {
        ok: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be signed in to access this resource.' },
      };
      res.status(401).json(body);
      return;
    }

    const userRank = ROLE_RANK[user.role] ?? -1;
    const minRank = ROLE_RANK[minimumRole] ?? 999;

    if (userRank < minRank) {
      const body: ApiResponse<never> = {
        ok: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource.',
        },
      };
      res.status(403).json(body);
      return;
    }

    next();
  };
}
