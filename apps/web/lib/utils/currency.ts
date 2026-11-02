/**
 * Currency utilities
 *
 * All monetary values are stored as integer paise.
 * These functions handle conversion and display formatting.
 * Never perform arithmetic on formatted strings — always use paise integers.
 */

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format an integer paise value as a human-readable INR string.
 * @example formatPaise(49900) // "₹499"
 * @example formatPaise(149900) // "₹1,499"
 */
export function formatPaise(paise: number): string {
  const rupees = Math.round(paise) / 100;
  return INR_FORMATTER.format(rupees);
}

/**
 * Convert a rupee float to integer paise.
 * Use only at input boundaries (e.g., parsing form input).
 * @example rupeesToPaise(499.5) // 49950
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees as a number (for calculations).
 * @example paiseToRupees(49900) // 499
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}
