import { describe, it, expect } from 'vitest';
import { formatPaise, rupeesToPaise, paiseToRupees } from './currency';

describe('currency utilities', () => {
  describe('formatPaise', () => {
    it('formats paise into INR currency representation', () => {
      // 49900 paise = 499 INR
      const formatted = formatPaise(49900);
      expect(formatted).toMatch(/₹\s?499/);
    });

    it('formats large numbers with Indian numbering commas', () => {
      const formatted = formatPaise(149900);
      expect(formatted).toMatch(/₹\s?1,499/);
    });

    it('handles zero paise', () => {
      const formatted = formatPaise(0);
      expect(formatted).toMatch(/₹\s?0/);
    });

    it('handles rounding floating paise', () => {
      const formatted = formatPaise(49999.6);
      expect(formatted).toMatch(/₹\s?500/);
    });
  });

  describe('rupeesToPaise', () => {
    it('converts integer rupees to paise', () => {
      expect(rupeesToPaise(100)).toBe(10000);
    });

    it('converts float rupees to integer paise accurately', () => {
      expect(rupeesToPaise(499.5)).toBe(49950);
      expect(rupeesToPaise(19.99)).toBe(1999);
    });
  });

  describe('paiseToRupees', () => {
    it('converts integer paise to rupees', () => {
      expect(paiseToRupees(49900)).toBe(499);
      expect(paiseToRupees(150)).toBe(1.5);
    });
  });
});
