import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import styles from './Button.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables interaction */
  isLoading?: boolean;
  /** Content rendered before the button label */
  leftIcon?: ReactNode;
  /** Content rendered after the button label */
  rightIcon?: ReactNode;
  children: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Primary interactive element.
 * Always use a <button> for actions; use <a> or Next.js <Link> for navigation.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={cn(
        styles.button,
        styles[variant],
        styles[size],
        isLoading && styles.loading,
        className,
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        leftIcon && (
          <span className={styles.iconLeft} aria-hidden="true">
            {leftIcon}
          </span>
        )
      )}
      <span className={styles.label}>{children}</span>
      {!isLoading && rightIcon && (
        <span className={styles.iconRight} aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
}
