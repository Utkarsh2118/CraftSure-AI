import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, MapPin, Award } from 'lucide-react';
import { Header } from '@/components/layout/Header/Header';
import { Badge } from '@/components/ui/Badge/Badge';
import { PRODUCTS, getProductById } from '@/lib/data/catalogue';
import { formatPaise } from '@/lib/utils/currency';
import { ProductActions } from './ProductActions';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({
    id: p.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return { title: 'Product Not Found | CraftSure AI' };

  return {
    title: `${product.title} | Authentic UP Crafts | CraftSure AI`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const primaryImage = product.images[0];

  return (
    <>
      <Header />
      <main className={styles.main} id="main-content">
        <div className="container">
          <nav className={styles.breadcrumbs} aria-label="Breadcrumbs">
            <Link href="/">Home</Link> &gt; <Link href="/browse">Browse</Link> &gt;{' '}
            {product.originDistrict && (
              <>
                <Link href={`/browse?district=${product.originDistrict.toLowerCase()}`}>
                  {product.originDistrict}
                </Link>{' '}
                &gt;{' '}
              </>
            )}
            <span>{product.title}</span>
          </nav>

          <div className={styles.productLayout}>
            {/* Gallery */}
            <div className={styles.gallery}>
              <div className={styles.mainImageWrapper}>
                {primaryImage && (
                  <img
                    src={primaryImage.url}
                    alt={primaryImage.altText}
                    className={styles.mainImage}
                  />
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className={styles.details}>
              <div className={styles.badgeRow}>
                {product.originDistrict && (
                  <Badge variant="district">
                    <MapPin size={10} style={{ marginRight: 3 }} aria-hidden="true" />
                    {product.originDistrict}
                  </Badge>
                )}
                {product.category && (
                  <Badge variant="category">{product.category.replace('_', ' ')}</Badge>
                )}
                {product.isGiCraftItem && (
                  <Badge variant="gi">
                    <ShieldCheck size={10} style={{ marginRight: 3 }} aria-hidden="true" />
                    Statutory GI Verified
                  </Badge>
                )}
              </div>

              <span className={styles.artisanLink}>
                Artisan Guild: <strong>{product.artisanShopName}</strong>
              </span>

              <h1 className={styles.title}>{product.title}</h1>

              <div className={styles.price}>{formatPaise(product.priceInPaise)}</div>

              <p className={styles.description}>{product.description}</p>

              {/* Interactive Add to Cart & Wishlist */}
              <ProductActions product={product} />

              {/* Provenance Panel */}
              <div className={styles.provenancePanel}>
                <div className={styles.provenanceHeader}>
                  <Award size={20} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                  <span>Truth in Craft Provenance</span>
                </div>

                <div className={styles.provenanceList}>
                  <div className={styles.provenanceItem}>
                    <span className={styles.provenanceKey}>Origin Cluster:</span>
                    <span className={styles.provenanceVal}>
                      {product.originCluster}, {product.originDistrict}
                    </span>
                  </div>

                  <div className={styles.provenanceItem}>
                    <span className={styles.provenanceKey}>Verified Techniques:</span>
                    <span className={styles.provenanceVal}>{product.techniques.join(', ')}</span>
                  </div>

                  <div className={styles.provenanceItem}>
                    <span className={styles.provenanceKey}>Declared Materials:</span>
                    <span className={styles.provenanceVal}>
                      {product.materials?.join(', ') ?? product.fabric ?? 'Natural Handcrafted Materials'}
                    </span>
                  </div>

                  <div className={styles.provenanceItem}>
                    <span className={styles.provenanceKey}>GI Recognition:</span>
                    <span className={styles.provenanceVal}>
                      {product.isGiCraftItem ? 'Statutory Registered GI User' : 'Traditional Regional ODOP Art'}
                    </span>
                  </div>

                  <div className={styles.provenanceItem}>
                    <span className={styles.provenanceKey}>Artisan Attribution:</span>
                    <span className={styles.provenanceVal}>{product.attributionText}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

