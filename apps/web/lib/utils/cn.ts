import { clsx, type ClassValue } from 'clsx';

/**
 * Combines class names, filtering falsy values.
 * Thin wrapper around clsx — keeps components clean.
 *
 * @example cn('base', isActive && 'active', styles.button)
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}
