import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { authenticateToken, requireAuth, DEMO_TOKENS } from './authenticate';
import * as supabaseLib from '../lib/supabase';
import { db } from '../db/client';
import type { User } from '@supabase/supabase-js';

describe('authenticateToken middleware', () => {
  const originalNodeEnv = process.env['NODE_ENV'];

  beforeEach(() => {
    process.env['NODE_ENV'] = 'test';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env['NODE_ENV'] = originalNodeEnv;
  });

  describe('Authorization Header Parsing & Malformed Rejections', () => {
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

    it('leaves req.user undefined for non-Bearer authorization schemes', async () => {
      const invalidHeaders = [
        'Basic dXNlcjpwYXNz',
        'Digest username="Mufasa"',
        'Token some-token-string',
        'bearer lower-case-prefix',
      ];

      for (const authHeader of invalidHeaders) {
        const req = { headers: { authorization: authHeader } } as Request;
        const res = {} as Response;
        let nextCalled = false;
        const next: NextFunction = () => {
          nextCalled = true;
        };

        await authenticateToken(req, res, next);
        expect(req.user).toBeUndefined();
        expect(nextCalled).toBe(true);
      }
    });

    it('leaves req.user undefined for empty Bearer token', async () => {
      const emptyHeaders = ['Bearer ', 'Bearer', 'Bearer    '];

      for (const authHeader of emptyHeaders) {
        const req = { headers: { authorization: authHeader } } as Request;
        const res = {} as Response;
        let nextCalled = false;
        const next: NextFunction = () => {
          nextCalled = true;
        };

        await authenticateToken(req, res, next);
        expect(req.user).toBeUndefined();
        expect(nextCalled).toBe(true);
      }
    });

    it('strictly rejects client-supplied role injection attempts', async () => {
      const maliciousTokens = [
        'Bearer fake-token?role=platform_admin',
        'Bearer role=store_admin',
        'Bearer user-token&role=artisan',
        'Bearer token-role=buyer',
      ];

      for (const authHeader of maliciousTokens) {
        const req = { headers: { authorization: authHeader } } as Request;
        const res = {} as Response;
        let nextCalled = false;
        const next: NextFunction = () => {
          nextCalled = true;
        };

        await authenticateToken(req, res, next);
        expect(req.user).toBeUndefined();
        expect(nextCalled).toBe(true);
      }
    });

    it('strictly rejects inherited object-property tokens (prototype pollution safety)', async () => {
      const inheritedProps = ['toString', 'valueOf', 'constructor', '__proto__', 'isPrototypeOf'];

      for (const prop of inheritedProps) {
        const req = {
          headers: { authorization: `Bearer ${prop}` },
        } as Request;
        const res = {} as Response;
        let nextCalled = false;
        const next: NextFunction = () => {
          nextCalled = true;
        };

        await authenticateToken(req, res, next);
        expect(req.user).toBeUndefined();
        expect(nextCalled).toBe(true);
      }
    });
  });

  describe('Demo Authentication & Environment Isolation', () => {
    it('correctly maps demo artisan token with artisan role in test environment', async () => {
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
      expect(req.user?.displayName).toBe('Master Weaver Ramzan Ali');
      expect(nextCalled).toBe(true);
    });

    it('correctly maps demo store-admin and platform-admin tokens in test environment', async () => {
      for (const token of ['demo-store-admin', 'demo-platform-admin']) {
        const req = {
          headers: { authorization: `Bearer ${token}` },
        } as Request;
        const res = {} as Response;
        let nextCalled = false;
        const next: NextFunction = () => {
          nextCalled = true;
        };

        await authenticateToken(req, res, next);
        expect(req.user).toBeDefined();
        expect(req.user?.role).toBe(DEMO_TOKENS[token]?.role);
        expect(nextCalled).toBe(true);
      }
    });

    it('strictly rejects demo tokens outside test environment (e.g. production)', async () => {
      process.env['NODE_ENV'] = 'production';

      const demoTokens = ['demo-platform-admin', 'demo-store-admin', 'demo-artisan', 'demo-buyer'];
      for (const token of demoTokens) {
        const req = {
          headers: { authorization: `Bearer ${token}` },
        } as Request;
        const res = {} as Response;
        let nextCalled = false;
        const next: NextFunction = () => {
          nextCalled = true;
        };

        await authenticateToken(req, res, next);
        expect(req.user).toBeUndefined();
        expect(nextCalled).toBe(true);
      }
    });

    it('strictly rejects demo tokens in development environment', async () => {
      process.env['NODE_ENV'] = 'development';

      const req = {
        headers: { authorization: 'Bearer demo-platform-admin' },
      } as Request;
      const res = {} as Response;
      let nextCalled = false;
      const next: NextFunction = () => {
        nextCalled = true;
      };

      await authenticateToken(req, res, next);
      expect(req.user).toBeUndefined();
      expect(nextCalled).toBe(true);
    });
  });

  describe('Supabase JWT Verification & Fail-Closed Database Role Enforcement', () => {
    const mockSupabaseUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      app_metadata: {},
      user_metadata: { full_name: 'Priya Sharma' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'priya@example.in',
    };

    it('authenticates valid Supabase JWT and retrieves verified privileged role from DB', async () => {
      vi.spyOn(supabaseLib, 'verifySupabaseToken').mockResolvedValueOnce({
        user: mockSupabaseUser,
        error: null,
      });

      const mockDbUser = {
        id: mockSupabaseUser.id,
        email: 'priya@example.in',
        role: 'store_admin',
        displayName: 'Priya Sharma (Curator)',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(db, 'select').mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([mockDbUser]),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const req = {
        headers: { authorization: 'Bearer valid-jwt-token-12345' },
      } as Request;
      const res = {} as Response;
      let nextCalled = false;
      const next: NextFunction = () => {
        nextCalled = true;
      };

      await authenticateToken(req, res, next);
      expect(req.user).toBeDefined();
      expect(req.user?.id).toBe(mockSupabaseUser.id);
      expect(req.user?.role).toBe('store_admin');
      expect(req.user?.displayName).toBe('Priya Sharma (Curator)');
      expect(nextCalled).toBe(true);
    });

    it('authenticates valid Supabase JWT and lazy provisions new user with strictly buyer role', async () => {
      vi.spyOn(supabaseLib, 'verifySupabaseToken').mockResolvedValueOnce({
        user: mockSupabaseUser,
        error: null,
      });

      // 1. Initial select finds no existing user
      vi.spyOn(db, 'select').mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([]),
        }),
      } as unknown as ReturnType<typeof db.select>);

      // 2. Insert provisions with default 'buyer' role
      const newlyProvisioned = {
        id: mockSupabaseUser.id,
        email: 'priya@example.in',
        role: 'buyer',
        displayName: 'Priya Sharma',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(db, 'insert').mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          onConflictDoNothing: vi.fn().mockReturnValueOnce({
            returning: vi.fn().mockResolvedValueOnce([newlyProvisioned]),
          }),
        }),
      } as unknown as ReturnType<typeof db.insert>);

      const req = {
        headers: { authorization: 'Bearer valid-jwt-token-new-user' },
      } as Request;
      const res = {} as Response;
      let nextCalled = false;
      const next: NextFunction = () => {
        nextCalled = true;
      };

      await authenticateToken(req, res, next);
      expect(req.user).toBeDefined();
      expect(req.user?.id).toBe(mockSupabaseUser.id);
      expect(req.user?.role).toBe('buyer');
      expect(nextCalled).toBe(true);
    });

    it('safely handles concurrent user provisioning during insert collision', async () => {
      vi.spyOn(supabaseLib, 'verifySupabaseToken').mockResolvedValueOnce({
        user: mockSupabaseUser,
        error: null,
      });

      // 1. Initial select returns empty
      vi.spyOn(db, 'select').mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([]),
        }),
      } as unknown as ReturnType<typeof db.select>);

      // 2. Insert returns empty due to concurrent conflict
      vi.spyOn(db, 'insert').mockReturnValueOnce({
        values: vi.fn().mockReturnValueOnce({
          onConflictDoNothing: vi.fn().mockReturnValueOnce({
            returning: vi.fn().mockResolvedValueOnce([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.insert>);

      // 3. Fallback select retrieves the concurrently inserted record
      const concurrentUser = {
        id: mockSupabaseUser.id,
        email: 'priya@example.in',
        role: 'buyer',
        displayName: 'Priya Sharma',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(db, 'select').mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([concurrentUser]),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const req = {
        headers: { authorization: 'Bearer valid-jwt-token-concurrent' },
      } as Request;
      const res = {} as Response;
      let nextCalled = false;
      const next: NextFunction = () => {
        nextCalled = true;
      };

      await authenticateToken(req, res, next);
      expect(req.user).toBeDefined();
      expect(req.user?.role).toBe('buyer');
      expect(nextCalled).toBe(true);
    });

    it('rejects expired or invalid Supabase JWT', async () => {
      vi.spyOn(supabaseLib, 'verifySupabaseToken').mockResolvedValueOnce({
        user: null,
        error: new Error('JWT expired'),
      });

      const req = {
        headers: { authorization: 'Bearer expired-jwt-token-abc' },
      } as Request;
      const res = {} as Response;
      let nextCalled = false;
      const next: NextFunction = () => {
        nextCalled = true;
      };

      await authenticateToken(req, res, next);
      expect(req.user).toBeUndefined();
      expect(nextCalled).toBe(true);
    });

    it('FAILS CLOSED when database lookup throws an error', async () => {
      vi.spyOn(supabaseLib, 'verifySupabaseToken').mockResolvedValueOnce({
        user: mockSupabaseUser,
        error: null,
      });

      // Database connection error during select
      vi.spyOn(db, 'select').mockImplementationOnce(() => {
        throw new Error('PostgreSQL connection timeout');
      });

      const req = {
        headers: { authorization: 'Bearer valid-token-but-db-down' },
      } as Request;
      const res = {} as Response;
      let nextCalled = false;
      const next: NextFunction = () => {
        nextCalled = true;
      };

      await authenticateToken(req, res, next);
      // Strictly fail closed: req.user must NOT be populated with a default role
      expect(req.user).toBeUndefined();
      expect(nextCalled).toBe(true);
    });

    it('FAILS CLOSED when database provisioning throws an error', async () => {
      vi.spyOn(supabaseLib, 'verifySupabaseToken').mockResolvedValueOnce({
        user: mockSupabaseUser,
        error: null,
      });

      // Initial select returns empty
      vi.spyOn(db, 'select').mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([]),
        }),
      } as unknown as ReturnType<typeof db.select>);

      // Insert fails
      vi.spyOn(db, 'insert').mockImplementationOnce(() => {
        throw new Error('Database write failure');
      });

      const req = {
        headers: { authorization: 'Bearer valid-token-provision-fails' },
      } as Request;
      const res = {} as Response;
      let nextCalled = false;
      const next: NextFunction = () => {
        nextCalled = true;
      };

      await authenticateToken(req, res, next);
      // Strictly fail closed
      expect(req.user).toBeUndefined();
      expect(nextCalled).toBe(true);
    });

    it('FAILS CLOSED when database contains an unrecognized or invalid role', async () => {
      vi.spyOn(supabaseLib, 'verifySupabaseToken').mockResolvedValueOnce({
        user: mockSupabaseUser,
        error: null,
      });

      const corruptedUser = {
        id: mockSupabaseUser.id,
        email: 'priya@example.in',
        role: 'super_admin_unauthorized_role',
        displayName: 'Priya Sharma',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(db, 'select').mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockResolvedValueOnce([corruptedUser]),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const req = {
        headers: { authorization: 'Bearer valid-token-corrupt-db-role' },
      } as Request;
      const res = {} as Response;
      let nextCalled = false;
      const next: NextFunction = () => {
        nextCalled = true;
      };

      await authenticateToken(req, res, next);
      // Strictly reject invalid role
      expect(req.user).toBeUndefined();
      expect(nextCalled).toBe(true);
    });
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
    expect(jsonBody).toMatchObject({
      ok: false,
      error: { code: 'UNAUTHORIZED', message: 'You must be signed in to access this resource.' },
    });
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
