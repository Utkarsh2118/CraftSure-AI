import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

describe('Artisans API routes', () => {
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
  });

  it('returns 404 for non-existent artisan ID', async () => {
    const res = await request(app).get('/api/artisans/unknown-artisan-id');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('ARTISAN_NOT_FOUND');
  });
});
