import { create } from 'zustand';
import type { Product } from '@craftsure/shared-types';

export interface CartItem {
  readonly product: Product;
  readonly quantity: number;
}

interface CartStore {
  readonly items: CartItem[];
  readonly wishlistIds: string[];
  readonly addItem: (product: Product, quantity?: number) => void;
  readonly removeItem: (productId: string) => void;
  readonly updateQuantity: (productId: string, quantity: number) => void;
  readonly clearCart: () => void;
  readonly toggleWishlist: (productId: string) => void;
  readonly isWishlisted: (productId: string) => boolean;

  // Computed values
  readonly totalItems: () => number;
  readonly subtotalPaise: () => number;
  readonly deliveryPaise: () => number;
  readonly grandTotalPaise: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  wishlistIds: [],

  addItem: (product: Product, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((item) => item.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          ),
        };
      }
      return {
        items: [...state.items, { product, quantity }],
      };
    });
  },

  removeItem: (productId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  toggleWishlist: (productId: string) => {
    set((state) => {
      const exists = state.wishlistIds.includes(productId);
      return {
        wishlistIds: exists
          ? state.wishlistIds.filter((id) => id !== productId)
          : [...state.wishlistIds, productId],
      };
    });
  },

  isWishlisted: (productId: string) => {
    return get().wishlistIds.includes(productId);
  },

  totalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  subtotalPaise: () => {
    return get().items.reduce((sum, item) => sum + item.product.priceInPaise * item.quantity, 0);
  },

  deliveryPaise: () => {
    const subtotal = get().subtotalPaise();
    if (subtotal === 0) return 0;
    // Free delivery above ₹2,000 (200,000 paise), else ₹120 (12,000 paise)
    return subtotal >= 200000 ? 0 : 12000;
  },

  grandTotalPaise: () => {
    return get().subtotalPaise() + get().deliveryPaise();
  },
}));

