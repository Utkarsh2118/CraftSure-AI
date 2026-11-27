import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';

describe('Orders API routes with PostgreSQL Persistence', () => {
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
    expect(res.body.error.details).toBeDefined();
  });

  it('rejects order with empty items or negative price', async () => {
    const res = await request(app).post('/api/orders').send({
      buyerName: 'Rahul Verma',
      buyerEmail: 'rahul@example.in',
      buyerPhone: '9876543210',
      shippingAddress: {
        line1: '10, Station Road',
        city: 'Lucknow',
        pincode: '226001',
      },
      lineItems: [
        {
          productId: 'prod-01',
          quantity: 1,
          snapshotPriceInPaise: -500, // Negative price invalid
          snapshotTitle: 'Invalid Item',
        },
      ],
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
    // 2 * 285,000 = 570,000 paise (>= 200,000 so free delivery)
    expect(res.body.data.totalInPaise).toBe(570000);
    expect(res.body.data.lineItems).toHaveLength(1);

    // Verify GET /api/orders/:id
    const getRes = await request(app).get(`/api/orders/${res.body.data.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.id).toBe(res.body.data.id);
    expect(getRes.body.data.shippingAddress.pincode).toBe('211001');
  });

  it('correctly calculates delivery fee for orders below 200,000 paise threshold', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        buyerName: 'Amitabh Kumar',
        buyerEmail: 'amitabh@example.in',
        buyerPhone: '9876543211',
        shippingAddress: {
          line1: 'Plot 42, Gomti Nagar',
          city: 'Lucknow',
          pincode: '226010',
        },
        lineItems: [
          {
            productId: 'prod-terracotta-01',
            quantity: 1,
            snapshotPriceInPaise: 45000, // ₹450 (below ₹2,000 threshold)
            snapshotTitle: 'Gorakhpur Terracotta Bell',
          },
        ],
      });

    expect(res.status).toBe(201);
    // 45,000 + 12,000 delivery fee = 57,000 paise
    expect(res.body.data.totalInPaise).toBe(57000);
  });

  it('returns list of orders via GET /api/orders', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('returns 404 for non-existent order ID', async () => {
    const res = await request(app).get('/api/orders/CS-UP-NONEXISTENT-999');
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe('ORDER_NOT_FOUND');
  });
});
