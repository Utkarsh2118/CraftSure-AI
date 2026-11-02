'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ShieldCheck, Check } from 'lucide-react';
import { Header } from '@/components/layout/Header/Header';
import { Badge } from '@/components/ui/Badge/Badge';
import { DISTRICTS, filterProducts } from '@/lib/data/catalogue';
import { formatPaise } from '@/lib/utils/currency';
import { useCartStore } from '@/lib/store/cart';
import type { CraftCategory } from '@craftsure/shared-types';
import styles from './page.module.css';

const CATEGORY_OPTIONS: { label: string; value: CraftCategory | 'all' }[] = [
  { label: 'All Categories', value: 'all' },
  { label: 'Textiles & Handloom', value: 'textiles_handloom' },
  { label: 'Metal & Glass', value: 'metal_glass' },
  { label: 'Woodwork', value: 'woodwork' },
  { label: 'Pottery & Ceramics', value: 'pottery_ceramics' },
  { label: 'Stone Inlay', value: 'stone_inlay' },
  { label: 'Natural Fibre', value: 'natural_fibre' },
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const initialDistrict = searchParams.get('district') ?? 'all';
  const initialCraft = searchParams.get('craft') ?? '';
  const initialCategory = (searchParams.get('category') as CraftCategory) ?? 'all';

  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [selectedCategory, setSelectedCategory] = useState<CraftCategory | 'all'>(initialCategory);
  const [giOnly, setGiOnly] = useState(false);
  const [sortOption, setSortOption] = useState('latest');
  const [addedId, setAddedId] = useState<string | null>(null);

  const addItemToCart = useCartStore((state) => state.addItem);

  const filteredProducts = useMemo(() => {
    return filterProducts({
      district: selectedDistrict === 'all' ? undefined : selectedDistrict,
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      craft: initialCraft || undefined,
      giCertifiedOnly: giOnly,
      sort: sortOption,
    });
  }, [selectedDistrict, selectedCategory, initialCraft, giOnly, sortOption]);

  const handleAddToCart = (product: (typeof filteredProducts)[0]) => {
    addItemToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => {
      setAddedId(null);
    }, 1500);
  };

  return (
    <div className="container">
      <header className={styles.header}>
        <h1 className={styles.title}>Uttar Pradesh Handicrafts Marketplace</h1>
        <p className={styles.subtitle}>
          Directly sourced from verified master craftspeople, weaving societies, and artisan guilds.
        </p>
      </header>

      <div className={styles.layout}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar} aria-label="Filters">
          <div className={styles.filterHeading}>
            <span>Filter Catalogue</span>
            {(selectedDistrict !== 'all' || selectedCategory !== 'all' || giOnly) && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={() => {
                  setSelectedDistrict('all');
                  setSelectedCategory('all');
                  setGiOnly(false);
                }}
              >
                Reset All
              </button>
            )}
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="district-select" className={styles.filterLabel}>
              Origin District
            </label>
            <select
              id="district-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className={styles.select}
            >
              <option value="all">All UP Districts (20)</option>
              {DISTRICTS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name} ({d.division.replace(' Division', '')})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="category-select" className={styles.filterLabel}>
              Craft Domain
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CraftCategory | 'all')}
              className={styles.select}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Statutory Protection</span>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={giOnly}
                onChange={(e) => setGiOnly(e.target.checked)}
              />
              <ShieldCheck size={16} aria-hidden="true" />
              Verified GI Items Only
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main>
          <div className={styles.topBar}>
            <span className={styles.resultCount}>
              Showing <strong>{filteredProducts.length}</strong> authentic handcrafted items
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <label htmlFor="sort-select" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Sort by:
              </label>
              <select
                id="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="latest">Latest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className={styles.grid}>
            {filteredProducts.map((product) => (
              <article key={product.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  {product.images[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].altText}
                      className={styles.cardImage}
                      loading="lazy"
                    />
                  ) : null}
                  <div className={styles.badgeOverlay}>
                    {product.originDistrict && (
                      <Badge variant="district">{product.originDistrict}</Badge>
                    )}
                    {product.isGiCraftItem && (
                      <Badge variant="gi">GI Verified</Badge>
                    )}
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <span className={styles.artisanName}>{product.artisanShopName}</span>
                  <h2 className={styles.cardTitle}>
                    <Link href={`/products/${product.id}`}>{product.title}</Link>
                  </h2>
                  <p className={styles.cardDesc}>{product.description}</p>

                  <div className={styles.priceRow}>
                    <span className={styles.price}>{formatPaise(product.priceInPaise)}</span>
                    <button
                      type="button"
                      className={styles.addToCartBtn}
                      onClick={() => handleAddToCart(product)}
                      aria-label={`Add ${product.title} to cart`}
                    >
                      {addedId === product.id ? (
                        <>
                          <Check size={14} aria-hidden="true" /> Added
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={14} aria-hidden="true" /> Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <>
      <Header />
      <div className={styles.main} id="main-content">
        <Suspense fallback={<div className="container" style={{ padding: '2rem 0' }}>Loading catalogue...</div>}>
          <BrowseContent />
        </Suspense>
      </div>
    </>
  );
}

