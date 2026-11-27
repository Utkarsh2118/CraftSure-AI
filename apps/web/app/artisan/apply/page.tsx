'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Upload, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header/Header';
import { DISTRICTS } from '@/lib/data/catalogue';
import { api } from '@/lib/api/client';
import type { ArtisanProfile } from '@craftsure/shared-types';
import styles from './page.module.css';

export default function ArtisanApplyPage() {
  const [shopName, setShopName] = useState('');
  const [districtSlug, setDistrictSlug] = useState('lucknow');
  const [clusterOrVillage, setClusterOrVillage] = useState('');
  const [craftSpecialization, setCraftSpecialization] = useState('chikankari');
  const [pehchanCard, setPehchanCard] = useState('');
  const [hasGiAuth, setHasGiAuth] = useState(false);
  const [giNumber, setGiNumber] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredProfile, setRegisteredProfile] = useState<ArtisanProfile | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const profile = await api.registerArtisan({
        shopName,
        bio: `Generational artisan workshop practicing ${craftSpecialization} in ${districtSlug}.`,
        districtSlug,
        clusterOrVillage: clusterOrVillage || undefined,
        craftSpecialization,
        artisanPehchanCardNumber: pehchanCard || undefined,
        hasGiAuth,
        giAuthorizedUserNumber: giNumber || undefined,
      });

      setRegisteredProfile(profile);
      setIsSubmitted(true);
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to submit artisan application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className={styles.main} id="main-content">
        <div className="container">
          <header className={styles.header}>
            <span className={styles.eyebrow}>Artisan Onboarding & Verification</span>
            <h1 className={styles.title}>Apply to Sell on CraftSure AI</h1>
            <p className={styles.subtitle}>
              Connect directly with buyers seeking verified handmade creations from Uttar Pradesh.
              We verify artisan identity, Pehchan cards, and statutory GI rights independently.
            </p>
          </header>

          {isSubmitted ? (
            <div className={styles.successBox}>
              <CheckCircle2 size={56} style={{ color: 'var(--color-success)', marginBottom: 'var(--space-4)' }} />
              <h2 className={styles.successTitle}>Application Submitted for Review</h2>
              <p className={styles.successText}>
                Thank you, <strong>{shopName}</strong>! Our verification team has received your application.
                Your Pehchan card {pehchanCard ? `(${pehchanCard})` : ''} and workshop credentials will be
                reviewed within 2 business days.
              </p>
              {registeredProfile && (
                <div style={{ margin: 'var(--space-3) 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  Registration ID: <code>{registeredProfile.id}</code> • Initial Tier:{' '}
                  <code>{registeredProfile.verificationTier}</code> • GI Status:{' '}
                  <code>{registeredProfile.giAuthorizationStatus}</code>
                </div>
              )}
              <div className={styles.noticeBox}>
                <ShieldCheck size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <span>
                  <strong>Separation of Verification:</strong> Store approval, artisan identity tier,
                  and statutory GI authorization are reviewed independently by platform administrators.
                </span>
              </div>
              <Link href="/browse" className={styles.returnBtn}>
                Return to Regional Catalogue <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              {errorMessage && (
                <div
                  role="alert"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 16px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 8,
                    color: '#b91c1c',
                    marginBottom: 16,
                  }}
                >
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}
              <section className={styles.formSection}>
                <h2 className={styles.sectionHeading}>1. Workshop & Craft Information</h2>
                <div className={styles.fieldGroup}>
                  <label htmlFor="shopName" className={styles.label}>
                    Artisan Workshop / Shop Name *
                  </label>
                  <input
                    id="shopName"
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Awadh Heritage Weavers Guild"
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGrid}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="district" className={styles.label}>
                      Home UP District *
                    </label>
                    <select
                      id="district"
                      value={districtSlug}
                      onChange={(e) => setDistrictSlug(e.target.value)}
                      className={styles.select}
                    >
                      {DISTRICTS.map((d) => (
                        <option key={d.slug} value={d.slug}>
                          {d.name} ({d.division.replace(' Division', '')})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="cluster" className={styles.label}>
                      Artisan Cluster or Village
                    </label>
                    <input
                      id="cluster"
                      type="text"
                      value={clusterOrVillage}
                      onChange={(e) => setClusterOrVillage(e.target.value)}
                      placeholder="e.g. Madanpura / Chowk"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="craftSpecialization" className={styles.label}>
                    Primary Craft Specialization *
                  </label>
                  <input
                    id="craftSpecialization"
                    type="text"
                    required
                    value={craftSpecialization}
                    onChange={(e) => setCraftSpecialization(e.target.value)}
                    placeholder="e.g. Chikankari / Banarasi Silk / Metal Engraving"
                    className={styles.input}
                  />
                </div>
              </section>

              <section className={styles.formSection}>
                <h2 className={styles.sectionHeading}>2. Official Verification Documents</h2>
                <div className={styles.fieldGroup}>
                  <label htmlFor="pehchanCard" className={styles.label}>
                    Artisan Pehchan Card Number (Ministry of Textiles)
                  </label>
                  <input
                    id="pehchanCard"
                    type="text"
                    value={pehchanCard}
                    onChange={(e) => setPehchanCard(e.target.value)}
                    placeholder="e.g. UP/LKO/12345"
                    className={styles.input}
                  />
                  <span className={styles.helpText}>
                    Enables fast-track verification to <code>identity_verified</code> or <code>master_craftsperson</code> tier.
                  </span>
                </div>

                <div className={styles.giSection}>
                  <div className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      id="hasGiAuth"
                      checked={hasGiAuth}
                      onChange={(e) => setHasGiAuth(e.target.checked)}
                      className={styles.checkbox}
                    />
                    <label htmlFor="hasGiAuth" className={styles.checkboxLabel}>
                      I hold an official <strong>Authorized User Certificate</strong> from the GI Registry of India
                    </label>
                  </div>

                  {hasGiAuth && (
                    <div className={styles.giFields}>
                      <div className={styles.fieldGroup}>
                        <label htmlFor="giNumber" className={styles.label}>
                          GI Authorized User Number *
                        </label>
                        <input
                          id="giNumber"
                          type="text"
                          required={hasGiAuth}
                          value={giNumber}
                          onChange={(e) => setGiNumber(e.target.value)}
                          placeholder="e.g. GI/AU/7890/12"
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.fileBox}>
                        <Upload size={24} style={{ color: 'var(--color-primary)' }} />
                        <span>Upload GI Certificate (PDF or Image, max 8MB)</span>
                        <input type="file" accept="image/*,application/pdf" className={styles.fileInput} />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <div className={styles.submitRow}>
                <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                  {isSubmitting ? 'Submitting Application...' : 'Submit Application for Audit'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
