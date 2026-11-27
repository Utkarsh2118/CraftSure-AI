/**
 * Orders Feature Module
 *
 * Exposes order creation, retrieval, and currency formatting helpers.
 */

export { api, apiClient } from '@/lib/api/client';
export type { CreateOrderInput } from '@/lib/api/client';
export { formatPaise, rupeesToPaise, paiseToRupees } from '@/lib/utils/currency';
