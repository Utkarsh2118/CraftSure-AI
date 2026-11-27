/**
 * Crafts Feature Module
 *
 * Exposes UP ODOP craft catalogue definitions, retrieval helpers,
 * and category filtering logic.
 */

export {
  CRAFTS,
  getCraftBySlug,
  getCraftsForDistrict,
  getDistrictsForCraft,
} from '@/lib/data/catalogue';

export { api, apiClient } from '@/lib/api/client';
