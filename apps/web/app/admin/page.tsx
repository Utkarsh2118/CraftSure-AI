'use client';

import { useState } from 'react';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header/Header';
import { Badge } from '@/components/ui/Badge/Badge';
import type { ApprovalStatus, VerificationTier, GiAuthorizationStatus } from '@craftsure/shared-types';
import styles from './page.module.css';

interface ArtisanReviewItem {
  id: string;
  shopName: string;
  district: string;
  craft: string;
  approvalStatus: ApprovalStatus;
  verificationTier: VerificationTier;
  artisanPehchanCardNumber: string | null;
  giAuthorizationStatus: GiAuthorizationStatus;
  giAuthorizedUserNumber: string | null;
}

const INITIAL_ARTISANS: ArtisanReviewItem[] = [
  {
    id: 'artisan-lucknow-01',
    shopName: 'Awadh Heritage Crafts',
    district: 'Lucknow',
    craft: 'Lucknow Chikankari',
    approvalStatus: 'approved',
    verificationTier: 'master_craftsperson',
    artisanPehchanCardNumber: 'UP/LKO/CHIKAN/0492',
    giAuthorizationStatus: 'gi_authorized_user',
    giAuthorizedUserNumber: 'GI/AU/7890/119',
  },
  {
    id: 'artisan-varanasi-01',
    shopName: 'Kashi Bunkar Sahkari Samiti',
    district: 'Varanasi',
    craft: 'Banarasi Silk & Brocade',
    approvalStatus: 'approved',
    verificationTier: 'master_craftsperson',
    artisanPehchanCardNumber: 'UP/VNS/WEAVE/1102',
    giAuthorizationStatus: 'gi_authorized_user',
    giAuthorizedUserNumber: 'GI/AU/3421/99',
  },
  {
    id: 'artisan-moradabad-02',
    shopName: 'Brass Craft Guild of Peetal Nagri',
    district: 'Moradabad',
    craft: 'Moradabad Brassware',
    approvalStatus: 'pending',
    verificationTier: 'identity_verified',
    artisanPehchanCardNumber: 'UP/MBD/MET/4412',
    giAuthorizationStatus: 'submitted_for_review',
    giAuthorizedUserNumber: 'GI/AU/4412/397',
  },
];

export default function AdminConsolePage() {
  const [artisans, setArtisans] = useState<ArtisanReviewItem[]>(INITIAL_ARTISANS);
  const [selectedArtisan, setSelectedArtisan] = useState<ArtisanReviewItem>(
    INITIAL_ARTISANS[0] as ArtisanReviewItem,
  );
  const [auditFeedback, setAuditFeedback] = useState<string | null>(null);

  const handleUpdate = (
    field: 'approvalStatus' | 'verificationTier' | 'giAuthorizationStatus',
    value: string,
  ) => {
    const updated = {
      ...selectedArtisan,
      [field]: value,
    };
    setSelectedArtisan(updated);
    setArtisans((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setAuditFeedback(`Updated ${field} to "${value}". Logged to admin audit trail.`);
    setTimeout(() => setAuditFeedback(null), 3000);
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

          {auditFeedback && (
            <div className={styles.feedbackBanner} role="status">
              <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
              <span>{auditFeedback}</span>
            </div>
          )}

          <div className={styles.layout}>
            {/* List */}
            <aside className={styles.sidebar}>
              <h2 className={styles.sidebarTitle}>Artisans for Review ({artisans.length})</h2>
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
                      {a.district} • {a.craft}
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
                    {selectedArtisan.district} District • {selectedArtisan.craft}
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
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
