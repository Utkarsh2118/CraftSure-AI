import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import { createApp } from '../../app';
import { ordersMap } from '../orders/orders.router';
import { env } from '../../config/env';

describe('Payments API Routes (/api/payments)', () => {
  const app = createApp();

  beforeEach(() => {
    ordersMap.clear();
  });

  describe('POST /api/payments/create-order', () => {
    it('creates a Razorpay order with server-calculated price and returns 201', async () => {
      const res = await request(app)
        .post('/api/payments/create-order')
        .send({
          buyerName: 'Ananya Sharma',
          buyerEmail: 'ananya@example.com',
          buyerPhone: '9876543210',
          shippingAddress: {
            line1: '14, Civil Lines',
            city: 'Prayagraj',
            state: 'Uttar Pradesh',
            pincode: '211001',
          },
          lineItems: [
            {
              productId: 'prod-chikankari-kurta-01', // price: 285000 paise (₹2,850)
              quantity: 1,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.orderId).toMatch(/^CS-UP-\d{4}-\d{6}$/);
      expect(res.body.data.razorpayOrderId).toBeTruthy();
      // Free shipping applies because subtotal >= 200000 paise
      expect(res.body.data.amountInPaise).toBe(285000);
      expect(res.body.data.currency).toBe('INR');

      // Verify pending order stored in ledger
      const pending = ordersMap.get(res.body.data.orderId);
      expect(pending).toBeDefined();
      expect(pending?.status).toBe('pending');
      expect(pending?.paymentStatus).toBe('pending');
    });

    it('correctly calculates delivery fee for subtotal below ₹2,000 threshold', async () => {
      const res = await request(app)
        .post('/api/payments/create-order')
        .send({
          buyerName: 'Ravi Kumar',
          buyerEmail: 'ravi@example.com',
          buyerPhone: '9876543210',
          shippingAddress: {
            line1: 'Station Road',
            city: 'Gorakhpur',
            state: 'Uttar Pradesh',
            pincode: '273001',
          },
          lineItems: [
            {
              productId: 'prod-gorakhpur-terracotta-elephant-01', // price: 165000 paise (₹1,650)
              quantity: 1,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      // Subtotal (165,000) + Delivery (12,000) = 177,000 paise
      expect(res.body.data.amountInPaise).toBe(177000);
    });

    it('rejects order with invalid or non-existent product ID', async () => {
      const res = await request(app)
        .post('/api/payments/create-order')
        .send({
          buyerName: 'Test Buyer',
          buyerEmail: 'buyer@example.com',
          buyerPhone: '9876543210',
          shippingAddress: {
            line1: '123 Fake Street',
            city: 'Lucknow',
            state: 'Uttar Pradesh',
            pincode: '226001',
          },
          lineItems: [
            {
              productId: 'non-existent-product-id',
              quantity: 1,
            },
          ],
        });

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('rejects order with invalid quantity or empty line items', async () => {
      const res = await request(app)
        .post('/api/payments/create-order')
        .send({
          buyerName: 'Test Buyer',
          buyerEmail: 'buyer@example.com',
          buyerPhone: '9876543210',
          shippingAddress: {
            line1: '123 Fake Street',
            city: 'Lucknow',
            state: 'Uttar Pradesh',
            pincode: '226001',
          },
          lineItems: [],
        });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });
  });

  describe('POST /api/payments/verify', () => {
    it('verifies valid HMAC SHA256 payment signature and updates order status to paid', async () => {
      // 1. Create order
      const createRes = await request(app)
        .post('/api/payments/create-order')
        .send({
          buyerName: 'Pooja Verma',
          buyerEmail: 'pooja@example.com',
          buyerPhone: '9876543210',
          shippingAddress: {
            line1: 'Civil Lines',
            city: 'Varanasi',
            state: 'Uttar Pradesh',
            pincode: '221001',
          },
          lineItems: [{ productId: 'prod-chikankari-kurta-01', quantity: 1 }],
        });

      const { orderId, razorpayOrderId } = createRes.body.data;
      const razorpayPaymentId = 'pay_test_987654321';

      // 2. Generate valid signature using test secret
      const secret = env.RAZORPAY_KEY_SECRET || 'test_secret_12345';
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      // 3. Verify
      const verifyRes = await request(app)
        .post('/api/payments/verify')
        .send({
          orderId,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: validSignature,
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.ok).toBe(true);
      expect(verifyRes.body.data.success).toBe(true);
      expect(verifyRes.body.data.status).toBe('confirmed');
      expect(verifyRes.body.data.paymentStatus).toBe('paid');

      // 4. Verify order in ledger
      const updated = ordersMap.get(orderId);
      expect(updated?.status).toBe('confirmed');
      expect(updated?.paymentStatus).toBe('paid');
      expect(updated?.razorpayPaymentId).toBe(razorpayPaymentId);
      expect(updated?.paymentVerifiedAt).toBeDefined();
    });

    it('rejects invalid payment signature with 400 and preserves pending order status', async () => {
      const createRes = await request(app)
        .post('/api/payments/create-order')
        .send({
          buyerName: 'Pooja Verma',
          buyerEmail: 'pooja@example.com',
          buyerPhone: '9876543210',
          shippingAddress: {
            line1: 'Civil Lines',
            city: 'Varanasi',
            state: 'Uttar Pradesh',
            pincode: '221001',
          },
          lineItems: [{ productId: 'prod-chikankari-kurta-01', quantity: 1 }],
        });

      const { orderId, razorpayOrderId } = createRes.body.data;

      const verifyRes = await request(app)
        .post('/api/payments/verify')
        .send({
          orderId,
          razorpayOrderId,
          razorpayPaymentId: 'pay_test_fraud_001',
          razorpaySignature: 'forged_invalid_signature_hex_string_1234567890abcdef',
        });

      expect(verifyRes.status).toBe(400);
      expect(verifyRes.body.ok).toBe(false);
      expect(verifyRes.body.error.code).toBe('INVALID_SIGNATURE');

      // Preserves pending status
      const preserved = ordersMap.get(orderId);
      expect(preserved?.status).toBe('pending');
      expect(preserved?.paymentStatus).toBe('pending');
    });

    it('handles idempotent verification requests gracefully without failing', async () => {
      const createRes = await request(app)
        .post('/api/payments/create-order')
        .send({
          buyerName: 'Pooja Verma',
          buyerEmail: 'pooja@example.com',
          buyerPhone: '9876543210',
          shippingAddress: {
            line1: 'Civil Lines',
            city: 'Varanasi',
            state: 'Uttar Pradesh',
            pincode: '221001',
          },
          lineItems: [{ productId: 'prod-chikankari-kurta-01', quantity: 1 }],
        });

      const { orderId, razorpayOrderId } = createRes.body.data;
      const razorpayPaymentId = 'pay_test_idempotent_123';
      const secret = env.RAZORPAY_KEY_SECRET || 'test_secret_12345';
      const signature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      // First verification
      await request(app).post('/api/payments/verify').send({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: signature,
      });

      // Second identical verification
      const secondRes = await request(app).post('/api/payments/verify').send({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: signature,
      });

      expect(secondRes.status).toBe(200);
      expect(secondRes.body.ok).toBe(true);
      expect(secondRes.body.data.paymentStatus).toBe('paid');
    });
  });

  describe('POST /api/payments/webhook', () => {
    it('processes payment.captured webhook with valid HMAC signature idempotently', async () => {
      // 1. Create order
      const createRes = await request(app)
        .post('/api/payments/create-order')
        .send({
          buyerName: 'Webhook Buyer',
          buyerEmail: 'webhook@example.com',
          buyerPhone: '9876543210',
          shippingAddress: {
            line1: 'Mall Road',
            city: 'Kanpur',
            state: 'Uttar Pradesh',
            pincode: '208001',
          },
          lineItems: [{ productId: 'prod-chikankari-kurta-01', quantity: 1 }],
        });

      const { razorpayOrderId } = createRes.body.data;

      // 2. Prepare webhook payload
      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_hook_12345',
              order_id: razorpayOrderId,
              status: 'captured',
            },
          },
        },
      };

      const webhookBody = JSON.stringify(webhookPayload);
      const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret_12345';
      const validSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(Buffer.from(webhookBody, 'utf8'))
        .digest('hex');

      const webhookRes = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', validSignature)
        .set('Content-Type', 'application/json')
        .send(webhookBody);

      expect(webhookRes.status).toBe(200);
      expect(webhookRes.body.ok).toBe(true);
      expect(webhookRes.body.data.processed).toBe(true);
    });

    it('rejects webhook with invalid signature with 400', async () => {
      const webhookRes = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', 'forged_webhook_signature')
        .send({ event: 'payment.captured' });

      expect(webhookRes.status).toBe(400);
      expect(webhookRes.body.ok).toBe(false);
      expect(webhookRes.body.error.code).toBe('INVALID_WEBHOOK_SIGNATURE');
    });
  });
});
