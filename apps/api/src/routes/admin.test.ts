import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

describe('Admin Verification & Audit API routes', () => {
  const app = createApp();

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/admin/verifications');
    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  it('rejects buyer role with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/verifications')
      .set('Authorization', 'Bearer demo-buyer');

    expect(res.status).toBe(403);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('allows store_admin to review verifications and record audit log', async () => {
    const listRes = await request(app)
      .get('/api/admin/verifications')
      .set('Authorization', 'Bearer demo-store-admin');

    expect(listRes.status).toBe(200);
    expect(listRes.body.ok).toBe(true);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    // Make an audit decision on lucknow artisan
    const decisionRes = await request(app)
      .post('/api/admin/verifications/artisan-lucknow-01/decision')
      .set('Authorization', 'Bearer demo-store-admin')
      .send({
        verificationTier: 'master_craftsperson',
        giAuthorizationStatus: 'gi_authorized_user',
        approvalNote: 'Verified national master craftsperson award and GI AU certificate.',
      });

    expect(decisionRes.status).toBe(200);
    expect(decisionRes.body.ok).toBe(true);
    expect(decisionRes.body.data.artisan.giAuthorizationStatus).toBe('gi_authorized_user');
    expect(decisionRes.body.data.audit.action).toBe('UPDATE_ARTISAN_VERIFICATION');

    // Platform admin checks audit logs
    const auditRes = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', 'Bearer demo-platform-admin');

    expect(auditRes.status).toBe(200);
    expect(auditRes.body.ok).toBe(true);
    expect(auditRes.body.data.length).toBeGreaterThan(0);
  });
});
