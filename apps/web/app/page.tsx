import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { Header } from '@/components/layout/Header/Header';
import { Badge } from '@/components/ui/Badge/Badge';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'CraftSure AI — Authentic Uttar Pradesh Handicrafts, Handloom & Art',
};

const PILOT_CRAFTS = [
  {
    name: 'Lucknow Chikankari',
    district: 'Lucknow',
    category: 'Handloom & Textiles',
    giTagged: true,
    description: 'Delicate hand embroidery with shadow work, murri knots, and openwork jaali.',
    link: '/crafts/lucknow-chikankari',
  },
  {
    name: 'Banarasi Silk & Brocade',
    district: 'Varanasi',
    category: 'Handloom & Textiles',
    giTagged: true,
    description: 'Pure Katan silk woven on pit looms with metallic golden and silver zari brocade.',
    link: '/crafts/banarasi-silk',
  },
  {
    name: 'Moradabad Metal Craft',
    district: 'Moradabad',
    category: 'Metal & Glass',
    giTagged: true,
    description: 'Sand-cast and hand-engraved brassware featuring traditional Naqqaashi chasing.',
    link: '/crafts/moradabad-brassware',
  },
  {
    name: 'Gorakhpur Terracotta',
    district: 'Gorakhpur',
    category: 'Pottery & Ceramics',
    giTagged: true,
    description:
      'Natural red earthenware clay animal sculptures and bells hand-modeled without molds.',
    link: '/crafts/gorakhpur-terracotta',
  },
  {
    name: 'Saharanpur Wood Carving',
    district: 'Saharanpur',
    category: 'Woodwork',
    giTagged: true,
    description: 'Fine Sheesham wood carving featuring deep floral reliefs and lattice jali work.',
    link: '/crafts/saharanpur-wood-carving',
  },
  {
    name: 'Nizamabad Black Pottery',
    district: 'Azamgarh',
    category: 'Pottery & Ceramics',
    giTagged: true,
    description: 'Smoked black clay pottery with engraved zinc-mercury silver inlays.',
    link: '/crafts/nizamabad-black-pottery',
  },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className={styles.main} id="main-content">
        <div className="container">
          {/* Hero Section */}
          <section className={styles.hero} aria-labelledby="hero-heading">
            <div className={styles.heroBadgeWrapper}>
              <Badge variant="district">
                <MapPin size={12} aria-hidden="true" style={{ marginRight: 4 }} />
                Statewide Uttar Pradesh
              </Badge>
              <Badge variant="gi">
                <ShieldCheck size={12} aria-hidden="true" style={{ marginRight: 4 }} />
                ODOP & GI Sourced
              </Badge>
            </div>

            <h1 id="hero-heading" className={styles.heroTitle}>
              Discover authentic <span className={styles.heroAccent}>Uttar Pradesh Crafts</span>
            </h1>
            <p className={styles.heroDescription}>
              Connect directly with verified independent master craftspeople and weaving societies
              across UP districts — each creation made with generational technique, transparent
              materials, and verifiable provenance.
            </p>

            <div className={styles.heroActions}>
              <Link href="/browse" className={styles.primaryButton}>
                Explore Regional Catalogue
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/districts" className={styles.secondaryButton}>
                Browse by District
              </Link>
            </div>
          </section>

          {/* Featured Crafts Grid */}
          <section className={styles.featuredSection} aria-labelledby="featured-heading">
            <div className={styles.sectionHeader}>
              <div>
                <h2 id="featured-heading" className={styles.sectionTitle}>
                  Signature Uttar Pradesh Crafts
                </h2>
                <p className={styles.sectionSubtitle}>
                  Recognized under the One District One Product (ODOP) initiative and Geographical
                  Indications Registry.
                </p>
              </div>
              <Link href="/crafts" className={styles.viewAllLink}>
                View all crafts &rarr;
              </Link>
            </div>

            <div className={styles.craftsGrid}>
              {PILOT_CRAFTS.map((craft) => (
                <article key={craft.name} className={styles.craftCard}>
                  <div className={styles.cardHeader}>
                    <Badge variant="district">{craft.district}</Badge>
                    {craft.giTagged && <Badge variant="gi">GI Tagged</Badge>}
                  </div>
                  <h3 className={styles.craftName}>{craft.name}</h3>
                  <p className={styles.craftCategory}>{craft.category}</p>
                  <p className={styles.craftDescription}>{craft.description}</p>
                  <Link href={craft.link} className={styles.cardLink}>
                    Discover Craft &rarr;
                  </Link>
                </article>
              ))}
            </div>
          </section>

          {/* Verification Assurance */}
          <section className={styles.assuranceSection}>
            <div className={styles.assuranceCard}>
              <ShieldCheck size={32} className={styles.assuranceIcon} aria-hidden="true" />
              <div>
                <h3 className={styles.assuranceTitle}>Truth in Craft Provenance</h3>
                <p className={styles.assuranceText}>
                  CraftSure AI enforces statutory verification. GI badges require
                  government-authorized user certificates audited by administrators. No synthetic
                  badges, no inferred origins.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
