import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import styles from './Badge.module.css';

export type BadgeVariant = 'craft' | 'technique' | 'status' | 'gi' | 'district' | 'category';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant | undefined;
  children: ReactNode;
}

/**
 * Inline label for categorical information.
 * - 'craft': craft type (e.g., Chikankari)
 * - 'district': origin district (e.g., Varanasi, Moradabad)
 * - 'category': domain category (e.g., Textiles, Metalware)
 * - 'technique': specific craft technique
 * - 'status': product/order status
 * - 'gi': GI verification badge — only rendered when truly verified
 */
export function Badge({ variant = 'craft', children, className, ...props }: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[variant], className)} {...props}>
      {children}
    </span>
  );
}
