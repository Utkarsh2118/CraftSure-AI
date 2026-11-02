import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cart';
import { PRODUCTS } from '@/lib/data/catalogue';

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('initializes with empty cart and wishlist', () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.wishlistIds).toEqual([]);
    expect(state.totalItems()).toBe(0);
    expect(state.subtotalPaise()).toBe(0);
    expect(state.deliveryPaise()).toBe(0);
    expect(state.grandTotalPaise()).toBe(0);
  });

  it('adds items with integer paise accounting', () => {
    const product = PRODUCTS[0]!;
    expect(product).toBeDefined();

    useCartStore.getState().addItem(product, 2);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0]?.quantity).toBe(2);
    expect(state.totalItems()).toBe(2);

    const expectedSubtotal = product.priceInPaise * 2;
    expect(state.subtotalPaise()).toBe(expectedSubtotal);
    // Subtotal >= 200,000 paise (₹2,000) qualifies for free delivery
    expect(state.deliveryPaise()).toBe(0);
    expect(state.grandTotalPaise()).toBe(expectedSubtotal);
  });

  it('calculates delivery fee for orders below threshold', () => {
    const terracottaProduct = PRODUCTS.find((p) => p.priceInPaise < 200000)!;
    expect(terracottaProduct).toBeDefined();

    useCartStore.getState().addItem(terracottaProduct, 1);

    const state = useCartStore.getState();
    expect(state.subtotalPaise()).toBe(terracottaProduct.priceInPaise);
    expect(state.deliveryPaise()).toBe(12000); // ₹120
    expect(state.grandTotalPaise()).toBe(terracottaProduct.priceInPaise + 12000);
  });

  it('updates quantity and removes item on zero quantity', () => {
    const product = PRODUCTS[0]!;
    useCartStore.getState().addItem(product, 3);
    useCartStore.getState().updateQuantity(product.id, 5);

    expect(useCartStore.getState().items[0]?.quantity).toBe(5);

    useCartStore.getState().updateQuantity(product.id, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('toggles wishlist items correctly', () => {
    const productId = 'prod-test-01';
    expect(useCartStore.getState().isWishlisted(productId)).toBe(false);

    useCartStore.getState().toggleWishlist(productId);
    expect(useCartStore.getState().isWishlisted(productId)).toBe(true);

    useCartStore.getState().toggleWishlist(productId);
    expect(useCartStore.getState().isWishlisted(productId)).toBe(false);
  });
});

