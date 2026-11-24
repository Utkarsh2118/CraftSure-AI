import { describe, it, expect } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { authenticateToken, requireAuth } from './authenticate';

describe('authenticateToken middleware', () => {
  it('leaves req.user undefined when no authorization header is sent', async () => {
    const req = { headers: {} } as Request;
    const res = {} as Response;
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    await authenticateToken(req, res, next);
    expect(req.user).toBeUndefined();
    expect(nextCalled).toBe(true);
  });

  it('correctly maps demo artisan token with artisan role', async () => {
    const req = {
      headers: { authorization: 'Bearer demo-artisan' },
    } as Request;
    const res = {} as Response;
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    await authenticateToken(req, res, next);
    expect(req.user).toBeDefined();
    expect(req.user?.role).toBe('artisan');
    expect(req.user?.displayName).toContain('Ramzan Ali');
    expect(nextCalled).toBe(true);
  });

  it('correctly maps demo platform admin token', async () => {
    const req = {
      headers: { authorization: 'Bearer demo-platform-admin' },
    } as Request;
    const res = {} as Response;
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    await authenticateToken(req, res, next);
    expect(req.user?.role).toBe('platform_admin');
    expect(nextCalled).toBe(true);
  });
});

describe('requireAuth middleware', () => {
  it('returns 401 when req.user is missing', () => {
    const req = {} as Request;
    let statusCode = 0;
    let jsonBody: unknown = null;
    const res = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (body: unknown) => {
            jsonBody = body;
          },
        };
      },
    } as unknown as Response;
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    requireAuth(req, res, next);
    expect(statusCode).toBe(401);
    expect(jsonBody).toMatchObject({ ok: false, error: { code: 'UNAUTHORIZED' } });
    expect(nextCalled).toBe(false);
  });

  it('calls next when req.user is present', () => {
    const req = {
      user: { id: 'u1', email: 'u@example.com', role: 'buyer' },
    } as unknown as Request;
    const res = {} as Response;
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    requireAuth(req, res, next);
    expect(nextCalled).toBe(true);
  });
});
