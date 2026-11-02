'use client';

import Link from 'next/link';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Header } from '@/components/layout/Header/Header';
import { useCartStore } from '@/lib/store/cart';
import { formatPaise } from '@/lib/utils/currency';
import styles from './page.module.css';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotalPaise = useCartStore((state) => state.subtotalPaise());
  const deliveryPaise = useCartStore((state) => state.deliveryPaise());
  const grandTotalPaise = useCartStore((state) => state.grandTotalPaise());

  return (
    <>
      <Header />
      <main className={styles.main} id="main-content">
        <div className="container">
          <header className={styles.header}>
            <h1 className={styles.title}>Your Shopping Cart</h1>
          </header>

          {items.length === 0 ? (
            <div className={styles.emptyBox}>
              <ShoppingBag size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }} aria-hidden="true" />
              <h2 className={styles.emptyTitle}>Your cart is currently empty</h2>
              <p className={styles.emptyDesc}>
                Explore authentic handicrafts and textiles directly from master artisans across Uttar Pradesh.
              </p>
              <Link href="/browse" className={styles.shopLink}>
                Explore Regional Catalogue
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className={styles.layout}>
              {/* Items List */}
              <div className={styles.itemsList}>
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className={styles.cartItem}>
                    <img
                      src={product.images[0]?.url}
                      alt={product.images[0]?.altText ?? product.title}
                      className={styles.itemImage}
                    />
                    <div className={styles.itemInfo}>
                      <span className={styles.itemArtisan}>{product.artisanShopName}</span>
                      <Link href={`/products/${product.id}`} className={styles.itemTitle}>
                        {product.title}
                      </Link>
                      <span className={styles.itemPrice}>{formatPaise(product.priceInPaise)}</span>
                    </div>

                    <div className={styles.quantityControls}>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className={styles.qtyValue}>{quantity}</span>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeItem(product.id)}
                      aria-label={`Remove ${product.title} from cart`}
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Order Summary</h2>

                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>{formatPaise(subtotalPaise)}</span>
                </div>

                <div className={styles.summaryRow}>
                  <span>Estimated Delivery</span>
                  <span>{deliveryPaise === 0 ? 'FREE' : formatPaise(deliveryPaise)}</span>
                </div>

                <div className={styles.summaryTotal}>
                  <span>Grand Total</span>
                  <span>{formatPaise(grandTotalPaise)}</span>
                </div>

                <Link href="/checkout" className={styles.checkoutBtn}>
                  Proceed to Demo Checkout
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

