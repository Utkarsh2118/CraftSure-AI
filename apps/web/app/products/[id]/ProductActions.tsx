'use client';

import { useState } from 'react';
import { ShoppingBag, Heart, Check } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import type { Product } from '@craftsure/shared-types';
import styles from './page.module.css';

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const isWishlisted = useCartStore((state) => state.isWishlisted(product.id));

  const handleAddToCart = () => {
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className={styles.actions}>
      <div className={styles.quantitySelector} aria-label="Select quantity">
        <button
          type="button"
          className={styles.quantityBtn}
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span className={styles.quantityValue} aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          className={styles.quantityBtn}
          onClick={() => setQuantity((q) => Math.min(product.stockCount, q + 1))}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <button
        type="button"
        className={styles.addToCartBtn}
        onClick={handleAddToCart}
        aria-label={`Add ${quantity} of ${product.title} to cart`}
      >
        {isAdded ? (
          <>
            <Check size={18} aria-hidden="true" />
            Added to Cart!
          </>
        ) : (
          <>
            <ShoppingBag size={18} aria-hidden="true" />
            Add to Cart
          </>
        )}
      </button>

      <button
        type="button"
        className={styles.wishlistBtn}
        onClick={() => toggleWishlist(product.id)}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        style={{ color: isWishlisted ? 'var(--color-primary)' : undefined }}
      >
        <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} aria-hidden="true" />
      </button>
    </div>
  );
}

