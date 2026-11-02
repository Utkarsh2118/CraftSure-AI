import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MapPin, ShieldCheck, ArrowRight, ExternalLink, Layers } from 'lucide-react';
import { Header } from '@/components/layout/Header/Header';
import { Badge } from '@/components/ui/Badge/Badge';
import { DISTRICTS, getDistrictBySlug, getCraftsForDistrict } from '@/lib/data/catalogue';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return DISTRICTS.map((d) => ({
    slug: d.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const district = getDistrictBySlug(slug);
  if (!district) return { title: 'District Not Found | CraftSure AI' };

  return {
    title: `${district.name} Craft Heritage & ODOP Artisans | CraftSure AI`,
    description: district.overview,
  };
}

export default async function DistrictDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const district = getDistrictBySlug(slug);

  if (!district) {
    notFound();
  }

  const mappedCrafts = getCraftsForDistrict(district.slug);

  return (
    <>
      <Header />
      <main className={styles.main} id="main-content">
        <div className="container">
          <header className={styles.hero}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumbs">
              <Link href="/">Home</Link> &gt; <Link href="/districts">Districts</Link> &gt;{' '}
              <span>{district.name}</span>
            </nav>

            <div className={styles.badgeRow}>
              <Badge variant="district">
                <MapPin size={12} style={{ marginRight: 4 }} aria-hidden="true" />
                {district.division}
              </Badge>
              <Badge variant="status">ODOP Verified Cluster</Badge>
            </div>

            <h1 className={styles.title}>{district.name} Handicraft Heritage</h1>
            <p className={styles.overview}>{district.overview}</p>

            <div className={styles.actionRow}>
              <Link href={`/browse?district=${district.slug}`} className={styles.primaryButton}>
                Browse {district.name} Products
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a
                href={district.odopPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryButton}
              >
                Official UP ODOP Portal
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          </header>

          <section className={styles.section} aria-labelledby="crafts-heading">
            <h2 id="crafts-heading" className={styles.sectionTitle}>
              Traditional Crafts of {district.name}
            </h2>
            <p className={styles.sectionSubtitle}>
              Craft forms historically concentrated and legally associated with {district.name}{' '}
              district.
            </p>

            <div className={styles.craftsGrid}>
              {mappedCrafts.length > 0 ? (
                mappedCrafts.map(({ craft, link }) => (
                  <article key={craft.slug} className={styles.craftCard}>
                    <div className={styles.craftCardTop}>
                      <div>
                        <h3 className={styles.craftName}>{craft.name}</h3>
                        <Badge variant="category">{craft.category.replace('_', ' ')}</Badge>
                      </div>
                      {craft.giRegistered && (
                        <Badge variant="gi">
                          <ShieldCheck size={12} style={{ marginRight: 3 }} aria-hidden="true" />
                          {craft.giRegistrationNumber ?? 'GI Tagged'}
                        </Badge>
                      )}
                    </div>

                    <p className={styles.craftDescription}>{craft.description}</p>

                    <div className={styles.specBlock}>
                      <div className={styles.specRow}>
                        <span className={styles.specLabel}>Hub Status:</span>
                        <span className={styles.specValue}>
                          {link.associationType === 'primary_traditional_hub'
                            ? 'Primary Traditional Hub'
                            : 'Regional Secondary Cluster'}
                        </span>
                      </div>
                      <div className={styles.specRow}>
                        <span className={styles.specLabel}>Techniques:</span>
                        <span className={styles.specValue}>
                          {craft.standardTechniques.slice(0, 3).join(', ')}
                        </span>
                      </div>
                      <div className={styles.specRow}>
                        <span className={styles.specLabel}>Materials:</span>
                        <span className={styles.specValue}>
                          {craft.typicalMaterials.slice(0, 3).join(', ')}
                        </span>
                      </div>
                    </div>

                    <div className={styles.provenanceBox}>
                      <strong>Data Provenance:</strong> {link.sourceCitation}
                    </div>

                    <div className={styles.craftFooter}>
                      <Link href={`/crafts/${craft.slug}`} className={styles.craftLink}>
                        View Craft Guide &rarr;
                      </Link>
                      <Link
                        href={`/browse?craft=${craft.slug}&district=${district.slug}`}
                        className={styles.craftLink}
                      >
                        Shop this craft &rarr;
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <div className={styles.craftCard}>
                  <div className={styles.craftCardTop}>
                    <h3 className={styles.craftName}>ODOP Priority Craft Products</h3>
                  </div>
                  <p className={styles.craftDescription}>
                    Products recognized under ODOP: {district.odopFocalCrafts.join(', ')}.
                  </p>
                  <p className={styles.provenanceBox}>
                    Verified on official UP ODOP portal:{' '}
                    <a
                      href={district.odopPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {district.odopPortalUrl}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

