import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Award, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header/Header';
import { Badge } from '@/components/ui/Badge/Badge';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About CraftSure AI — Truth in Provenance & ODOP/GI Verification',
  description:
    'Our core mission, statutory Geographical Indication (GI) verification standards, and One District One Product (ODOP) alignment across Uttar Pradesh.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className={styles.main} id="main-content">
        <div className="container">
          <header className={styles.header}>
            <div className={styles.badgeRow}>
              <Badge variant="gi">
                <ShieldCheck size={14} style={{ marginRight: 4 }} />
                Truth in Provenance
              </Badge>
              <Badge variant="district">
                <MapPin size={14} style={{ marginRight: 4 }} />
                75 UP Districts Scope
              </Badge>
            </div>
            <h1 className={styles.title}>About CraftSure AI</h1>
            <p className={styles.lead}>
              An AI-assisted provenance and marketplace ecosystem dedicated to preserving and empowering
              Uttar Pradesh&apos;s rich regional handicraft heritage through verifiable authenticity.
            </p>
          </header>

          <section className={styles.section} aria-labelledby="provenance-rules">
            <h2 id="provenance-rules" className={styles.sectionTitle}>
              Non-Negotiable Product & Provenance Invariants
            </h2>
            <div className={styles.grid}>
              <div className={styles.card}>
                <div className={styles.cardIcon}>
                  <ShieldCheck size={28} style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3 className={styles.cardTitle}>ODOP is Not GI</h3>
                <p className={styles.cardText}>
                  The One District One Product (ODOP) initiative is an industrial promotion scheme
                  by the Government of UP. A Geographical Indication (GI) is a statutory intellectual
                  property right under the <em>Geographical Indications of Goods Act, 1999</em>.
                  An ODOP notification never automatically grants GI authorized-user status.
                </p>
              </div>

              <div className={styles.card}>
                <div className={styles.cardIcon}>
                  <Award size={28} style={{ color: 'var(--color-brass)' }} />
                </div>
                <h3 className={styles.cardTitle}>Three Decoupled State Machines</h3>
                <p className={styles.cardText}>
                  Marketplace <code>approvalStatus</code>, artisan <code>verificationTier</code>, and statutory{' '}
                  <code>giAuthorizationStatus</code> are independent state vectors. None can be inferred
                  from another. A GI badge appears only when an artisan has an audited authorized-user
                  certificate from the GI Registry of India.
                </p>
              </div>

              <div className={styles.card}>
                <div className={styles.cardIcon}>
                  <AlertCircle size={28} style={{ color: 'var(--color-terracotta)' }} />
                </div>
                <h3 className={styles.cardTitle}>Visual Match $\neq$ Authenticity</h3>
                <p className={styles.cardText}>
                  Our computer vision models evaluate stylistic and textural likeness only. AI results
                  are strictly labeled as <strong>Visual Matches</strong> and never &quot;Verified Authentic&quot;.
                  Ambiguous or out-of-distribution non-craft items are explicitly rejected.
                </p>
              </div>

              <div className={styles.card}>
                <div className={styles.cardIcon}>
                  <ShieldCheck size={28} style={{ color: 'var(--color-success)' }} />
                </div>
                <h3 className={styles.cardTitle}>Financial & Media Integrity</h3>
                <p className={styles.cardText}>
                  All transactions and pricing are calculated exclusively in integer paise (never floating-point numbers).
                  Every media asset possesses verified artisan consent or documented open licenses — web scraping is strictly prohibited.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="odop-boundary">
            <h2 id="odop-boundary" className={styles.sectionTitle}>
              Handicraft & Textile Scope Boundary
            </h2>
            <p className={styles.prose}>
              While the official UP ODOP initiative includes agricultural crops, horticulture, and food processing
              (such as Siddharthnagar Kalanamak Rice, Hathras Hing, Pratapgarh Amla, and Auraiya Desi Ghee),
              CraftSure AI strictly focuses on <strong>handloom textiles, woodcarving, metal craft, pottery, terracotta,
              and artisanal fine goods</strong>.
            </p>
            <div className={styles.ctaBox}>
              <h3>Explore Our Verified UP Catalogue</h3>
              <p>Discover 19 traditional crafts documented across 20 focal UP craft districts.</p>
              <div className={styles.ctaActions}>
                <Link href="/browse" className={styles.primaryBtn}>
                  Browse Catalogue <ArrowRight size={16} />
                </Link>
                <Link href="/crafts" className={styles.secondaryBtn}>
                  View Craft Taxonomy
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
