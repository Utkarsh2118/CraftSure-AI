import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, ArrowRight, Layers, Sparkles, MapPin } from 'lucide-react';
import { Header } from '@/components/layout/Header/Header';
import { Badge } from '@/components/ui/Badge/Badge';
import { CRAFTS, getCraftBySlug, getDistrictsForCraft } from '@/lib/data/catalogue';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CRAFTS.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const craft = getCraftBySlug(slug);
  if (!craft) return { title: 'Craft Not Found | CraftSure AI' };

  return {
    title: `${craft.name} — Authentic UP Craft Guide | CraftSure AI`,
    description: craft.description,
  };
}

export default async function CraftDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const craft = getCraftBySlug(slug);

  if (!craft) {
    notFound();
  }

  const associatedDistricts = getDistrictsForCraft(craft.slug);

  return (
    <>
      <Header />
      <main className={styles.main} id="main-content">
        <div className="container">
          <header className={styles.hero}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumbs">
              <Link href="/">Home</Link> &gt; <Link href="/crafts">Crafts</Link> &gt;{' '}
              <span>{craft.name}</span>
            </nav>

            <div className={styles.badgeRow}>
              <Badge variant="category">{craft.category.replace('_', ' ')}</Badge>
              {craft.giRegistered && (
                <Badge variant="gi">
                  <ShieldCheck size={12} style={{ marginRight: 4 }} aria-hidden="true" />
                  GI Tagged: {craft.giRegistrationNumber} ({craft.giRegistrationYear})
                </Badge>
              )}
            </div>

            <h1 className={styles.title}>{craft.name}</h1>
            <p className={styles.description}>{craft.description}</p>

            <div className={styles.actionRow}>
              <Link href={`/browse?craft=${craft.slug}`} className={styles.primaryButton}>
                Shop Authentic {craft.name}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </header>

          <section className={styles.section} aria-labelledby="history-heading">
            <h2 id="history-heading" className={styles.sectionTitle}>
              Historical & Cultural Context
            </h2>
            <div className={styles.proseBox}>
              <p>{craft.historicalContext}</p>
            </div>

            <div className={styles.twoCol}>
              <div className={styles.specCard}>
                <h3 className={styles.specCardTitle}>
                  <Sparkles size={18} aria-hidden="true" style={{ color: 'var(--color-primary)' }} />
                  Traditional Techniques
                </h3>
                <ul className={styles.specList}>
                  {craft.standardTechniques.map((tech) => (
                    <li key={tech} className={styles.specItem}>
                      <span className={styles.bullet}>&bull;</span>
                      <span>{tech}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.specCard}>
                <h3 className={styles.specCardTitle}>
                  <Layers size={18} aria-hidden="true" style={{ color: 'var(--color-primary)' }} />
                  Typical Authentic Materials
                </h3>
                <ul className={styles.specList}>
                  {craft.typicalMaterials.map((mat) => (
                    <li key={mat} className={styles.specItem}>
                      <span className={styles.bullet}>&bull;</span>
                      <span>{mat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="districts-heading">
            <h2 id="districts-heading" className={styles.sectionTitle}>
              Geographical Hubs & ODOP Associations
            </h2>

            <div className={styles.districtsGrid}>
              {associatedDistricts.map(({ district, link }) => (
                <div key={district.slug} className={styles.districtCard}>
                  <div className={styles.districtCardTop}>
                    <h3 className={styles.districtCardTitle}>{district.name}</h3>
                    <Badge variant="district">
                      <MapPin size={10} style={{ marginRight: 3 }} aria-hidden="true" />
                      {link.associationType === 'primary_traditional_hub'
                        ? 'Primary Hub'
                        : 'Secondary Cluster'}
                    </Badge>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    {district.overview}
                  </p>
                  <p className={styles.provenanceText}>
                    <strong>Official Gazette:</strong> {link.sourceCitation}
                  </p>
                  <div style={{ marginTop: 'var(--space-3)' }}>
                    <Link
                      href={`/districts/${district.slug}`}
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                      }}
                    >
                      Explore {district.name} district &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

