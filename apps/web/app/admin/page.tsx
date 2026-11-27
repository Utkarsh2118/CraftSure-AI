'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, Clock, FileText, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/layout/Header/Header';
import { Badge } from '@/components/ui/Badge/Badge';
import { api, ApiClientError, type AdminAuditLogEntry } from '@/lib/api/client';
import type {
  ApprovalStatus,
  VerificationTier,
  GiAuthorizationStatus,
  ArtisanProfile,
} from '@craftsure/shared-types';
import styles from './page.module.css';

const INITIAL_ARTISANS: ArtisanProfile[] = [
  {
    id: 'artisan-lucknow-01',
    userId: 'user-artisan-lko',
    shopName: 'Awadh Heritage Crafts',
    bio: 'Generational master Chikankari artisans practicing traditional shadow work and jaali in Chowk, Lucknow.',
    districtId: 'dist-lucknow',
    clusterOrVillage: 'Old Chowk Artisan Cluster',
    location: { city: 'Lucknow', state: 'Uttar Pradesh' },
    craftSpecializations: ['lucknow-chikankari', 'zari-zardozi'],
    approvalStatus: 'approved',
    approvalNote: 'Verified traditional workshop during cluster census.',
    verificationTier: 'master_craftsperson',
    artisanPehchanCardNumber: 'UP/LKO/CHIKAN/0492',
    giAuthorizationStatus: 'gi_authorized_user',
    giAuthorizedUserNumber: 'GI/AU/7890/119',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'artisan-varanasi-01',
    userId: 'user-artisan-vns',
    shopName: 'Kashi Bunkar Sahkari Samiti',
    bio: 'Master weaver cooperative preserving traditional pure Katan silk Kadwa handloom techniques.',
    districtId: 'dist-varanasi',
    clusterOrVillage: 'Madanpura Weavers Colony',
    location: { city: 'Varanasi', state: 'Uttar Pradesh' },
    craftSpecializations: ['banarasi-silk'],
    approvalStatus: 'approved',
    approvalNote: 'Cooperative society registration verified.',
    verificationTier: 'master_craftsperson',
    artisanPehchanCardNumber: 'UP/VNS/WEAVE/1102',
    giAuthorizationStatus: 'gi_authorized_user',
    giAuthorizedUserNumber: 'GI/AU/3421/99',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'artisan-moradabad-02',
    userId: 'user-artisan-mbd',
    shopName: 'Brass Craft Guild of Peetal Nagri',
    bio: 'Master brass casting and engraving guild in Moradabad.',
    districtId: 'dist-moradabad',
    clusterOrVillage: 'Peetal Bunkar Gali',
    location: { city: 'Moradabad', state: 'Uttar Pradesh' },
    craftSpecializations: ['moradabad-brassware'],
    approvalStatus: 'pending',
    approvalNote: 'Awaiting Pehchan card identity audit.',
    verificationTier: 'identity_verified',
    artisanPehchanCardNumber: 'UP/MBD/MET/4412',
    giAuthorizationStatus: 'submitted_for_review',
    giAuthorizedUserNumber: 'GI/AU/4412/397',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function AdminConsolePage() {
  const [adminToken, setAdminToken] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored =
        localStorage.getItem('craftsure_admin_token') ??
        localStorage.getItem('craftsure_auth_token');
      if (stored) return stored;
    }
    return process.env.NODE_ENV === 'test' ? 'demo-platform-admin' : '';
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [artisans, setArtisans] = useState<ArtisanProfile[]>(INITIAL_ARTISANS);
  const [selectedArtisan, setSelectedArtisan] = useState<ArtisanProfile>(INITIAL_ARTISANS[0] as ArtisanProfile);
  const [auditFeedback, setAuditFeedback] = useState<string | null>(null);
  const [isErrorFeedback, setIsErrorFeedback] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (!adminToken) {
        setAuthError('Administrator token is required to access the verification queue.');
        return;
      }

      setIsLoading(true);
      setAuthError(null);
      try {
        const [liveArtisans, liveLogs] = await Promise.all([
          api.getAdminVerifications(adminToken),
          api.getAdminAuditLogs(adminToken),
        ]);
        if (mounted) {
          if (liveArtisans && liveArtisans.length > 0) {
            setArtisans(liveArtisans);
            setSelectedArtisan(liveArtisans[0] as ArtisanProfile);
          }
          if (liveLogs && liveLogs.length > 0) {
            setAuditLogs(liveLogs);
          }
        }
      } catch (err) {
        if (mounted) {
          if (err instanceof ApiClientError && (err.status === 401 || err.status === 403)) {
            setAuthError(err.message || 'Access denied. Store Admin or Platform Admin role required.');
          }
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [adminToken]);

  const handleUpdate = async (
    field: 'approvalStatus' | 'verificationTier' | 'giAuthorizationStatus',
    value: string,
  ) => {
    const previousArtisan = { ...selectedArtisan };
    const updated = {
      ...selectedArtisan,
      [field]: value,
    };
    setSelectedArtisan(updated);
    setArtisans((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

    try {
      const decisionPayload: {
        approvalStatus?: ApprovalStatus;
        verificationTier?: VerificationTier;
        giAuthorizationStatus?: GiAuthorizationStatus;
        approvalNote?: string;
      } = {
        ...(field === 'approvalStatus' && { approvalStatus: value as ApprovalStatus }),
        ...(field === 'verificationTier' && { verificationTier: value as VerificationTier }),
        ...(field === 'giAuthorizationStatus' && { giAuthorizationStatus: value as GiAuthorizationStatus }),
        approvalNote: `Decision updated to ${value} via Admin Console.`,
      };

      await api.updateVerificationDecision(
        selectedArtisan.id,
        decisionPayload,
        adminToken,
      );
      const freshLogs = await api.getAdminAuditLogs(adminToken);
      if (freshLogs) setAuditLogs(freshLogs);
      setIsErrorFeedback(false);
      setAuditFeedback(`Updated ${field} to "${value}". Persisted to database & admin audit trail.`);
    } catch (err) {
      // Revert optimistic update on server rejection
      setSelectedArtisan(previousArtisan);
      setArtisans((prev) => prev.map((a) => (a.id === previousArtisan.id ? previousArtisan : a)));
      setIsErrorFeedback(true);
      setAuditFeedback(`Failed to update decision: ${(err as Error).message}`);
    }

    setTimeout(() => setAuditFeedback(null), 4000);
  };

  return (
    <>
      <Header />
      <main className={styles.main} id="main-content">
        <div className="container">
          <header className={styles.header}>
            <div className={styles.eyebrow}>
              <ShieldCheck size={14} style={{ marginRight: 4 }} />
              Platform Administration & Provenance Audit
            </div>
            <h1 className={styles.title}>GI Verification & Artisan Audit Console</h1>
            <p className={styles.subtitle}>
              Decoupled review console. Never infer approval status, artisan identity tier, or
              statutory GI rights from one another.
            </p>
          </header>

          {authError && (
            <div
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                color: '#b91c1c',
                marginBottom: 24,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={20} />
                <span>
                  <strong>Authentication Required:</strong> {authError}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const demoToken = 'demo-platform-admin';
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('craftsure_admin_token', demoToken);
                  }
                  setAdminToken(demoToken);
                  setAuthError(null);
                }}
                style={{
                  padding: '6px 12px',
                  background: '#b91c1c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Use Demo Admin Token
              </button>
            </div>
          )}

          {auditFeedback && (
            <div
              className={styles.feedbackBanner}
              role="status"
              style={
                isErrorFeedback
                  ? {
                      background: '#fef2f2',
                      borderColor: '#fecaca',
                      color: '#b91c1c',
                    }
                  : undefined
              }
            >
              {isErrorFeedback ? (
                <AlertTriangle size={18} style={{ color: '#b91c1c' }} />
              ) : (
                <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
              )}
              <span>{auditFeedback}</span>
            </div>
          )}

          <div className={styles.layout}>
            {/* List */}
            <aside className={styles.sidebar}>
              <h2 className={styles.sidebarTitle}>Artisans for Review ({artisans.length})</h2>
              {isLoading && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Refreshing queue...</p>}
              <div className={styles.artisanList}>
                {artisans.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`${styles.artisanCard} ${selectedArtisan.id === a.id ? styles.artisanCardActive : ''}`}
                    onClick={() => setSelectedArtisan(a)}
                  >
                    <span className={styles.shopName}>{a.shopName}</span>
                    <span className={styles.districtName}>
                      {a.location.city} • {a.craftSpecializations[0] ?? 'Craft'}
                    </span>
                    <div className={styles.badgeRow}>
                      <Badge variant="status">{a.approvalStatus}</Badge>
                      <Badge variant="gi">{a.giAuthorizationStatus.replace('_', ' ')}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            {/* Details & State Machine Controls */}
            <section className={styles.detailPane}>
              <div className={styles.detailHeader}>
                <div>
                  <h2 className={styles.detailTitle}>{selectedArtisan.shopName}</h2>
                  <span className={styles.detailDistrict}>
                    {selectedArtisan.location.city} District • {selectedArtisan.craftSpecializations.join(', ')}
                  </span>
                </div>
                <div className={styles.idBox}>ID: {selectedArtisan.id}</div>
              </div>

              {/* State Machine 1: ApprovalStatus */}
              <div className={styles.cardBox}>
                <h3 className={styles.cardBoxTitle}>1. Store Operations (ApprovalStatus)</h3>
                <p className={styles.cardBoxDesc}>
                  Controls whether the artisan can list products and receive customer orders.
                </p>
                <div className={styles.btnGroup}>
                  {(['pending', 'approved', 'suspended', 'rejected'] as ApprovalStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`${styles.controlBtn} ${selectedArtisan.approvalStatus === st ? styles.controlBtnActive : ''}`}
                      onClick={() => handleUpdate('approvalStatus', st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* State Machine 2: VerificationTier */}
              <div className={styles.cardBox}>
                <h3 className={styles.cardBoxTitle}>2. Identity Vetting (VerificationTier)</h3>
                <p className={styles.cardBoxDesc}>
                  Pehchan Card:{' '}
                  <strong>{selectedArtisan.artisanPehchanCardNumber ?? 'None provided'}</strong>
                </p>
                <div className={styles.btnGroup}>
                  {(
                    ['unverified', 'phone_verified', 'identity_verified', 'master_craftsperson'] as VerificationTier[]
                  ).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      className={`${styles.controlBtn} ${selectedArtisan.verificationTier === tier ? styles.controlBtnActive : ''}`}
                      onClick={() => handleUpdate('verificationTier', tier)}
                    >
                      {tier.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* State Machine 3: GiAuthorizationStatus */}
              <div className={styles.cardBox}>
                <h3 className={styles.cardBoxTitle}>
                  3. Statutory GI Rights (GiAuthorizationStatus)
                </h3>
                <p className={styles.cardBoxDesc}>
                  Authorized User No:{' '}
                  <strong>{selectedArtisan.giAuthorizedUserNumber ?? 'None provided'}</strong>
                  <br />
                  <em>
                    Non-negotiable rule: GI badge appears on products ONLY when authorized user
                    certificate is validated.
                  </em>
                </p>
                <div className={styles.btnGroup}>
                  {(
                    [
                      'none',
                      'applied',
                      'submitted_for_review',
                      'gi_authorized_user',
                      'rejected',
                      'revoked',
                    ] as GiAuthorizationStatus[]
                  ).map((gi) => (
                    <button
                      key={gi}
                      type="button"
                      className={`${styles.controlBtn} ${selectedArtisan.giAuthorizationStatus === gi ? styles.controlBtnActive : ''}`}
                      onClick={() => handleUpdate('giAuthorizationStatus', gi)}
                    >
                      {gi.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Audit Trail */}
              {auditLogs.length > 0 && (
                <div className={styles.cardBox}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <FileText size={16} style={{ color: 'var(--color-primary)' }} />
                    <h3 className={styles.cardBoxTitle} style={{ margin: 0 }}>
                      Recent Administrative Audit Trail
                    </h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                    {auditLogs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        style={{
                          padding: '8px 12px',
                          background: 'var(--color-surface)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: 2 }}>
                          <span>Actor: <strong>{log.actorId}</strong></span>
                          <span><Clock size={12} style={{ verticalAlign: 'middle', marginRight: 2 }} />{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div>
                          Action: <code>{log.action}</code> on <strong>{log.targetId}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
