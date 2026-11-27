import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

describe('Auth API Routes (/api/auth)', () => {
  const app = createApp();
  const originalNodeEnv = process.env['NODE_ENV'];

  beforeEach(() => {
    process.env['NODE_ENV'] = 'test';
  });

  afterEach(() => {
    process.env['NODE_ENV'] = originalNodeEnv;
  });

  describe('GET /api/auth/me', () => {
    it('rejects unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns authenticated user profile for valid session', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer demo-artisan');

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.role).toBe('artisan');
      expect(res.body.data.email).toBe('ramzan.ali@craftsure.ai');
    });

    it('rejects client-supplied forged token with 401', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer forged-token-role=platform_admin');

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/auth/demo-login', () => {
    it('issues deterministic demo tokens in test environment with consistent hyphenated naming', async () => {
      const res = await request(app)
        .post('/api/auth/demo-login')
        .send({ role: 'store_admin' });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.token).toBe('demo-store-admin');
      expect(res.body.data.user.role).toBe('store_admin');
    });

    it('issues deterministic demo platform-admin token in test environment', async () => {
      const res = await request(app)
        .post('/api/auth/demo-login')
        .send({ role: 'platform_admin' });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.token).toBe('demo-platform-admin');
      expect(res.body.data.user.role).toBe('platform_admin');
    });

    it('rejects invalid role with 400 validation error', async () => {
      const res = await request(app)
        .post('/api/auth/demo-login')
        .send({ role: 'super_hacker' });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('strictly forbids demo login outside test environment (e.g. production)', async () => {
      process.env['NODE_ENV'] = 'production';

      const res = await request(app)
        .post('/api/auth/demo-login')
        .send({ role: 'buyer' });

      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('Demo authentication is only permitted in the test environment');
    });

    it('strictly forbids demo login in development environment', async () => {
      process.env['NODE_ENV'] = 'development';

      const res = await request(app)
        .post('/api/auth/demo-login')
        .send({ role: 'buyer' });

      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });
});
