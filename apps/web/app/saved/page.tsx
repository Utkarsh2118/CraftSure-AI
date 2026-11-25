'use client';

import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header/Header';
import { useCartStore } from '@/lib/store/cart';
import { PRODUCTS } from '@/lib/data/catalogue';
import { formatPaise } from '@/lib/utils/currency';
import styles from './page.module.css';

export default function SavedItemsPage() {
  const wishlistIds = useCartStore((state) => state.wishlistIds);
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const addItem = useCartStore((state) => state.addItem);

  const savedProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  return (
    <>
      <Header />
      <main className={styles.main} id="main-content">
        <div className="container">
          <header className={styles.header}>
            <h1 className={styles.title}>Your Saved Craft Items</h1>
            <p className={styles.subtitle}>
              Keep track of verified artisan creations from across Uttar Pradesh.
            </p>
          </header>

          {savedProducts.length === 0 ? (
            <div className={styles.emptyBox}>
              <Heart size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }} />
              <h2 className={styles.emptyTitle}>You haven&apos;t saved any items yet</h2>
              <p className={styles.emptyDesc}>
                Browse our regional handicraft catalogue and click the heart icon on any piece to save it for later.
              </p>
              <Link href="/browse" className={styles.browseLink}>
                Explore Regional Catalogue <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {savedProducts.map((product) => (
                <div key={product.id} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    <img
                      src={product.images[0]?.url}
                      alt={product.images[0]?.altText ?? product.title}
                      className={styles.image}
                    />
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => toggleWishlist(product.id)}
                      aria-label={`Remove ${product.title} from saved items`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className={styles.cardContent}>
                    <span className={styles.artisan}>{product.artisanShopName}</span>
                    <Link href={`/products/${product.id}`} className={styles.productTitle}>
                      {product.title}
                    </Link>
                    <div className={styles.bottomRow}>
                      <span className={styles.price}>{formatPaise(product.priceInPaise)}</span>
                      <button
                        type="button"
                        className={styles.addToCartBtn}
                        onClick={() => addItem(product, 1)}
                        aria-label={`Add ${product.title} to cart`}
                      >
                        <ShoppingBag size={16} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
