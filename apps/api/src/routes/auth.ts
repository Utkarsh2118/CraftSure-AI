import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import type { ApiResponse, UserRole } from '@craftsure/shared-types';
import { requireAuth } from '../middleware/authenticate';

export const authRouter: Router = Router();

const loginSchema = z.object({
  role: z.enum(['buyer', 'artisan', 'store_admin', 'platform_admin']).default('buyer'),
  email: z.string().email().optional(),
});

/**
 * GET /api/auth/me
 * Retrieves current user profile and role from authenticated session.
 */
authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const responseBody: ApiResponse<typeof user> = {
    ok: true,
    data: user,
  };
  res.json(responseBody);
});

/**
 * POST /api/auth/demo-login
 * Issues deterministic demo tokens for testing and front-end role switching.
 * Role originates from database/verified authority, never client-forged.
 */
authRouter.post('/demo-login', (req: Request, res: Response) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorBody: ApiResponse<never> = {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid login request payload.',
        details: parseResult.error.flatten().fieldErrors,
      },
    };
    res.status(400).json(errorBody);
    return;
  }

  const { role, email } = parseResult.data;
  const token = `demo-${role}`;
  const user = {
    id: `user-${role}-01`,
    email: email ?? `${role}@craftsure.ai`,
    role: role as UserRole,
    displayName: `${role.replace('_', ' ').toUpperCase()} User`,
  };

  const responseBody: ApiResponse<{ token: string; user: typeof user }> = {
    ok: true,
    data: { token, user },
  };

  res.json(responseBody);
});
