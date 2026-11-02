'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, ExternalLink } from 'lucide-react';
import { Header } from '@/components/layout/Header/Header';
import { Badge } from '@/components/ui/Badge/Badge';
import { DISTRICTS } from '@/lib/data/catalogue';
import styles from './page.module.css';

export default function DistrictsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('all');

  const divisions = useMemo(() => {
    const set = new Set<string>();
    for (const d of DISTRICTS) {
      set.add(d.division);
    }
    return ['all', ...Array.from(set).sort()];
  }, []);

  const filteredDistricts = useMemo(() => {
    return DISTRICTS.filter((d) => {
      const matchesDivision =
        selectedDivision === 'all' || d.division.toLowerCase() === selectedDivision.toLowerCase();
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        d.name.toLowerCase().includes(query) ||
        d.division.toLowerCase().includes(query) ||
        d.overview.toLowerCase().includes(query) ||
        d.odopFocalCrafts.some((craft) => craft.toLowerCase().includes(query));
      return matchesDivision && matchesSearch;
    });
  }, [searchQuery, selectedDivision]);

  return (
    <>
      <Header />
      <main className={styles.main} id="main-content">
        <div className="container">
          <header className={styles.header}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumbs">
              <Link href="/">Home</Link> &gt; <span>Districts</span>
            </nav>
            <h1 className={styles.title}>Uttar Pradesh Craft Districts</h1>
            <p className={styles.subtitle}>
              Explore 20 traditional artisanal hubs across UP. Each district has deep generational
              heritage recognized under the Uttar Pradesh One District One Product (ODOP) program.
            </p>
          </header>

          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search district or craft..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                aria-label="Search district or craft"
              />
            </div>

            <div className={styles.divisionTabs} role="tablist" aria-label="Filter by division">
              {divisions.map((division) => (
                <button
                  key={division}
                  type="button"
                  role="tab"
                  aria-selected={selectedDivision === division}
                  className={`${styles.tabButton} ${selectedDivision === division ? styles.activeTab : ''}`}
                  onClick={() => setSelectedDivision(division)}
                >
                  {division === 'all' ? 'All Divisions' : division.replace(' Division', '')}
                </button>
              ))}
            </div>
          </div>

          <section aria-label="Districts Directory">
            <div className={styles.grid}>
              {filteredDistricts.map((district) => (
                <article key={district.slug} className={styles.card}>
                  <div className={styles.cardTop}>
                    <h2 className={styles.districtName}>{district.name}</h2>
                    <Badge variant="district">
                      <MapPin size={10} style={{ marginRight: 3 }} aria-hidden="true" />
                      {district.division.replace(' Division', '')}
                    </Badge>
                  </div>

                  <p className={styles.cardOverview}>{district.overview}</p>

                  <div className={styles.craftsSection}>
                    <span className={styles.craftsLabel}>ODOP Focal Crafts</span>
                    <div className={styles.craftPills}>
                      {district.odopFocalCrafts.map((craftName) => (
                        <Badge key={craftName} variant="craft">
                          {craftName}
                        </Badge>
                      ))}
                    </div>

                    <div className={styles.cardFooter}>
                      <Link href={`/districts/${district.slug}`} className={styles.cardLink}>
                        Explore District Crafts
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                      <a
                        href={district.odopPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.odopBadge}
                        title="View official ODOP district entry"
                      >
                        ODOP Ref <ExternalLink size={10} aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

