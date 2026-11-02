import { describe, it, expect } from 'vitest';
import express from 'express';
import type { Request, Response } from 'express';
import request from 'supertest';
import { requireRole } from './requireRole';
import type { UserRole } from '@craftsure/shared-types';

describe('requireRole middleware', () => {
  function createTestApp(minRole: UserRole, userRole?: UserRole) {
    const app = express();
    app.use(express.json());

    // Mock auth middleware
    app.use((req: Request, _res: Response, next) => {
      if (userRole) {
        (req as Request & { user?: { role: UserRole } }).user = { role: userRole };
      }
      next();
    });

    app.get('/protected', requireRole(minRole), (_req: Request, res: Response) => {
      res.json({ ok: true, data: 'access_granted' });
    });

    return app;
  }

  it('rejects unauthenticated requests with 401 UNAUTHORIZED', async () => {
    const app = createTestApp('buyer');
    const res = await request(app).get('/protected');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
      },
    });
  });

  it('rejects lower role users with 403 FORBIDDEN', async () => {
    const app = createTestApp('artisan', 'buyer');
    const res = await request(app).get('/protected');

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      ok: false,
      error: {
        code: 'FORBIDDEN',
      },
    });
  });

  it('allows same role user to access protected endpoint', async () => {
    const app = createTestApp('artisan', 'artisan');
    const res = await request(app).get('/protected');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, data: 'access_granted' });
  });

  it('allows higher role user (platform_admin) to access lower requirement endpoint', async () => {
    const app = createTestApp('artisan', 'platform_admin');
    const res = await request(app).get('/protected');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, data: 'access_granted' });
  });
});
