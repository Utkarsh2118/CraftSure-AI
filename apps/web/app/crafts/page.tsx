'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ShieldCheck, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header/Header';
import { Badge } from '@/components/ui/Badge/Badge';
import { CRAFTS, CRAFT_DISTRICT_LINKS, DISTRICTS } from '@/lib/data/catalogue';
import styles from './page.module.css';

const CATEGORIES = [
  { label: 'All Crafts', value: 'all' },
  { label: 'Textiles & Handloom', value: 'textiles_handloom' },
  { label: 'Metal & Glass', value: 'metal_glass' },
  { label: 'Woodwork', value: 'woodwork' },
  { label: 'Pottery & Ceramics', value: 'pottery_ceramics' },
  { label: 'Stone Inlay', value: 'stone_inlay' },
  { label: 'Natural Fibre', value: 'natural_fibre' },
];

export default function CraftsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [giOnly, setGiOnly] = useState(false);

  const filteredCrafts = useMemo(() => {
    return CRAFTS.filter((c) => {
      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
      const matchesGi = !giOnly || c.giRegistered;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.standardTechniques.some((t) => t.toLowerCase().includes(query)) ||
        c.typicalMaterials.some((m) => m.toLowerCase().includes(query));

      return matchesCategory && matchesGi && matchesSearch;
    });
  }, [searchQuery, selectedCategory, giOnly]);

  return (
    <>
      <Header />
      <main className={styles.main} id="main-content">
        <div className="container">
          <header className={styles.header}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumbs">
              <Link href="/">Home</Link> &gt; <span>Crafts</span>
            </nav>
            <h1 className={styles.title}>Traditional Uttar Pradesh Crafts</h1>
            <p className={styles.subtitle}>
              Discover generational craft traditions across UP. Each craft is documented with its
              authentic techniques, primary materials, and statutory Geographical Indication (GI)
              status.
            </p>
          </header>

          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search craft, technique, material..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                aria-label="Search craft, technique, material"
              />
            </div>

            <div className={styles.filterRow}>
              <div className={styles.categoryPills} role="tablist" aria-label="Filter by category">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    role="tab"
                    aria-selected={selectedCategory === cat.value}
                    className={`${styles.pillButton} ${selectedCategory === cat.value ? styles.activePill : ''}`}
                    onClick={() => setSelectedCategory(cat.value)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <label className={styles.giToggle}>
                <input
                  type="checkbox"
                  checked={giOnly}
                  onChange={(e) => setGiOnly(e.target.checked)}
                />
                <ShieldCheck size={14} aria-hidden="true" />
                GI Tagged Only
              </label>
            </div>
          </div>

          <section aria-label="Crafts Directory">
            <div className={styles.grid}>
              {filteredCrafts.map((craft) => {
                // Find primary district
                const links = CRAFT_DISTRICT_LINKS.filter((l) => l.craftSlug === craft.slug);
                const primaryDistrict = DISTRICTS.find(
                  (d) => d.slug === links[0]?.districtSlug,
                );

                return (
                  <article key={craft.slug} className={styles.card}>
                    <div className={styles.cardTop}>
                      <h2 className={styles.craftName}>{craft.name}</h2>
                      {craft.giRegistered && (
                        <Badge variant="gi">
                          <ShieldCheck size={10} style={{ marginRight: 3 }} aria-hidden="true" />
                          {craft.giRegistrationNumber ?? 'GI Tag'}
                        </Badge>
                      )}
                    </div>

                    <p className={styles.cardDesc}>{craft.description}</p>

                    <div className={styles.metaSection}>
                      <div className={styles.techniquePills}>
                        {craft.standardTechniques.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="technique">
                            {tech}
                          </Badge>
                        ))}
                      </div>

                      {primaryDistrict && (
                        <div style={{ marginBottom: 'var(--space-3)' }}>
                          <Badge variant="district">Hub: {primaryDistrict.name}</Badge>
                        </div>
                      )}

                      <div className={styles.cardFooter}>
                        <Link href={`/crafts/${craft.slug}`} className={styles.cardLink}>
                          Craft Guide &rarr;
                        </Link>
                        <Link
                          href={`/browse?craft=${craft.slug}`}
                          className={styles.cardLink}
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          Shop Products &rarr;
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

