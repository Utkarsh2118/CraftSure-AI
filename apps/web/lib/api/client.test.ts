import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, ApiClientError } from './client';

describe('Web API Client (apps/web/lib/api/client)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Catalogue Queries (Districts, Crafts, Products)', () => {
    it('returns districts with fallback when fetch fails or returns offline', async () => {
      const districts = await api.getDistricts();
      expect(Array.isArray(districts)).toBe(true);
      expect(districts.length).toBeGreaterThan(0);
      expect(districts[0]).toHaveProperty('slug');
      expect(districts[0]).toHaveProperty('name');
    });

    it('returns craft definition for a valid slug', async () => {
      const result = await api.getCraft('lucknow-chikankari');
      expect(result).not.toBeNull();
      expect(result?.craft.name).toBe('Lucknow Chikankari');
      expect(result?.craft.category).toBe('textiles_handloom');
    });

    it('returns filtered products with integer paise pricing', async () => {
      const products = await api.getProducts({ craft: 'lucknow-chikankari' });
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
      expect(typeof products[0]?.priceInPaise).toBe('number');
      expect(Number.isInteger(products[0]?.priceInPaise)).toBe(true);
    });
  });

  describe('Orders API Client Integration', () => {
    it('creates an order with integer paise calculations', async () => {
      const payload = {
        buyerName: 'Priya Sharma',
        buyerEmail: 'priya@example.in',
        buyerPhone: '9876543210',
        shippingAddress: {
          line1: '12 Hazratganj',
          city: 'Lucknow',
          state: 'Uttar Pradesh',
          pincode: '226001',
          country: 'India',
        },
        lineItems: [
          {
            productId: 'prod-chikankari-kurta-01',
            quantity: 2,
            snapshotPriceInPaise: 450000,
            snapshotTitle: 'Handcrafted Chikankari Kurta',
          },
        ],
      };

      const order = await api.createOrder(payload);
      expect(order).toBeDefined();
      expect(order.id).toMatch(/^CS-UP-/);
      expect(order.status).toBe('pending');
      expect(typeof order.totalInPaise).toBe('number');
      expect(Number.isInteger(order.totalInPaise)).toBe(true);
      // 2 * 450000 = 900000 paise (>= 200,000 threshold so free delivery)
      expect(order.totalInPaise).toBe(900000);
    });

    it('retrieves orders list', async () => {
      const orders = await api.getOrders();
      expect(Array.isArray(orders)).toBe(true);
    });

    it('throws ApiClientError when backend rejects order with 400 validation error', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid order creation payload.' },
        }),
      } as Response);

      await expect(
        api.createOrder({
          buyerName: 'A',
          buyerEmail: 'not-an-email',
          buyerPhone: '123',
          shippingAddress: {
            line1: '',
            city: '',
            state: '',
            pincode: 'abc',
            country: 'India',
          },
          lineItems: [],
        }),
      ).rejects.toThrow(ApiClientError);
    });
  });

  describe('Artisans API Client Integration', () => {
    it('registers a new artisan with decoupled state machines', async () => {
      const payload = {
        shopName: 'Awadh Chikan Shilpkar',
        districtSlug: 'lucknow',
        craftSpecialization: 'lucknow-chikankari',
        artisanPehchanCardNumber: 'UP/LKO/12345',
        hasGiAuth: true,
        giAuthorizedUserNumber: 'GI/AU/9999/01',
      };

      const artisan = await api.registerArtisan(payload);
      expect(artisan).toBeDefined();
      expect(artisan.shopName).toBe('Awadh Chikan Shilpkar');
      expect(artisan.approvalStatus).toBe('pending');
      expect(artisan.verificationTier).toBe('identity_verified');
      expect(artisan.giAuthorizationStatus).toBe('submitted_for_review');
    });

    it('defaults unverified tier when no Pehchan card is provided', async () => {
      const payload = {
        shopName: 'New Potter Workshop',
        districtSlug: 'gorakhpur',
        craftSpecialization: 'gorakhpur-terracotta',
      };

      const artisan = await api.registerArtisan(payload);
      expect(artisan.verificationTier).toBe('unverified');
      expect(artisan.giAuthorizationStatus).toBe('none');
    });

    it('submits application to POST /api/artisans/apply', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            id: 'artisan-live-01',
            userId: 'user-01',
            shopName: 'Live Test Shop',
            districtId: 'dist-lucknow',
            location: { city: 'Lucknow', state: 'Uttar Pradesh' },
            craftSpecializations: ['lucknow-chikankari'],
            approvalStatus: 'pending',
            verificationTier: 'unverified',
            giAuthorizationStatus: 'none',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      } as Response);

      await api.registerArtisan({
        shopName: 'Live Test Shop',
        districtSlug: 'lucknow',
        craftSpecialization: 'lucknow-chikankari',
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/artisans/apply'),
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    it('throws ApiClientError when backend rejects invalid artisan application', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid artisan application data.' },
        }),
      } as Response);

      await expect(
        api.registerArtisan({
          shopName: '',
          districtSlug: '',
          craftSpecialization: '',
        }),
      ).rejects.toThrow(ApiClientError);
    });
  });

  describe('Admin Console & Audit Trail Integration', () => {
    it('fetches admin verification queue with authorization token', async () => {
      const verifications = await api.getAdminVerifications('demo-store-admin');
      expect(Array.isArray(verifications)).toBe(true);
      expect(verifications.length).toBeGreaterThan(0);
      expect(verifications[0]).toHaveProperty('approvalStatus');
      expect(verifications[0]).toHaveProperty('verificationTier');
      expect(verifications[0]).toHaveProperty('giAuthorizationStatus');
    });

    it('updates verification decision with audit note via POST /verifications/:id/decision', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            id: 'artisan-lucknow-01',
            userId: 'user-artisan-lko',
            shopName: 'Awadh Heritage Crafts',
            districtId: 'dist-lucknow',
            location: { city: 'Lucknow', state: 'Uttar Pradesh' },
            craftSpecializations: ['lucknow-chikankari'],
            approvalStatus: 'approved',
            verificationTier: 'master_craftsperson',
            giAuthorizationStatus: 'gi_authorized_user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      } as Response);

      const updated = await api.updateVerificationDecision(
        'artisan-lucknow-01',
        {
          approvalStatus: 'approved',
          verificationTier: 'master_craftsperson',
          approvalNote: 'Approved after verifying state award certificate.',
        },
        'demo-store-admin',
      );

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/admin/verifications/artisan-lucknow-01/decision'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer demo-store-admin',
          }),
        }),
      );
      expect(updated.approvalStatus).toBe('approved');
    });

    it('throws ApiClientError when admin access is unauthorized (401)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({
          ok: false,
          error: { code: 'UNAUTHORIZED', message: 'You must be signed in to access this resource.' },
        }),
      } as Response);

      await expect(api.getAdminVerifications('invalid-token')).rejects.toThrow(ApiClientError);
    });

    it('throws ApiClientError when user lacks admin privileges (403 Forbidden)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({
          ok: false,
          error: { code: 'FORBIDDEN', message: 'You do not have permission to access this resource.' },
        }),
      } as Response);

      await expect(api.getAdminAuditLogs('demo-buyer')).rejects.toThrow(ApiClientError);
    });

    it('retrieves admin audit log entries', async () => {
      const logs = await api.getAdminAuditLogs('demo-store-admin');
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0]).toHaveProperty('actorId');
      expect(logs[0]).toHaveProperty('action');
    });
  });

  describe('Auth Client Integration', () => {
    it('provides user profile for authenticated session', async () => {
      const user = await api.getCurrentUser('demo-buyer');
      expect(user).toBeDefined();
      expect(user.role).toBe('buyer');
    });

    it('issues deterministic demo login payload', async () => {
      const login = await api.demoLogin('store_admin');
      expect(login.token).toBe('demo-store-admin');
      expect(login.user.role).toBe('store_admin');
    });
  });
});
