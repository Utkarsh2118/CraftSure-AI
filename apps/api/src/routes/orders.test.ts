import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

describe('Orders API routes', () => {
  const app = createApp();

  it('rejects order with invalid PIN code or missing fields', async () => {
    const res = await request(app).post('/api/orders').send({
      buyerName: 'A',
      buyerEmail: 'invalid-email',
      shippingAddress: {
        line1: '123',
        city: 'Varanasi',
        pincode: '123', // invalid PIN
      },
      lineItems: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('creates an order with integer paise totals and returns 201', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        buyerName: 'Ananya Sharma',
        buyerEmail: 'ananya@example.in',
        buyerPhone: '9876543210',
        shippingAddress: {
          line1: '14, Civil Lines',
          city: 'Prayagraj',
          state: 'Uttar Pradesh',
          pincode: '211001',
          country: 'India',
        },
        lineItems: [
          {
            productId: 'prod-chikankari-kurta-01',
            quantity: 2,
            snapshotPriceInPaise: 285000,
            snapshotTitle: 'Hand-embroidered Mulmul Chikankari Kurta',
          },
        ],
        paymentMethod: 'upi',
      });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.id).toMatch(/^CS-UP-/);
    // 2 * 285,000 = 570,000 paise (>= 200,000 so free shipping)
    expect(res.body.data.totalInPaise).toBe(570000);
    expect(res.body.data.lineItems).toHaveLength(1);

    // Verify GET /api/orders/:id
    const getRes = await request(app).get(`/api/orders/${res.body.data.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.id).toBe(res.body.data.id);
  });
});
