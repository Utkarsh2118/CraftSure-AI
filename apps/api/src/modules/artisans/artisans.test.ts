import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';

describe('Artisans API routes with PostgreSQL Persistence', () => {
  const app = createApp();

  it('registers a new artisan with decoupled initial state machines', async () => {
    const res = await request(app)
      .post('/api/artisans/apply')
      .send({
        shopName: 'Madanpura Pure Weaves',
        bio: 'Generational weavers of Varanasi Kadwa silk',
        districtSlug: 'varanasi',
        craftSpecialization: 'banarasi-silk',
        artisanPehchanCardNumber: 'UP/VNS/9921',
        hasGiAuth: true,
        giAuthorizedUserNumber: 'GI/AU/9921/99',
      });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    // Non-negotiable Rule 3: decoupled states
    expect(res.body.data.approvalStatus).toBe('pending');
    expect(res.body.data.verificationTier).toBe('identity_verified'); // Pehchan card ID provided
    expect(res.body.data.giAuthorizationStatus).toBe('submitted_for_review'); // Not yet authorized until audited

    // Verify retrieval
    const getRes = await request(app).get(`/api/artisans/${res.body.data.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.shopName).toBe('Madanpura Pure Weaves');
    expect(getRes.body.data.craftSpecializations).toContain('banarasi-silk');
  });

  it('registers an unverified artisan when no Pehchan ID is provided', async () => {
    const res = await request(app)
      .post('/api/artisans/apply')
      .send({
        shopName: 'Sambhal Horn & Bone Studio',
        districtSlug: 'sambhal',
        craftSpecialization: 'sambhal-horn-craft',
        hasGiAuth: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.verificationTier).toBe('unverified');
    expect(res.body.data.giAuthorizationStatus).toBe('none');
  });

  it('rejects invalid artisan application with validation details', async () => {
    const res = await request(app)
      .post('/api/artisans/apply')
      .send({
        shopName: '', // Min length 2 validation
        districtSlug: 'varanasi',
        craftSpecialization: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toHaveProperty('shopName');
  });

  it('returns approved artisans from GET /api/artisans', async () => {
    const res = await request(app).get('/api/artisans');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    // Every artisan listed in the public directory must be approved
    expect(res.body.data.every((a: { approvalStatus: string }) => a.approvalStatus === 'approved')).toBe(
      true,
    );
  });

  it('returns 404 for unknown artisan identifier', async () => {
    const res = await request(app).get('/api/artisans/unknown-id-xyz');

    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe('ARTISAN_NOT_FOUND');
  });
});
