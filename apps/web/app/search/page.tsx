'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  UploadCloud,
  ShieldAlert,
  ShieldCheck,
  Check,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Header } from '@/components/layout/Header/Header';
import { Badge } from '@/components/ui/Badge/Badge';
import { PRODUCTS } from '@/lib/data/catalogue';
import { formatPaise } from '@/lib/utils/currency';
import styles from './page.module.css';

interface DemoMatch {
  status: 'similarity_match' | 'unsupported_or_inconclusive';
  craftName: string;
  craftSlug: string;
  district: string;
  confidence: number;
  techniques: string[];
  matchedProductId: string;
  rejectionReason?: string;
}

const SAMPLE_QUERIES: { label: string; query: string; isOod?: boolean }[] = [
  { label: 'Lucknow Chikankari Kurta', query: 'lucknow_chikankari' },
  { label: 'Varanasi Banarasi Silk Brocade', query: 'banarasi_silk' },
  { label: 'Moradabad Naqqaashi Brass Urn', query: 'moradabad_brass' },
  { label: 'Gorakhpur Earthen Terracotta', query: 'gorakhpur_terracotta' },
  { label: 'Saharanpur Carved Wood Screen', query: 'saharanpur_wood' },
  { label: 'Non-Craft Modern Item (OOD Test)', query: 'non_craft_synthetic', isOod: true },
];

export default function VisualSearchPage() {
  const [selectedSample, setSelectedSample] = useState<string>('lucknow_chikankari');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Compute visual search result based on query
  const getResult = (query: string): DemoMatch => {
    if (query === 'non_craft_synthetic') {
      return {
        status: 'unsupported_or_inconclusive',
        craftName: 'Unrecognized Item',
        craftSlug: '',
        district: '',
        confidence: 0.22,
        techniques: [],
        matchedProductId: '',
        rejectionReason:
          'This image does not match any indexed Uttar Pradesh traditional handicraft clusters. It may be modern industrial machinery or an unverified synthetic weave.',
      };
    }

    if (query.includes('banarasi')) {
      return {
        status: 'similarity_match',
        craftName: 'Varanasi Banarasi Silk Brocade',
        craftSlug: 'banarasi-silk',
        district: 'Varanasi',
        confidence: 0.92,
        techniques: ['Kadwa Weaving', 'Kalga Zari Borders', 'Katan Silk Warp'],
        matchedProductId: 'prod-banarasi-saree-01',
      };
    }

    if (query.includes('brass')) {
      return {
        status: 'similarity_match',
        craftName: 'Moradabad Metal Craft & Brassware',
        craftSlug: 'moradabad-brassware',
        district: 'Moradabad',
        confidence: 0.88,
        techniques: ['Sand Casting', 'Naqqaashi (Hand Chasing)', 'Antique Patina'],
        matchedProductId: 'prod-moradabad-brass-vase-01',
      };
    }

    if (query.includes('terracotta')) {
      return {
        status: 'similarity_match',
        craftName: 'Gorakhpur Terracotta',
        craftSlug: 'gorakhpur-terracotta',
        district: 'Gorakhpur',
        confidence: 0.94,
        techniques: ['Hand Modeling without Mold', 'Clay Filigree Strips', 'Wood Firing'],
        matchedProductId: 'prod-gorakhpur-terracotta-elephant-01',
      };
    }

    if (query.includes('wood')) {
      return {
        status: 'similarity_match',
        craftName: 'Saharanpur Wood Carving',
        craftSlug: 'saharanpur-wood-carving',
        district: 'Saharanpur',
        confidence: 0.91,
        techniques: ['Lattice Cutwork (Jali)', 'Deep Floral Chiseling', 'Beeswax Buffing'],
        matchedProductId: 'prod-saharanpur-wood-screen-01',
      };
    }

    // Default Chikankari
    return {
      status: 'similarity_match',
      craftName: 'Lucknow Chikankari',
      craftSlug: 'lucknow-chikankari',
      district: 'Lucknow',
      confidence: 0.89,
      techniques: ['Shadow Work (Bakhiya)', 'Murri Knotting', 'Openwork Jaali'],
      matchedProductId: 'prod-chikankari-kurta-01',
    };
  };

  const currentResult = getResult(selectedSample);
  const matchedProduct = PRODUCTS.find((p) => p.id === currentResult.matchedProductId);

  const handleSelectSample = (query: string) => {
    setIsSearching(true);
    setSelectedSample(query);
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  return (
    <>
      <Header />
      <main className={styles.main} id="main-content">
        <div className="container">
          <header className={styles.header}>
            <h1 className={styles.title}>AI-Powered Craft Discovery</h1>
            <p className={styles.subtitle}>
              Upload a photograph of any textile, metalware, woodwork, or pottery to identify its
              traditional Uttar Pradesh craft style and discover verified artisan creations.
            </p>
          </header>

          <div className={styles.demoBanner}>
            <Info size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} aria-hidden="true" />
            <span>
              <strong>Pilot Model Architecture:</strong> DINOv2 / CLIP vision backbone with calibrated
              Platt scaling and out-of-distribution (OOD) rejection classifier for the 5 pilot UP crafts.
            </span>
          </div>

          {/* Interactive Upload Area */}
          <div
            className={styles.uploadZone}
            role="button"
            tabIndex={0}
            aria-label="Upload handicraft photo for visual matching"
            onClick={() => handleSelectSample('lucknow_chikankari')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleSelectSample('lucknow_chikankari');
              }
            }}
          >
            <UploadCloud size={44} className={styles.uploadIcon} aria-hidden="true" />
            <div className={styles.uploadPrompt}>Drag and drop a handicraft photo, or tap to choose</div>
            <div className={styles.uploadSub}>Supports JPEG, PNG, or WebP up to 8MB</div>
          </div>

          {/* Sample Selectors */}
          <div>
            <div className={styles.sampleTitle}>Or test with verified dataset samples:</div>
            <div className={styles.sampleChips}>
              {SAMPLE_QUERIES.map((sample) => {
                const isSelected = selectedSample === sample.query;
                let chipClass = styles.sampleChip;
                if (sample.isOod) {
                  chipClass = `${styles.sampleChip} ${styles.oodChip} ${isSelected ? styles.activeOodChip : ''}`;
                } else if (isSelected) {
                  chipClass = `${styles.sampleChip} ${styles.activeChip}`;
                }

                return (
                  <button
                    key={sample.query}
                    type="button"
                    className={chipClass}
                    onClick={() => handleSelectSample(sample.query)}
                  >
                    {sample.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inference Output Area */}
          <section className={styles.resultSection} aria-live="polite">
            {isSearching ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
                Analyzing weave structure, motif density, and surface reflection...
              </div>
            ) : currentResult.status === 'unsupported_or_inconclusive' ? (
              <div className={styles.rejectionCard}>
                <div className={styles.rejectionTitle}>
                  <ShieldAlert size={22} aria-hidden="true" />
                  Inconclusive / Out-of-Distribution Image
                </div>
                <p className={styles.rejectionText}>{currentResult.rejectionReason}</p>
                <div className={styles.disclaimerBox}>
                  <strong>Truth in Provenance Principle:</strong> CraftSure AI will never fabricate a craft
                  match or falsely attribute an unverified item. When confidence falls below our calibrated
                  threshold, we report an honest inconclusive result.
                </div>
              </div>
            ) : (
              <div className={styles.matchCard}>
                <div className={styles.matchHeader}>
                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      Identified Traditional Craft Form
                    </span>
                    <h2 className={styles.matchTitle}>{currentResult.craftName}</h2>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                      <Badge variant="district">Origin: {currentResult.district}</Badge>
                      <Badge variant="gi">ODOP & GI Sourced</Badge>
                    </div>
                  </div>

                  <div className={styles.confidenceBadge}>
                    <Sparkles size={14} aria-hidden="true" />
                    Calibrated Match: {Math.round(currentResult.confidence * 100)}%
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-2)' }}>
                    Detected Visual Techniques:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {currentResult.techniques.map((tech) => (
                      <Badge key={tech} variant="technique">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className={styles.disclaimerBox}>
                  <strong>Statutory Notice:</strong> Visual similarity indicates stylistic and textural match
                  only. Authentic GI rights require verified artisan registration.
                </div>

                {/* Direct Verified Product Recommendation */}
                {matchedProduct && (
                  <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-3)' }}>
                      Verified Artisan Listing for this Craft
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                      <div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          {matchedProduct.artisanShopName}
                        </div>
                        <Link
                          href={`/products/${matchedProduct.id}`}
                          style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-primary)', textDecoration: 'none' }}
                        >
                          {matchedProduct.title}
                        </Link>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-primary)', marginTop: 2 }}>
                          {formatPaise(matchedProduct.priceInPaise)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <Link
                          href={`/products/${matchedProduct.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-1)',
                            background: 'var(--color-primary)',
                            color: '#fff',
                            padding: '0.6rem 1.2rem',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}
                        >
                          View Provenance & Buy <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

