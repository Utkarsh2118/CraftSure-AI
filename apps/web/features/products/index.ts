/**
 * Products Feature Module
 *
 * Exposes product catalogue utilities, query helpers, and the ProductActions client component.
 */

export { ProductActions } from './ProductActions';
export type { ProductActionsProps } from './ProductActions';
export {
  PRODUCTS,
  getProductById,
  filterProducts,
} from '@/lib/data/catalogue';
export { api, apiClient } from '@/lib/api/client';
