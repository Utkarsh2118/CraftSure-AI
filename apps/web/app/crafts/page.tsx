'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ShieldCheck, ArrowUpRight, Sparkles, X } from 'lucide-react';
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
      const matchesCategory =
        selectedCategory === 'all' || c.category === selectedCategory;

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

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setGiOnly(false);
  };

  return (
    <>
      <Header />

      <main className={styles.main} id="main-content">
        <div className="container">

          {/* HERO */}
          <section className={styles.hero}>
            <div className={styles.heroDecoration}>
              <span className={styles.decorCircle}></span>
              <span className={styles.decorCircleSmall}></span>
              <span className={styles.decorLine}></span>
            </div>

            <nav className={styles.breadcrumbs} aria-label="Breadcrumbs">
              <Link href="/">Home</Link>
              <span>/</span>
              <span>Crafts</span>
            </nav>

            <div className={styles.heroContent}>
              <div className={styles.eyebrow}>
                <Sparkles size={15} />
                <span>THE HERITAGE COLLECTION</span>
              </div>

              <h1 className={styles.title}>
                Artistry woven into
                <span> every tradition.</span>
              </h1>

              <p className={styles.subtitle}>
                Explore the timeless crafts of Uttar Pradesh, shaped by generations
                of artisans, rich cultural traditions and extraordinary skill.
              </p>

              <div className={styles.heroStats}>
                <div className={styles.stat}>
                  <strong>{CRAFTS.length}</strong>
                  <span>Craft traditions</span>
                </div>

                <div className={styles.statDivider}></div>

                <div className={styles.stat}>
                  <strong>{CRAFTS.filter((c) => c.giRegistered).length}</strong>
                  <span>GI recognised crafts</span>
                </div>

                <div className={styles.statDivider}></div>

                <div className={styles.stat}>
                  <strong>UP</strong>
                  <span>Rooted in heritage</span>
                </div>
              </div>
            </div>

            <div className={styles.heroArtwork}>
              <div className={styles.artworkOuter}>
                <div className={styles.artworkInner}>
                  <div className={styles.artworkPattern}>
                    <div className={styles.patternFlower}>✿</div>
                    <div className={styles.patternDiamond}>✧</div>
                    <div className={styles.patternFlowerBottom}>❋</div>
                  </div>

                  <div className={styles.artworkCenter}>
                    <span className={styles.centerSymbol}>✳</span>
                    <span className={styles.centerText}>CRAFTED</span>
                    <span className={styles.centerText}>WITH SOUL</span>
                  </div>
                </div>
              </div>

              <div className={styles.artworkCaption}>
                <span className={styles.captionLine}></span>
                <span>Tradition · Art · Identity</span>
                <span className={styles.captionLine}></span>
              </div>
            </div>
          </section>

          {/* SEARCH & FILTER */}
          <section className={styles.exploreSection}>
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.sectionEyebrow}>DISCOVER</span>
                <h2>Explore the crafts</h2>
              </div>

              <span className={styles.resultCount}>
                {filteredCrafts.length} {filteredCrafts.length === 1 ? 'craft' : 'crafts'}
              </span>
            </div>

            <div className={styles.filterPanel}>
              <div className={styles.searchBox}>
                <Search size={19} className={styles.searchIcon} />

                <input
                  type="text"
                  placeholder="Search crafts, techniques or materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  aria-label="Search crafts"
                />

                {searchQuery && (
                  <button
                    type="button"
                    className={styles.clearSearch}
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className={styles.filterBottom}>
                <div className={styles.categoryArea}>
                  <span className={styles.filterLabel}>CATEGORY</span>

                  <div className={styles.categoryPills}>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        className={`${styles.pillButton} ${
                          selectedCategory === cat.value ? styles.activePill : ''
                        }`}
                        onClick={() => setSelectedCategory(cat.value)}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className={styles.giToggle}>
                  <input
                    type="checkbox"
                    checked={giOnly}
                    onChange={(e) => setGiOnly(e.target.checked)}
                  />

                  <span className={styles.toggleVisual}></span>

                  <ShieldCheck size={17} />

                  <span>GI Registered</span>
                </label>
              </div>
            </div>
          </section>

          {/* CRAFT CARDS */}
          <section className={styles.directory} aria-label="Crafts Directory">
            {filteredCrafts.length > 0 ? (
              <div className={styles.grid}>
                {filteredCrafts.map((craft, index) => {
                  const links = CRAFT_DISTRICT_LINKS.filter(
                    (l) => l.craftSlug === craft.slug,
                  );

                  const primaryDistrict = DISTRICTS.find(
                    (d) => d.slug === links[0]?.districtSlug,
                  );

                  return (
                    <article key={craft.slug} className={styles.card}>
                      <div className={styles.cardTop}>
                        <div className={styles.cardNumber}>
                          {String(index + 1).padStart(2, '0')}
                        </div>

                        {craft.giRegistered && (
                          <div className={styles.giBadge}>
                            <ShieldCheck size={13} />
                            GI REGISTERED
                          </div>
                        )}
                      </div>

                      <div className={styles.cardArtwork}>
                        <div className={styles.artworkRing}>
                          <span className={styles.artworkIcon}>
                            {['✿', '❋', '✧', '❈', '✳', '❉'][index % 6]}
                          </span>
                        </div>

                        <span className={styles.artworkSideText}>
                          UTTAR PRADESH
                        </span>
                      </div>

                      <div className={styles.cardBody}>
                        <h3 className={styles.craftName}>{craft.name}</h3>

                        <p className={styles.cardDesc}>{craft.description}</p>

                        {primaryDistrict && (
                          <div className={styles.hubInfo}>
                            <span className={styles.hubLabel}>CRAFT HUB</span>
                            <span className={styles.hubName}>
                              {primaryDistrict.name}
                            </span>
                          </div>
                        )}

                        <div className={styles.techniqueSection}>
                          <span className={styles.techniqueLabel}>
                            SIGNATURE TECHNIQUES
                          </span>

                          <div className={styles.techniquePills}>
                            {craft.standardTechniques.slice(0, 3).map((tech) => (
                              <Badge key={tech} variant="technique">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className={styles.cardFooter}>
                          <Link
                            href={`/crafts/${craft.slug}`}
                            className={styles.guideLink}
                          >
                            Explore craft
                            <ArrowUpRight size={17} />
                          </Link>

                          <Link
                            href={`/browse?craft=${craft.slug}`}
                            className={styles.shopLink}
                          >
                            Shop
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <Search size={28} />
                </div>

                <h3>No crafts found</h3>

                <p>
                  We couldn&apos;t find any crafts matching your search.
                  Try a different keyword or category.
                </p>

                <button
                  type="button"
                  className={styles.resetButton}
                  onClick={resetFilters}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>

          {/* BOTTOM CTA */}
          <section className={styles.bottomBanner}>
            <div className={styles.bannerDecoration}>✳</div>

            <div className={styles.bannerContent}>
              <span className={styles.bannerEyebrow}>BEYOND THE CRAFT</span>

              <h2>Discover the places behind every masterpiece.</h2>

              <p>
                Meet the districts, communities and artisan traditions that
                make Uttar Pradesh&apos;s heritage truly extraordinary.
              </p>

              <Link href="/districts" className={styles.bannerButton}>
                Explore craft districts
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}

