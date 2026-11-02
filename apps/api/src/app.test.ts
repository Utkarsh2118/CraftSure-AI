import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from './app';

describe('API App Endpoints and Middleware', () => {
  const app = createApp();

  describe('GET /health', () => {
    it('returns ok status with timestamp in ApiResponse envelope', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        data: {
          status: 'ok',
        },
      });
      expect(typeof res.body.data.timestamp).toBe('string');
    });
  });

  describe('CORS', () => {
    it('handles OPTIONS preflight request', async () => {
      const res = await request(app).options('/health').set('Origin', 'http://localhost:3000');
      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });
  });

  describe('404 Handler', () => {
    it('returns typed NOT_FOUND ApiResponse for non-existent route', async () => {
      const res = await request(app).get('/api/unknown-endpoint');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        ok: false,
        error: {
          code: 'NOT_FOUND',
          message: 'The requested resource does not exist.',
        },
      });
    });
  });

  describe('GET /api/districts', () => {
    it('returns list of Uttar Pradesh districts with pagination', async () => {
      const res = await request(app).get('/api/districts');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.total).toBeGreaterThanOrEqual(20);
      expect(res.body.data.items[0]).toHaveProperty('odopPortalUrl');
    });

    it('filters districts by division', async () => {
      const res = await request(app).get('/api/districts?division=Varanasi%20Division');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      for (const item of res.body.data.items) {
        expect(item.division).toBe('Varanasi Division');
      }
    });
  });

  describe('GET /api/districts/:slug', () => {
    it('returns Varanasi district profile with mapped crafts and official citations', async () => {
      const res = await request(app).get('/api/districts/varanasi');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.district.name).toBe('Varanasi');
      expect(Array.isArray(res.body.data.crafts)).toBe(true);
      expect(
        res.body.data.crafts.some((c: { craftSlug: string }) => c.craftSlug === 'banarasi-silk'),
      ).toBe(true);
    });

    it('returns 404 for non-existent district', async () => {
      const res = await request(app).get('/api/districts/non-existent-district');
      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe('DISTRICT_NOT_FOUND');
    });
  });

  describe('GET /api/crafts', () => {
    it('returns craft definitions across Uttar Pradesh', async () => {
      const res = await request(app).get('/api/crafts');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.total).toBeGreaterThanOrEqual(15);
    });

    it('filters crafts by category', async () => {
      const res = await request(app).get('/api/crafts?category=pottery_ceramics');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      for (const item of res.body.data.items) {
        expect(item.category).toBe('pottery_ceramics');
      }
    });

    it('filters crafts by giOnly=true', async () => {
      const res = await request(app).get('/api/crafts?giOnly=true');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      for (const item of res.body.data.items) {
        expect(item.giRegistered).toBe(true);
      }
    });
  });

  describe('GET /api/crafts/:slug', () => {
    it('returns Lucknow Chikankari with techniques, materials, and GI Registry #119', async () => {
      const res = await request(app).get('/api/crafts/lucknow-chikankari');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.craft.name).toBe('Lucknow Chikankari');
      expect(res.body.data.craft.giRegistrationNumber).toBe('119');
      expect(res.body.data.craft.standardTechniques).toContain('Shadow Work (Bakhiya)');
      expect(
        res.body.data.districts.some((d: { districtSlug: string }) => d.districtSlug === 'lucknow'),
      ).toBe(true);
    });

    it('returns 404 for unknown craft', async () => {
      const res = await request(app).get('/api/crafts/unknown-craft');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('CRAFT_NOT_FOUND');
    });
  });

  describe('GET /api/products', () => {
    it('returns list of products across UP craft clusters', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });

    it('filters products by district', async () => {
      const res = await request(app).get('/api/products?district=Lucknow');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      for (const item of res.body.data.items) {
        expect(item.originDistrict.toLowerCase()).toBe('lucknow');
      }
    });

    it('filters products by giCertifiedOnly=true', async () => {
      const res = await request(app).get('/api/products?giCertifiedOnly=true');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      for (const item of res.body.data.items) {
        expect(item.isGiCraftItem).toBe(true);
      }
    });

    it('sorts products by price ascending', async () => {
      const res = await request(app).get('/api/products?sort=price_asc');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      const items = res.body.data.items;
      for (let i = 0; i < items.length - 1; i++) {
        expect(items[i].priceInPaise).toBeLessThanOrEqual(items[i + 1].priceInPaise);
      }
    });
  });

  describe('GET /api/products/:id', () => {
    it('returns product details with origin cluster and materials', async () => {
      const res = await request(app).get('/api/products/prod-banarasi-saree-01');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.title).toContain('Banarasi');
      expect(res.body.data.originDistrict).toBe('Varanasi');
      expect(res.body.data.priceInPaise).toBe(1850000);
    });

    it('returns 404 for unknown product id', async () => {
      const res = await request(app).get('/api/products/unknown-prod-id');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });
  });

  describe('POST /api/ai/visual-search', () => {
    it('returns similarity match with calibrated confidence for craft query', async () => {
      const res = await request(app)
        .post('/api/ai/visual-search')
        .send({ sampleQuery: 'lucknow_chikankari' });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.status).toBe('similarity_match');
      expect(res.body.data.calibratedConfidence).toBeGreaterThanOrEqual(0.7);
      expect(res.body.data.topMatches).toHaveLength(1);
      expect(res.body.data.topMatches[0].craftSlug).toBe('lucknow-chikankari');
      expect(res.body.data.disclaimer).toContain('Visual similarity indicates stylistic match only');
    });

    it('rejects out-of-distribution non-craft item with status unsupported_or_inconclusive', async () => {
      const res = await request(app)
        .post('/api/ai/visual-search')
        .send({ sampleQuery: 'non_craft_synthetic' });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.status).toBe('unsupported_or_inconclusive');
      expect(res.body.data.rejectionReason).toBe('out_of_distribution');
      expect(res.body.data.topMatches).toHaveLength(0);
    });
  });
});
